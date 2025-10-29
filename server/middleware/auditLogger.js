const winston = require('winston');
const crypto = require('crypto');
const path = require('path');

// HIPAA-compliant audit logging middleware
class HIPAAAuditLogger {
  constructor() {
    this.auditLogger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'botlace-audit' },
      transports: [
        new winston.transports.File({ 
          filename: path.join(__dirname, '../../logs/audit.log'),
          maxsize: 10485760, // 10MB
          maxFiles: 10,
          tailable: true
        }),
        new winston.transports.File({ 
          filename: path.join(__dirname, '../../logs/hipaa-audit.log'),
          maxsize: 10485760,
          maxFiles: 50, // Keep more audit files for compliance
          tailable: true
        })
      ]
    });

    // Ensure logs directory exists
    const fs = require('fs');
    const logsDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  // Middleware function for Express
  middleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      const originalSend = res.send;
      
      // Capture response
      res.send = function(data) {
        const responseTime = Date.now() - startTime;
        
        // Log the request/response
        this.auditLogger.logAPIAccess({
          method: req.method,
          url: req.originalUrl,
          userAgent: req.get('User-Agent'),
          ip: req.ip || req.connection.remoteAddress,
          userId: req.user?.id,
          userRole: req.user?.role,
          statusCode: res.statusCode,
          responseTime: responseTime,
          timestamp: new Date().toISOString(),
          sessionId: req.sessionID,
          requestId: req.headers['x-request-id'] || crypto.randomUUID()
        });

        originalSend.call(this, data);
      }.bind(this);

      next();
    };
  }

  logAPIAccess(details) {
    this.auditLogger.info('API_ACCESS', {
      eventType: 'API_ACCESS',
      ...details,
      auditId: crypto.randomUUID()
    });
  }

  logDataAccess(details) {
    this.auditLogger.info('DATA_ACCESS', {
      eventType: 'DATA_ACCESS',
      ...details,
      auditId: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    });
  }

  logDataCreation(details) {
    this.auditLogger.info('DATA_CREATION', {
      eventType: 'DATA_CREATION',
      ...details,
      auditId: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    });
  }

  logDataModification(details) {
    this.auditLogger.info('DATA_MODIFICATION', {
      eventType: 'DATA_MODIFICATION',
      ...details,
      auditId: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    });
  }

  logDataDeletion(details) {
    this.auditLogger.info('DATA_DELETION', {
      eventType: 'DATA_DELETION',
      ...details,
      auditId: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    });
  }

  logAuthentication(details) {
    this.auditLogger.info('AUTHENTICATION', {
      eventType: 'AUTHENTICATION',
      ...details,
      auditId: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    });
  }

  logAuthorization(details) {
    this.auditLogger.info('AUTHORIZATION', {
      eventType: 'AUTHORIZATION',
      ...details,
      auditId: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    });
  }

  logSecurityEvent(details) {
    this.auditLogger.warn('SECURITY_EVENT', {
      eventType: 'SECURITY_EVENT',
      ...details,
      auditId: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    });
  }

  logSystemEvent(details) {
    this.auditLogger.info('SYSTEM_EVENT', {
      eventType: 'SYSTEM_EVENT',
      ...details,
      auditId: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    });
  }

  logComplianceEvent(details) {
    this.auditLogger.info('COMPLIANCE_EVENT', {
      eventType: 'COMPLIANCE_EVENT',
      ...details,
      auditId: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    });
  }

  // Generate compliance reports
  async generateComplianceReport(startDate, endDate, eventTypes = []) {
    return new Promise((resolve, reject) => {
      const fs = require('fs');
      const readline = require('readline');
      
      const auditFile = path.join(__dirname, '../../logs/hipaa-audit.log');
      const events = [];
      
      if (!fs.existsSync(auditFile)) {
        return resolve([]);
      }

      const fileStream = fs.createReadStream(auditFile);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });

      rl.on('line', (line) => {
        try {
          const event = JSON.parse(line);
          const eventDate = new Date(event.timestamp);
          
          if (eventDate >= new Date(startDate) && eventDate <= new Date(endDate)) {
            if (eventTypes.length === 0 || eventTypes.includes(event.eventType)) {
              events.push(event);
            }
          }
        } catch (error) {
          // Skip invalid JSON lines
        }
      });

      rl.on('close', () => {
        resolve(events);
      });

      rl.on('error', (error) => {
        reject(error);
      });
    });
  }

  // Detect potential security anomalies
  async detectAnomalies() {
    const events = await this.generateComplianceReport(
      new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      new Date()
    );

    const anomalies = [];

    // Detect unusual access patterns
    const accessByUser = {};
    const accessByIP = {};

    events.forEach(event => {
      if (event.eventType === 'API_ACCESS') {
        // Track access by user
        if (event.userId) {
          accessByUser[event.userId] = (accessByUser[event.userId] || 0) + 1;
        }
        
        // Track access by IP
        if (event.ip) {
          accessByIP[event.ip] = (accessByIP[event.ip] || 0) + 1;
        }
      }
    });

    // Flag users with unusually high access
    Object.entries(accessByUser).forEach(([userId, count]) => {
      if (count > 1000) { // Threshold for suspicious activity
        anomalies.push({
          type: 'HIGH_ACCESS_VOLUME',
          userId: userId,
          count: count,
          severity: 'HIGH'
        });
      }
    });

    // Flag IPs with unusually high access
    Object.entries(accessByIP).forEach(([ip, count]) => {
      if (count > 500) {
        anomalies.push({
          type: 'HIGH_IP_ACCESS',
          ip: ip,
          count: count,
          severity: 'MEDIUM'
        });
      }
    });

    // Detect failed authentication attempts
    const failedAuth = events.filter(e => 
      e.eventType === 'AUTHENTICATION' && e.success === false
    );

    if (failedAuth.length > 50) {
      anomalies.push({
        type: 'HIGH_FAILED_AUTH',
        count: failedAuth.length,
        severity: 'HIGH'
      });
    }

    return anomalies;
  }
}

const auditLogger = new HIPAAAuditLogger();

// Export both the class instance and middleware function
module.exports = auditLogger.middleware();
module.exports.auditLogger = auditLogger;