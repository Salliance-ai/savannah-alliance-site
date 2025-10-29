import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../types/index.js';
import { AuthRequest } from './auth.js';

// HIPAA Compliance Middleware
export function hipaaAuditLog(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const originalSend = res.send.bind(res);
  
  res.send = function (body: any) {
    // Log PHI access
    const phiAccessed = detectPHIAccess(req, body);
    
    if (phiAccessed) {
      const auditLog: Partial<AuditLog> = {
        tenantId: req.user?.tenantId || 'unknown',
        userId: req.user?.id,
        action: `${req.method} ${req.path}`,
        resourceType: detectResourceType(req.path),
        resourceId: req.params.id || req.params.patientId || 'unknown',
        ipAddress: req.ip || req.headers['x-forwarded-for'] as string,
        userAgent: req.headers['user-agent'],
        timestamp: new Date(),
        compliance: {
          hipaaCompliant: true,
          phiAccessed: phiAccessed,
          anonymized: shouldAnonymize(req.path),
        },
        metadata: {
          query: req.query,
          bodyKeys: Object.keys(req.body || {}),
        },
      };

      // In production, persist to audit log database
      console.log('[HIPAA Audit]', JSON.stringify(auditLog, null, 2));
    }

    return originalSend(body);
  };

  next();
}

function detectPHIAccess(req: Request, responseBody: any): boolean {
  const phiIndicators = [
    'patient', 'medical', 'diagnosis', 'treatment', 'allergy',
    'medication', 'vital', 'appointment', 'encounter', 'note',
  ];

  const path = req.path.toLowerCase();
  const bodyStr = JSON.stringify(responseBody).toLowerCase();

  return phiIndicators.some(indicator => 
    path.includes(indicator) || bodyStr.includes(indicator)
  );
}

function detectResourceType(path: string): string {
  if (path.includes('/patient')) return 'Patient';
  if (path.includes('/encounter')) return 'Encounter';
  if (path.includes('/note')) return 'ClinicalNote';
  if (path.includes('/appointment')) return 'Appointment';
  return 'Unknown';
}

function shouldAnonymize(path: string): boolean {
  // Certain endpoints should always anonymize in logs
  const anonymizePaths = ['/analytics', '/reports', '/intelligence'];
  return anonymizePaths.some(p => path.includes(p));
}

// Data encryption middleware (simplified - in production, use proper encryption)
export function encryptPHI(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // In production, implement proper field-level encryption
  // This is a placeholder for encryption logic
  next();
}

// Rate limiting for API protection
export function createRateLimiter(windowMs: number, maxRequests: number) {
  const requestCounts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.user?.id || req.ip || 'anonymous';
    const now = Date.now();

    let record = requestCounts.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      requestCounts.set(key, record);
      next();
      return;
    }

    if (record.count >= maxRequests) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
      return;
    }

    record.count++;
    next();
  };
}
