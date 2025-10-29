const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

class EncryptionService {
  constructor() {
    this.key = this.getEncryptionKey();
  }

  getEncryptionKey() {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    
    if (key.length !== KEY_LENGTH) {
      // Hash the key to ensure it's the right length
      return crypto.createHash('sha256').update(key).digest();
    }
    
    return Buffer.from(key, 'utf8');
  }

  encrypt(text) {
    try {
      const iv = crypto.randomBytes(IV_LENGTH);
      const cipher = crypto.createCipher(ALGORITHM, this.key);
      cipher.setAAD(Buffer.from('botlace-hipaa', 'utf8'));
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted: encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      throw new Error('Encryption failed: ' + error.message);
    }
  }

  decrypt(encryptedData) {
    try {
      const { encrypted, iv, tag } = encryptedData;
      
      const decipher = crypto.createDecipher(ALGORITHM, this.key);
      decipher.setAAD(Buffer.from('botlace-hipaa', 'utf8'));
      decipher.setAuthTag(Buffer.from(tag, 'hex'));
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error('Decryption failed: ' + error.message);
    }
  }

  // Hash sensitive data for indexing while maintaining privacy
  hashForIndex(data) {
    return crypto.createHash('sha256').update(data + process.env.HASH_SALT || 'botlace-salt').digest('hex');
  }

  // Generate secure random tokens
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Encrypt PHI (Protected Health Information)
  encryptPHI(phi) {
    if (!phi) return null;
    
    const encrypted = this.encrypt(JSON.stringify(phi));
    return {
      data: encrypted,
      encrypted: true,
      timestamp: new Date().toISOString()
    };
  }

  // Decrypt PHI
  decryptPHI(encryptedPHI) {
    if (!encryptedPHI || !encryptedPHI.encrypted) {
      return encryptedPHI;
    }
    
    try {
      const decrypted = this.decrypt(encryptedPHI.data);
      return JSON.parse(decrypted);
    } catch (error) {
      throw new Error('Failed to decrypt PHI: ' + error.message);
    }
  }

  // Create deterministic encryption for duplicate detection
  deterministicEncrypt(data, context = '') {
    const contextualKey = crypto.createHash('sha256')
      .update(this.key)
      .update(context)
      .digest();
    
    const iv = crypto.createHash('md5').update(data + context).digest();
    const cipher = crypto.createCipheriv('aes-256-cbc', contextualKey, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return encrypted;
  }
}

const encryptionService = new EncryptionService();

module.exports = {
  encryptData: (data) => encryptionService.encrypt(data),
  decryptData: (encryptedData) => encryptionService.decrypt(encryptedData),
  encryptPHI: (phi) => encryptionService.encryptPHI(phi),
  decryptPHI: (encryptedPHI) => encryptionService.decryptPHI(encryptedPHI),
  hashForIndex: (data) => encryptionService.hashForIndex(data),
  generateSecureToken: (length) => encryptionService.generateSecureToken(length),
  deterministicEncrypt: (data, context) => encryptionService.deterministicEncrypt(data, context)
};