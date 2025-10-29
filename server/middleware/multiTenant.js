const Clinic = require('../models/Clinic');
const logger = require('../utils/logger');

// Multitenant middleware to enforce data isolation
const multiTenantMiddleware = () => {
  return async (req, res, next) => {
    try {
      // Skip for certain routes
      const skipRoutes = ['/api/auth/login', '/api/auth/register', '/api/health', '/api/webhook'];
      if (skipRoutes.some(route => req.path.startsWith(route))) {
        return next();
      }

      // Get clinic ID from user or request
      let clinicId = null;
      
      if (req.user && req.user.clinicId) {
        clinicId = req.user.clinicId;
      } else if (req.headers['x-clinic-id']) {
        clinicId = req.headers['x-clinic-id'];
      } else if (req.body.clinicId) {
        clinicId = req.body.clinicId;
      }

      if (!clinicId) {
        return res.status(400).json({
          error: 'Clinic ID is required',
          code: 'MISSING_CLINIC_ID'
        });
      }

      // Validate clinic exists and is active
      const clinic = await Clinic.findById(clinicId);
      if (!clinic) {
        return res.status(404).json({
          error: 'Clinic not found',
          code: 'CLINIC_NOT_FOUND'
        });
      }

      if (clinic.status !== 'active') {
        return res.status(403).json({
          error: 'Clinic is not active',
          code: 'CLINIC_INACTIVE',
          status: clinic.status
        });
      }

      // Check subscription status
      if (!clinic.isSubscriptionActive()) {
        return res.status(402).json({
          error: 'Subscription expired or inactive',
          code: 'SUBSCRIPTION_INACTIVE',
          subscriptionStatus: clinic.subscription.status
        });
      }

      // Add clinic context to request
      req.clinic = clinic;
      req.clinicId = clinicId;

      // Add tenant filter to all database queries
      req.tenantFilter = { clinicId: clinicId };

      // Log tenant access
      logger.logHealthcareEvent('TENANT_ACCESS', null, {
        clinicId: clinicId,
        userId: req.user?.id,
        endpoint: req.originalUrl,
        method: req.method
      });

      next();
    } catch (error) {
      logger.error('Multitenant middleware error:', error);
      res.status(500).json({
        error: 'Internal server error',
        code: 'MULTITENANT_ERROR'
      });
    }
  };
};

// Middleware to check feature access
const featureAccessMiddleware = (featureName) => {
  return (req, res, next) => {
    if (!req.clinic) {
      return res.status(400).json({
        error: 'Clinic context required',
        code: 'NO_CLINIC_CONTEXT'
      });
    }

    if (!req.clinic.hasFeature(featureName)) {
      return res.status(403).json({
        error: `Feature '${featureName}' not available in current subscription`,
        code: 'FEATURE_NOT_AVAILABLE',
        currentTier: req.clinic.subscription.tier,
        requiredFeature: featureName
      });
    }

    next();
  };
};

// Middleware to check usage limits
const usageLimitMiddleware = (limitType) => {
  return async (req, res, next) => {
    try {
      if (!req.clinic) {
        return res.status(400).json({
          error: 'Clinic context required',
          code: 'NO_CLINIC_CONTEXT'
        });
      }

      const limits = req.clinic.getSubscriptionLimits();
      const usage = req.clinic.usage;

      let exceeded = false;
      let message = '';

      switch (limitType) {
        case 'providers':
          if (limits.maxProviders > 0 && usage.currentProviders >= limits.maxProviders) {
            exceeded = true;
            message = `Provider limit reached (${limits.maxProviders})`;
          }
          break;
        
        case 'patients':
          if (limits.maxPatients > 0 && usage.currentPatients >= limits.maxPatients) {
            exceeded = true;
            message = `Patient limit reached (${limits.maxPatients})`;
          }
          break;
        
        case 'storage':
          if (limits.maxStorage > 0 && usage.storageUsed >= limits.maxStorage) {
            exceeded = true;
            message = `Storage limit reached (${limits.maxStorage}MB)`;
          }
          break;
        
        case 'api':
          if (limits.maxApiCalls > 0 && usage.apiCalls >= limits.maxApiCalls) {
            exceeded = true;
            message = `API call limit reached (${limits.maxApiCalls})`;
          }
          break;
      }

      if (exceeded) {
        return res.status(429).json({
          error: message,
          code: 'USAGE_LIMIT_EXCEEDED',
          limitType: limitType,
          currentUsage: usage[limitType === 'api' ? 'apiCalls' : `current${limitType.charAt(0).toUpperCase() + limitType.slice(1)}`],
          limit: limits[`max${limitType.charAt(0).toUpperCase() + limitType.slice(1)}`]
        });
      }

      next();
    } catch (error) {
      logger.error('Usage limit middleware error:', error);
      res.status(500).json({
        error: 'Internal server error',
        code: 'USAGE_LIMIT_ERROR'
      });
    }
  };
};

// Middleware to track API usage
const apiUsageTracker = () => {
  return async (req, res, next) => {
    if (req.clinic) {
      try {
        await req.clinic.updateUsage('apiCalls', 1);
      } catch (error) {
        logger.error('API usage tracking error:', error);
        // Don't fail the request for tracking errors
      }
    }
    next();
  };
};

// Database query helpers for multitenant operations
const addTenantFilter = (query, clinicId) => {
  if (typeof query === 'object' && query !== null) {
    query.clinicId = clinicId;
  }
  return query;
};

const createTenantAwareModel = (Model) => {
  return class TenantAwareModel extends Model {
    static find(query = {}, options = {}) {
      if (this.req && this.req.clinicId) {
        query = addTenantFilter(query, this.req.clinicId);
      }
      return super.find(query, options);
    }

    static findOne(query = {}, options = {}) {
      if (this.req && this.req.clinicId) {
        query = addTenantFilter(query, this.req.clinicId);
      }
      return super.findOne(query, options);
    }

    static findById(id, options = {}) {
      const query = { _id: id };
      if (this.req && this.req.clinicId) {
        query.clinicId = this.req.clinicId;
      }
      return super.findOne(query, options);
    }

    static create(doc) {
      if (this.req && this.req.clinicId) {
        if (Array.isArray(doc)) {
          doc = doc.map(d => ({ ...d, clinicId: this.req.clinicId }));
        } else {
          doc = { ...doc, clinicId: this.req.clinicId };
        }
      }
      return super.create(doc);
    }
  };
};

// Utility function to get tenant-safe aggregation pipeline
const getTenantAggregationPipeline = (clinicId, additionalStages = []) => {
  return [
    { $match: { clinicId: clinicId } },
    ...additionalStages
  ];
};

module.exports = {
  multiTenantMiddleware,
  featureAccessMiddleware,
  usageLimitMiddleware,
  apiUsageTracker,
  addTenantFilter,
  createTenantAwareModel,
  getTenantAggregationPipeline
};