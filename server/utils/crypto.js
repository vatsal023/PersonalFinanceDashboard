const crypto = require('crypto');

// console.log("Loaded ENCRYPTION_KEY:", process.env.ENCRYPTION_KEY);
// console.log("Length:", process.env.ENCRYPTION_KEY.length);

// if (!process.env.ENCRYPTION_KEY) {
//   console.log("Encryption key not found in environment variables.");
//   throw new Error('ENCRYPTION_KEY environment variable is not set');
// }
const ALGO = 'aes-256-gcm';
const ENCRYPTIONKEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const IV_LENGTH = 12;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, ENCRYPTIONKEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decrypt(payload) {
  const [ivHex, tagHex, encryptedHex] = payload.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGO, ENCRYPTIONKEY, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

module.exports = { encrypt, decrypt };
