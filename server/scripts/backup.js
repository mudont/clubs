#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration
const CONFIG = {
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/clubs_db',
  BACKUP_DIR: process.env.BACKUP_DIR || './backups',
  S3_BUCKET: process.env.S3_BACKUP_BUCKET,
  MAX_LOCAL_BACKUPS: parseInt(process.env.MAX_LOCAL_BACKUPS) || 7,
  RETENTION_DAYS: parseInt(process.env.BACKUP_RETENTION_DAYS) || 30,
};

// Create backup directory if it doesn't exist
const createBackupDir = async () => {
  if (!fs.existsSync(CONFIG.BACKUP_DIR)) {
    fs.mkdirSync(CONFIG.BACKUP_DIR, { recursive: true });
  }
};

// Generate backup filename with timestamp
const generateBackupFilename = (type) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${type}_backup_${timestamp}.sql`;
};

// Database backup
const backupDatabase = async () => {
  try {
    console.log('Starting database backup...');
    
    const backupFilename = generateBackupFilename('database');
    const backupPath = path.join(CONFIG.BACKUP_DIR, backupFilename);
    
    // Extract database info from connection string
    const dbUrl = new URL(CONFIG.DATABASE_URL);
    const dbName = dbUrl.pathname.slice(1);
    const dbUser = dbUrl.username;
    const dbPassword = dbUrl.password;
    const dbHost = dbUrl.hostname;
    const dbPort = dbUrl.port || 5432;
    
    // Create pg_dump command
    const dumpCommand = `PGPASSWORD="${dbPassword}" pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} --no-password --clean --create > "${backupPath}"`;
    
    await execAsync(dumpCommand);
    
    console.log(`Database backup completed: ${backupPath}`);
    
    // Compress the backup
    const compressedPath = `${backupPath}.gz`;
    await execAsync(`gzip "${backupPath}"`);
    
    console.log(`Database backup compressed: ${compressedPath}`);
    
    return compressedPath;
  } catch (error) {
    console.error('Database backup failed:', error);
    throw error;
  }
};

// File backup (uploads, logs, etc.)
const backupFiles = async () => {
  try {
    console.log('Starting file backup...');
    
    const backupFilename = `files_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.tar.gz`;
    const backupPath = path.join(CONFIG.BACKUP_DIR, backupFilename);
    
    // Directories to backup
    const dirsToBackup = [
      './uploads',
      './logs',
      './public/uploads'
    ].filter(dir => fs.existsSync(dir));
    
    if (dirsToBackup.length === 0) {
      console.log('No files to backup');
      return null;
    }
    
    const tarCommand = `tar -czf "${backupPath}" ${dirsToBackup.join(' ')}`;
    await execAsync(tarCommand);
    
    console.log(`File backup completed: ${backupPath}`);
    
    return backupPath;
  } catch (error) {
    console.error('File backup failed:', error);
    throw error;
  }
};

// Upload backup to S3 (if configured)
const uploadToS3 = async (filePath) => {
  if (!CONFIG.S3_BUCKET) {
    console.log('S3 bucket not configured, skipping upload');
    return;
  }
  
  try {
    console.log(`Uploading ${filePath} to S3...`);
    
    const fileName = path.basename(filePath);
    const s3Key = `backups/${new Date().toISOString().split('T')[0]}/${fileName}`;
    
    const uploadCommand = `aws s3 cp "${filePath}" s3://${CONFIG.S3_BUCKET}/${s3Key}`;
    await execAsync(uploadCommand);
    
    console.log(`Upload to S3 completed: s3://${CONFIG.S3_BUCKET}/${s3Key}`);
  } catch (error) {
    console.error('S3 upload failed:', error);
    throw error;
  }
};

// Clean up old backups
const cleanupOldBackups = async () => {
  try {
    console.log('Cleaning up old backups...');
    
    const files = fs.readdirSync(CONFIG.BACKUP_DIR);
    const backupFiles = files
      .filter(file => file.includes('backup_'))
      .map(file => ({
        name: file,
        path: path.join(CONFIG.BACKUP_DIR, file),
        stats: fs.statSync(path.join(CONFIG.BACKUP_DIR, file))
      }))
      .sort((a, b) => b.stats.mtime - a.stats.mtime);
    
    // Remove old backups beyond retention limit
    const filesToDelete = backupFiles.slice(CONFIG.MAX_LOCAL_BACKUPS);
    
    for (const file of filesToDelete) {
      const ageInDays = (Date.now() - file.stats.mtime) / (1000 * 60 * 60 * 24);
      if (ageInDays > CONFIG.RETENTION_DAYS) {
        fs.unlinkSync(file.path);
        console.log(`Deleted old backup: ${file.name}`);
      }
    }
    
    console.log('Cleanup completed');
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
};

// Verify backup integrity
const verifyBackup = async (backupPath) => {
  try {
    console.log(`Verifying backup: ${backupPath}`);
    
    if (backupPath.endsWith('.gz')) {
      await execAsync(`gzip -t "${backupPath}"`);
    } else if (backupPath.endsWith('.tar.gz')) {
      await execAsync(`tar -tzf "${backupPath}" > /dev/null`);
    }
    
    console.log('Backup verification passed');
    return true;
  } catch (error) {
    console.error('Backup verification failed:', error);
    return false;
  }
};

// Send notification about backup status
const sendNotification = async (success, message, details = {}) => {
  try {
    // You can integrate with your notification service here
    // For now, we'll just log
    const status = success ? 'SUCCESS' : 'FAILED';
    const logMessage = `Backup ${status}: ${message}`;
    
    console.log(logMessage);
    
    if (details.error) {
      console.error('Error details:', details.error);
    }
    
    // Example: Send to Slack, email, or other notification service
    // await sendToSlack(logMessage);
    // await sendEmail(logMessage);
    
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};

// Main backup function
const performBackup = async () => {
  const startTime = Date.now();
  let dbBackupPath = null;
  let fileBackupPath = null;
  
  try {
    console.log('Starting backup process...');
    
    // Create backup directory
    await createBackupDir();
    
    // Backup database
    dbBackupPath = await backupDatabase();
    
    // Backup files
    fileBackupPath = await backupFiles();
    
    // Verify backups
    const dbVerified = dbBackupPath ? await verifyBackup(dbBackupPath) : true;
    const filesVerified = fileBackupPath ? await verifyBackup(fileBackupPath) : true;
    
    if (!dbVerified || !filesVerified) {
      throw new Error('Backup verification failed');
    }
    
    // Upload to S3 if configured
    if (dbBackupPath) {
      await uploadToS3(dbBackupPath);
    }
    if (fileBackupPath) {
      await uploadToS3(fileBackupPath);
    }
    
    // Clean up old backups
    await cleanupOldBackups();
    
    const duration = (Date.now() - startTime) / 1000;
    const message = `Backup completed successfully in ${duration}s`;
    
    await sendNotification(true, message, {
      databaseBackup: dbBackupPath,
      fileBackup: fileBackupPath,
      duration
    });
    
    console.log(message);
    
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    const message = `Backup failed after ${duration}s`;
    
    await sendNotification(false, message, {
      error: error.message,
      duration
    });
    
    console.error(message, error);
    process.exit(1);
  }
};

// Run backup if called directly
if (require.main === module) {
  performBackup();
}

module.exports = {
  performBackup,
  backupDatabase,
  backupFiles,
  cleanupOldBackups,
  verifyBackup
}; 