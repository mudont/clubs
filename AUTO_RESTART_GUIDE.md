# Docker Auto-Restart Guide

## Current Configuration ✅

Your Docker containers **WILL automatically restart** after a server reboot because all services are configured with:

```yaml
restart: unless-stopped
```

## Restart Policies Explained

### Current Policy: `unless-stopped`

- ✅ **Restarts on failure**: Container crashes → automatic restart
- ✅ **Restarts on reboot**: Server reboots → containers start automatically
- ✅ **Respects manual stops**: If you manually stop a container, it won't restart on reboot
- ✅ **Best for production**: Balances automation with manual control

### Other Available Policies

```yaml
restart: "no"          # Never restart (default)
restart: always        # Always restart, even if manually stopped
restart: on-failure    # Only restart on failure (exit code != 0)
restart: unless-stopped # Current setting - best for production
```

## Verification Commands

### Check Current Restart Policy

```bash
# View restart policies
docker-compose --env-file .env.production ps

# Detailed container info
docker inspect clubs-app-1 | grep -A 5 "RestartPolicy"
```

### Test Auto-Restart Behavior

```bash
# Simulate container crash
docker kill clubs-app-1

# Container should restart automatically within seconds
docker-compose --env-file .env.production ps

# Simulate server reboot (containers will start on boot)
sudo reboot
```

## Ensuring Docker Starts on Boot

### Enable Docker Service (Most Systems)

```bash
# Enable Docker to start on boot
sudo systemctl enable docker

# Check Docker service status
sudo systemctl status docker

# Start Docker if not running
sudo systemctl start docker
```

### For Different Operating Systems

#### Ubuntu/Debian

```bash
sudo systemctl enable docker
sudo systemctl enable containerd
```

#### CentOS/RHEL

```bash
sudo systemctl enable docker
sudo chkconfig docker on
```

#### macOS (Docker Desktop)

- Docker Desktop → Settings → General → "Start Docker Desktop when you log in"

#### Windows (Docker Desktop)

- Docker Desktop → Settings → General → "Start Docker Desktop when you log in"

## Enhanced Auto-Start Setup

### Option 1: Systemd Service (Recommended)

Create a systemd service for your application:

```bash
# Create service file
sudo nano /etc/systemd/system/clubs-app.service
```

```ini
[Unit]
Description=Clubs Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/your/clubs/project
ExecStart=/usr/local/bin/docker-compose --env-file .env.production up -d
ExecStop=/usr/local/bin/docker-compose --env-file .env.production down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
# Enable the service
sudo systemctl enable clubs-app.service

# Start the service
sudo systemctl start clubs-app.service

# Check status
sudo systemctl status clubs-app.service
```

### Option 2: Cron Job on Reboot

```bash
# Edit crontab
crontab -e

# Add this line
@reboot cd /path/to/your/clubs/project && docker-compose --env-file .env.production up -d
```

### Option 3: Init Script

Create `/etc/init.d/clubs-app`:

```bash
#!/bin/bash
# clubs-app        Clubs Application
# chkconfig: 35 99 99
# description: Clubs Docker Application

. /etc/rc.d/init.d/functions

USER="root"
DAEMON="clubs-app"
ROOT_DIR="/path/to/your/clubs/project"

SERVER="$ROOT_DIR/docker-compose --env-file .env.production"
LOCK_FILE="/var/lock/subsys/clubs-app"

do_start() {
    if [ ! -f "$LOCK_FILE" ] ; then
        echo -n "Starting $DAEMON: "
        runuser -l "$USER" -c "$SERVER up -d" && echo_success || echo_failure
        RETVAL=$?
        echo
        [ $RETVAL -eq 0 ] && touch $LOCK_FILE
    else
        echo "$DAEMON is locked."
    fi
}
do_stop() {
    echo -n $"Shutting down $DAEMON: "
    pid=$(ps -aefw | grep "$DAEMON" | grep -v " grep " | awk '{print $2}')
    kill -9 $pid > /dev/null 2>&1
    [ $? -eq 0 ] && echo_success || echo_failure
    echo
    rm -f $LOCK_FILE
}

case "$1" in
    start)
        do_start
        ;;
    stop)
        do_stop
        ;;
    restart)
        do_stop
        do_start
        ;;
    *)
        echo "Usage: $0 {start|stop|restart}"
        RETVAL=1
esac

exit $RETVAL
```

## Monitoring and Health Checks

### Create a Health Check Script

```bash
# Create monitoring script
nano scripts/health-monitor.sh
```

```bash
#!/bin/bash

# Health monitoring script
HEALTH_URL="http://localhost:12410/health"
LOG_FILE="/var/log/clubs-health.log"

check_health() {
    if curl -f "$HEALTH_URL" > /dev/null 2>&1; then
        echo "$(date): ✅ Application healthy" >> "$LOG_FILE"
        return 0
    else
        echo "$(date): ❌ Application unhealthy - attempting restart" >> "$LOG_FILE"
        cd /path/to/your/clubs/project
        docker-compose --env-file .env.production restart app
        return 1
    fi
}

check_health
```

### Add to Crontab for Regular Monitoring

```bash
# Check health every 5 minutes
*/5 * * * * /path/to/your/clubs/project/scripts/health-monitor.sh
```

## Troubleshooting Auto-Restart Issues

### Common Problems

1. **Docker service not enabled**

   ```bash
   sudo systemctl enable docker
   ```

2. **Containers in wrong state**

   ```bash
   # Check container status
   docker ps -a

   # Remove stopped containers
   docker-compose --env-file .env.production down
   docker-compose --env-file .env.production up -d
   ```

3. **Permission issues**

   ```bash
   # Fix Docker permissions
   sudo usermod -aG docker $USER
   newgrp docker
   ```

4. **Environment file not found**
   ```bash
   # Ensure .env.production exists and is readable
   ls -la .env.production
   ```

### Debug Commands

```bash
# Check Docker daemon status
sudo systemctl status docker

# Check container restart count
docker stats --no-stream

# View container restart history
docker events --filter container=clubs-app-1

# Check system logs for Docker
journalctl -u docker.service -f
```

## Best Practices for Production

1. **Use `unless-stopped` restart policy** ✅ (Already configured)
2. **Enable Docker service on boot** ✅
3. **Set up monitoring and alerting**
4. **Regular health checks**
5. **Log rotation for container logs**
6. **Backup automation**
7. **Update procedures that preserve uptime**

## Testing Your Setup

### Complete Restart Test

```bash
# 1. Deploy your application
npm run deploy:prod

# 2. Verify it's running
curl http://localhost:12410/health

# 3. Simulate server reboot
sudo reboot

# 4. After reboot, check if containers started automatically
docker-compose --env-file .env.production ps

# 5. Verify application is accessible
curl http://localhost:12410/health
```

## Summary

✅ **Your containers WILL restart automatically** after server reboot
✅ **Current configuration is production-ready**
✅ **Additional monitoring options available for extra reliability**

The `restart: unless-stopped` policy ensures your application stays running through reboots and failures while still allowing manual control when needed.
