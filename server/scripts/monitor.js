#!/usr/bin/env node

const http = require('http');
const https = require('https');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration
const CONFIG = {
  APP_URL: process.env.APP_URL || 'http://localhost:4010',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/clubs_db',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  HEALTH_CHECK_INTERVAL: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000, // 30 seconds
  METRICS_INTERVAL: parseInt(process.env.METRICS_INTERVAL) || 60000, // 1 minute
  ALERT_THRESHOLD: {
    CPU_PERCENT: parseInt(process.env.ALERT_CPU_THRESHOLD) || 80,
    MEMORY_PERCENT: parseInt(process.env.ALERT_MEMORY_THRESHOLD) || 80,
    DISK_PERCENT: parseInt(process.env.ALERT_DISK_THRESHOLD) || 85,
    RESPONSE_TIME_MS: parseInt(process.env.ALERT_RESPONSE_TIME_MS) || 5000,
  },
  WEBHOOK_URL: process.env.ALERT_WEBHOOK_URL,
  METRICS_FILE: process.env.METRICS_FILE || './logs/metrics.json',
};

// Metrics storage
let metrics = {
  uptime: 0,
  checks: [],
  alerts: [],
  performance: {
    cpu: [],
    memory: [],
    disk: [],
    responseTime: []
  }
};

