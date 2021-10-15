
export const encryptMnemonic = async (algorithm: AesCtrParams, key: CryptoKey, data: BufferSource) => {
  const encrypted = await window.crypto.subtle.encrypt(algorithm, key, data);
  return new Uint8Array(encrypted);
}

export const decryptMnemonic = async (algorithm: AesCtrParams, key: CryptoKey, data: BufferSource) => {
  let decrypted = await window.crypto.subtle.decrypt(algorithm, key, data);
  let dec = new TextDecoder();
  return dec.decode(decrypted);
}