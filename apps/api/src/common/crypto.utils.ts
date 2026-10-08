import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const DEFAULT_KEY = process.env.ENCRYPTION_KEY || 'subvault_aes_256_secret_key_prod_32ch!';

function getKey(keyStr: string): Buffer {
  return crypto.createHash('sha256').update(keyStr).digest();
}

export function encryptData(text: string, customKey?: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(customKey || DEFAULT_KEY), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

export function decryptData(encryptedString: string, customKey?: string): string {
  try {
    const parts = encryptedString.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted payload format');
    }
    const [ivHex, tagHex, cipherText] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(customKey || DEFAULT_KEY), iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(cipherText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error: any) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `pbkdf2:${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    if (storedHash.startsWith('pbkdf2:')) {
      const [, salt, originalHash] = storedHash.split(':');
      const hashToVerify = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
      return hashToVerify === originalHash;
    }
    return false;
  } catch {
    return false;
  }
}
