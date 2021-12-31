import { TextEncoder } from "util";
import crypto from 'crypto';

/**
 * Decrypts ciphertext encrypted with aesGcmEncrypt() using supplied password.
 *
 * @param   {String} ciphertext - Ciphertext to be decrypted.
 * @param   {String} password - Password to use to decrypt ciphertext.
 * @returns {String} Decrypted plaintext.
 *
 * @example
 *   const plaintext = await aesGcmDecrypt(ciphertext, 'pw');
 *   aesGcmDecrypt(ciphertext, 'pw').then(function(plaintext) { console.log(plaintext); });
 */
export async function aesGcmDecrypt(ciphertext: string, password: string): Promise<string> {
  const pwUtf8 = new TextEncoder().encode(password);                         // encode password as UTF-8
  const pwHash = await crypto.createHash('sha256').update(pwUtf8).digest();  // hash the password

  const cipherBuffer = Buffer.from(ciphertext, 'base64');
  const iv = cipherBuffer.slice(0, 12);          // decode base64 iv

  const key = pwHash;
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);

  const ct = cipherBuffer.slice(12, -16);
  const authTag = Buffer.from(cipherBuffer.slice(-16));

  const decryptedBuffer = decipher.update(ct);
  decipher.setAuthTag(authTag);
  decipher.final();
  return decryptedBuffer.toString();
}

export async function aesGcmEncrypt(plaintext: string, password: string): Promise<string> {
  const pwUtf8 = new TextEncoder().encode(password);                         // encode password as UTF-8
  const pwHash = await crypto.createHash('sha256').update(pwUtf8).digest();  // hash the password

  const iv = crypto.randomBytes(12);
  const key = pwHash;

  const ptUint8 = new TextEncoder().encode(plaintext);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encryptedBuffer = cipher.update(ptUint8);
  cipher.final();

  const encryptedResult = Buffer.concat([iv, encryptedBuffer, cipher.getAuthTag()]);
  return encryptedResult.toString('base64');
}

export function base62ToNumber(text: string): number {
  const base = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = 0;
  for (let i = 0; i < text.length; i++) {
    const p = base.indexOf(text[i]);
    if (p < 0) {
      return NaN;
    }
    result += p * Math.pow(base.length, text.length - i - 1);
  }
  return result;
}

export async function hexSha256(text: string): Promise<string> {
  const txtUtf8 = new TextEncoder().encode(text);
  const txtHash = await crypto.createHash('sha256').update(txtUtf8).digest();
  return txtHash.toString('hex');
}