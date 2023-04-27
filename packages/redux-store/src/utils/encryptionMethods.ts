/**
 * Encrypts plaintext using AES-GCM with supplied password, for decryption with aesGcmDecrypt().
 * @param {String} plaintext Plaintext to be encrypted.
 * @param {String} password Password to use to encrypt plaintext.
 * @returns {String} Encrypted ciphertext
 */
export async function aesGcmEncrypt(plaintext: string, password: string): Promise<string> {
  const pwUtf8 = new TextEncoder().encode(password); // encode password as UTF-8
  const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8); // hash the password

  const iv = crypto.getRandomValues(new Uint8Array(12)); // get 96-bit random iv
  const ivStr = Array.from(iv)
    .map(b => String.fromCharCode(b))
    .join(''); // iv as utf-16 string

  const alg: AesGcmParams = { name: 'AES-GCM', iv: iv, tagLength: 128 }; // specify algorithm to use

  const key: CryptoKey = await crypto.subtle.importKey('raw', pwHash, alg, false, ['encrypt']); // generate key from pw

  const ptUint8 = new TextEncoder().encode(plaintext); // encode plaintext as UTF-8
  const ctBuffer = await crypto.subtle.encrypt(alg, key, ptUint8); // encrypt plaintext using key

  const ctArray = Array.from(new Uint8Array(ctBuffer)); // ciphertext as byte array
  const ctStr = ctArray.map(byte => String.fromCharCode(byte)).join(''); // ciphertext as string

  return btoa(ivStr + ctStr); // iv+ciphertext base64-encoded
}

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
  const pwUtf8 = new TextEncoder().encode(password); // encode password as UTF-8
  const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8); // hash the password

  const ivStr = atob(ciphertext).slice(0, 12); // decode base64 iv
  const iv = new Uint8Array(Array.from(ivStr).map(ch => ch.charCodeAt(0))); // iv as Uint8Array

  const alg: AesGcmParams = { name: 'AES-GCM', iv: iv, tagLength: 128 }; // specify algorithm to use

  const key: CryptoKey = await crypto.subtle.importKey('raw', pwHash, alg, false, ['decrypt']); // generate key from pw

  const ctStr = atob(ciphertext).slice(12); // decode base64 ciphertext
  const ctUint8 = new Uint8Array(Array.from(ctStr).map(ch => ch.charCodeAt(0))); // ciphertext as Uint8Array
  // note: why doesn't ctUint8 = new TextEncoder().encode(ctStr) work?

  try {
    const plainBuffer = await crypto.subtle.decrypt(alg, key, ctUint8); // decrypt ciphertext using key
    const plaintext = new TextDecoder().decode(plainBuffer); // plaintext from ArrayBuffer
    return plaintext; // return the plaintext
  } catch (e) {
    throw new Error('Decrypt failed');
  }
}

/**
 *
 * @param {number} length The length of string to generate
 * @returns base58 random string (should be use in claim code)
 */
export function generateRandomBase58Str(length: number): string {
  const base = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'.split('');
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  let str = '';
  for (let i = 0; i < array.length; i++) {
    str += base[array[i] % base.length];
  }
  return str;
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