// Load existing metrics
const loadMetrics = () => {
  try {
    if (fs.existsSync(CONFIG.METRICS_FILE)) {
      const data = fs.readFileSync(CONFIG.METRICS_FILE, 'utf8');
      metrics = JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load metrics:', error);
  }
};

// Save metrics
const saveMetrics = () => {
  try {
    const dir = path.dirname(CONFIG.METRICS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG.METRICS_FILE, JSON.stringify(metrics, null, 2));
  } catch (error) {
    console.error('Failed to save metrics:', error);
  }
};

// Make HTTP request with timeout
const makeRequest = (url, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const startTime = Date.now();
    
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        resolve({
          statusCode: res.statusCode,
          responseTime,
          data: data.slice(0, 1000), // Limit response data
          headers: res.headers
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
};

// Check application health
const checkAppHealth = async () => {
  try {
    const healthUrl = `${CONFIG.APP_URL}/health`;
    const response = await makeRequest(healthUrl);
    
    const isHealthy = response.statusCode === 200;
    const check = {
      timestamp: new Date().toISOString(),
      service: 'application',
      status: isHealthy ? 'healthy' : 'unhealthy',
      responseTime: response.responseTime,
      statusCode: response.statusCode,
      details: response.data
    };
    
    metrics.checks.push(check);
    
    // Alert if response time is too high
    if (response.responseTime > CONFIG.ALERT_THRESHOLD.RESPONSE_TIME_MS) {
      await sendAlert('high_response_time', {
        service: 'application',
        responseTime: response.responseTime,
        threshold: CONFIG.ALERT_THRESHOLD.RESPONSE_TIME_MS
      });
    }
    
    // Alert if application is down
    if (!isHealthy) {
      await sendAlert('service_down', {
        service: 'application',
        statusCode: response.statusCode,
        url: healthUrl
      });
    }
    
    return check;
  } catch (error) {
    const check = {
      timestamp: new Date().toISOString(),
      service: 'application',
      status: 'error',
      error: error.message
    };
    
    metrics.checks.push(check);
    
    await sendAlert('service_error', {
      service: 'application',
      error: error.message
    });
    
    return check;
  }
};

// Check database connectivity
const checkDatabase = async () => {
  try {
    const { stdout } = await execAsync('pg_isready -d ' + CONFIG.DATABASE_URL);
    
    const check = {
      timestamp: new Date().toISOString(),
      service: 'database',
      status: 'healthy',
      details: stdout.trim()
    };
    
    metrics.checks.push(check);
    return check;
  } catch (error) {
    const check = {
      timestamp: new Date().toISOString(),
      service: 'database',
      status: 'error',
      error: error.message
    };
    
    metrics.checks.push(check);
    
    await sendAlert('database_error', {
      service: 'database',
      error: error.message
    });
    
    return check;
  }
};

// Check Redis connectivity
const checkRedis = async () => {
  try {
    const { stdout } = await execAsync('redis-cli ping');
    
    const isHealthy = stdout.trim() === 'PONG';
    const check = {
      timestamp: new Date().toISOString(),
      service: 'redis',
      status: isHealthy ? 'healthy' : 'unhealthy',
      details: stdout.trim()
    };
    
    metrics.checks.push(check);
    
    if (!isHealthy) {
      await sendAlert('redis_error', {
        service: 'redis',
        response: stdout.trim()
      });
    }
    
    return check;
  } catch (error) {
    const check = {
      timestamp: new Date().toISOString(),
      service: 'redis',
      status: 'error',
      error: error.message
    };
    
    metrics.checks.push(check);
    
    await sendAlert('redis_error', {
      service: 'redis',
      error: error.message
    });
    
    return check;
  }
};

// Get system metrics
const getSystemMetrics = async () => {
  try {
    // CPU usage
    const cpuCmd = "top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | sed 's/%us,//'";
    const { stdout: cpuOutput } = await execAsync(cpuCmd);
    const cpuUsage = parseFloat(cpuOutput.trim()) || 0;
    
    // Memory usage
    const memCmd = "free | grep Mem | awk '{printf \"%.2f\", $3/$2 * 100.0}'";
    const { stdout: memOutput } = await execAsync(memCmd);
    const memUsage = parseFloat(memOutput.trim()) || 0;
    
    // Disk usage
    const diskCmd = "df -h / | awk 'NR==2{print $5}' | sed 's/%//'";
    const { stdout: diskOutput } = await execAsync(diskCmd);
    const diskUsage = parseFloat(diskOutput.trim()) || 0;
    
    const timestamp = new Date().toISOString();
    
    // Store metrics
    metrics.performance.cpu.push({ timestamp, value: cpuUsage });
    metrics.performance.memory.push({ timestamp, value: memUsage });
    metrics.performance.disk.push({ timestamp, value: diskUsage });
    
    // Keep only last 100 entries
    if (metrics.performance.cpu.length > 100) metrics.performance.cpu.shift();
    if (metrics.performance.memory.length > 100) metrics.performance.memory.shift();
    if (metrics.performance.disk.length > 100) metrics.performance.disk.shift();
    
    // Check thresholds and send alerts
    if (cpuUsage > CONFIG.ALERT_THRESHOLD.CPU_PERCENT) {
      await sendAlert('high_cpu', { usage: cpuUsage, threshold: CONFIG.ALERT_THRESHOLD.CPU_PERCENT });
    }
    
    if (memUsage > CONFIG.ALERT_THRESHOLD.MEMORY_PERCENT) {
      await sendAlert('high_memory', { usage: memUsage, threshold: CONFIG.ALERT_THRESHOLD.MEMORY_PERCENT });
    }
    
    if (diskUsage > CONFIG.ALERT_THRESHOLD.DISK_PERCENT) {
      await sendAlert('high_disk', { usage: diskUsage, threshold: CONFIG.ALERT_THRESHOLD.DISK_PERCENT });
    }
    
    return {
      timestamp,
      cpu: cpuUsage,
      memory: memUsage,
      disk: diskUsage
    };
  } catch (error) {
    console.error('Failed to get system metrics:', error);
    return null;
  }
};

// Send alert
const sendAlert = async (type, details) => {
  const alert = {
    timestamp: new Date().toISOString(),
    type,
    details,
    severity: getSeverity(type)
  };
  
  metrics.alerts.push(alert);
  
  // Keep only last 50 alerts
  if (metrics.alerts.length > 50) {
    metrics.alerts.shift();
  }
  
  console.log(`🚨 ALERT [${alert.severity}]: ${type}`, details);
  
  // Send to webhook if configured
  if (CONFIG.WEBHOOK_URL) {
    try {
      await sendWebhook(alert);
    } catch (error) {
      console.error('Failed to send webhook:', error);
    }
  }
};

// Get alert severity
const getSeverity = (type) => {
  const criticalAlerts = ['service_down', 'database_error', 'redis_error'];
  const warningAlerts = ['high_cpu', 'high_memory', 'high_disk'];
  
  if (criticalAlerts.includes(type)) return 'critical';
  if (warningAlerts.includes(type)) return 'warning';
  return 'info';
};

// Send webhook notification
const sendWebhook = async (alert) => {
  const payload = {
    text: `🚨 Alert: ${alert.type}`,
    attachments: [
      {
        color: alert.severity === 'critical' ? 'danger' : 'warning',
        fields: [
          {
            title: 'Type',
            value: alert.type,
            short: true
          },
          {
            title: 'Severity',
            value: alert.severity,
            short: true
          },
          {
            title: 'Time',
            value: alert.timestamp,
            short: true
          },
          {
            title: 'Details',
            value: JSON.stringify(alert.details, null, 2),
            short: false
          }
        ]
      }
    ]
  };
  
  const postData = JSON.stringify(payload);
  
  return new Promise((resolve, reject) => {
    const url = new URL(CONFIG.WEBHOOK_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      resolve(res.statusCode);
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

// Generate monitoring report
const generateReport = () => {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const recentChecks = metrics.checks.filter(check => new Date(check.timestamp) > last24h);
  const recentAlerts = metrics.alerts.filter(alert => new Date(alert.timestamp) > last24h);
  
  const report = {
    timestamp: now.toISOString(),
    uptime: process.uptime(),
    summary: {
      totalChecks: recentChecks.length,
      healthyChecks: recentChecks.filter(c => c.status === 'healthy').length,
      totalAlerts: recentAlerts.length,
      criticalAlerts: recentAlerts.filter(a => a.severity === 'critical').length
    },
    services: {
      application: getServiceStatus('application', recentChecks),
      database: getServiceStatus('database', recentChecks),
      redis: getServiceStatus('redis', recentChecks)
    },
    performance: {
      cpu: getAverageMetric(metrics.performance.cpu.slice(-10)),
      memory: getAverageMetric(metrics.performance.memory.slice(-10)),
      disk: getAverageMetric(metrics.performance.disk.slice(-10))
    },
    recentAlerts: recentAlerts.slice(-5)
  };
  
  console.log('\n📊 MONITORING REPORT');
  console.log('====================');
  console.log(`Time: ${report.timestamp}`);
  console.log(`Uptime: ${Math.floor(report.uptime / 3600)}h ${Math.floor((report.uptime % 3600) / 60)}m`);
  console.log(`Checks (24h): ${report.summary.totalChecks} (${report.summary.healthyChecks} healthy)`);
  console.log(`Alerts (24h): ${report.summary.totalAlerts} (${report.summary.criticalAlerts} critical)`);
  console.log(`Services: App=${report.services.application} DB=${report.services.database} Redis=${report.services.redis}`);
  console.log(`Performance: CPU=${report.performance.cpu.toFixed(1)}% Memory=${report.performance.memory.toFixed(1)}% Disk=${report.performance.disk.toFixed(1)}%`);
  console.log('====================\n');
  
  return report;
};

// Get service status
const getServiceStatus = (service, checks) => {
  const serviceChecks = checks.filter(c => c.service === service);
  if (serviceChecks.length === 0) return 'unknown';
  
  const latestCheck = serviceChecks[serviceChecks.length - 1];
  return latestCheck.status;
};

// Get average metric
const getAverageMetric = (values) => {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val.value, 0);
  return sum / values.length;
};

// Main monitoring loop
const runMonitoring = async () => {
  console.log('🔍 Starting monitoring...');
  
  loadMetrics();
  
  // Health checks
  const healthInterval = setInterval(async () => {
    try {
      await Promise.all([
        checkAppHealth(),
        checkDatabase(),
        checkRedis()
      ]);
      
      // Clean up old checks (keep last 200)
      if (metrics.checks.length > 200) {
        metrics.checks = metrics.checks.slice(-200);
      }
      
      saveMetrics();
    } catch (error) {
      console.error('Health check failed:', error);
    }
  }, CONFIG.HEALTH_CHECK_INTERVAL);
  
  // System metrics
  const metricsInterval = setInterval(async () => {
    try {
      await getSystemMetrics();
      saveMetrics();
    } catch (error) {
      console.error('Metrics collection failed:', error);
    }
  }, CONFIG.METRICS_INTERVAL);
  
  // Generate report every 15 minutes
  const reportInterval = setInterval(generateReport, 15 * 60 * 1000);
  
  // Cleanup on exit
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping monitoring...');
    clearInterval(healthInterval);
    clearInterval(metricsInterval);
    clearInterval(reportInterval);
    saveMetrics();
    process.exit(0);
  });
  
  // Initial report
  generateReport();
};

// Run monitoring if called directly
if (require.main === module) {
  runMonitoring();
}

module.exports = {
  runMonitoring,
  checkAppHealth,
  checkDatabase,
  checkRedis,
  getSystemMetrics,
  generateReport
}; 