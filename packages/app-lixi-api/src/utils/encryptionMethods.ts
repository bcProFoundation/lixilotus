import { TextEncoder } from 'util';
import crypto from 'crypto';
import moment from 'moment';

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
  const pwUtf8 = new TextEncoder().encode(password); // encode password as UTF-8
  const pwHash = await crypto.createHash('sha256').update(pwUtf8).digest(); // hash the password

  const cipherBuffer = Buffer.from(ciphertext, 'base64');
  const iv = cipherBuffer.slice(0, 12); // decode base64 iv

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
  const pwUtf8 = new TextEncoder().encode(password); // encode password as UTF-8
  const pwHash = await crypto.createHash('sha256').update(pwUtf8).digest(); // hash the password

  const iv = crypto.randomBytes(12);
  const key = pwHash;

  const ptUint8 = new TextEncoder().encode(plaintext);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encryptedBuffer = cipher.update(ptUint8);
  cipher.final();

  const encryptedResult = Buffer.concat([iv, encryptedBuffer, cipher.getAuthTag()]);
  return encryptedResult.toString('base64');
}

export function base58ToNumber(text: string): number {
  const base = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
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

export function numberToBase58(input: number): string {
  let n = input;

  if (n === 0) {
    return '0';
  }

  const base = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

  let result = '';
  while (n > 0) {
    result = base[n % base.length] + result;
    n = Math.floor(n / base.length);
  }

  return result;
}

export async function hexSha256(text: string | Buffer): Promise<string> {
  const txtUtf8 = typeof text === 'string' ? new TextEncoder().encode(text + moment.now()) : text;
  const momentHash = crypto.createHash('sha256').update(moment.now().toString()).digest();
  const txtHash = crypto
    .createHash('sha256')
    .update(typeof txtUtf8 === typeof Uint8Array ? txtUtf8 : Buffer.concat([txtUtf8, momentHash]))
    .digest();

  return txtHash.toString('hex');
}
/**
 *
 * @param {number} length The length of string to generate
 * @returns base58 random string (should be use in claim code)
 */
export function generateRandomBase58Str(length: number): string {
  const base = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'.split('');
  const array = new Uint8Array(crypto.randomBytes(length));
  let str = '';
  for (var i = 0; i < array.length; i++) {
    str += base[array[i] % base.length];
  }
  return str;
}
export async function hashMnemonic(mnemonic: string): Promise<string> {
  const mnemonicUtf8 = new TextEncoder().encode(mnemonic); // encode mnemonic as UTF-8
  const mnemonicHashBuffer = await crypto.createHash('sha256').update(mnemonicUtf8).digest(); // hash the mnemonic
  const mnemonicHash = Buffer.from(new Uint8Array(mnemonicHashBuffer)).toString('hex');
  return mnemonicHash;
}
