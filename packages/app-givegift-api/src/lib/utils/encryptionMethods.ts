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
export async function aesGcmDecrypt(ciphertext: string, password: string) {
  const pwUtf8 = new TextEncoder().encode(password);                                 // encode password as UTF-8
  const pwHash = await crypto.createHash('sha256').update(pwUtf8).digest();                      // hash the password

  const iv = Buffer.from((ciphertext).slice(0, 12), 'base64');                                        // decode base64 iv

  const key = pwHash;
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);


  const enc = (ciphertext).slice(12);

  let str = decipher.update(enc, 'base64', 'utf8');
  str = str + decipher.final('utf8');
  return str;
}