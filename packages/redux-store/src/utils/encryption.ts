import { crypto, PrivateKey, PublicKey } from '@abcpros/bitcore-lib-xpi';
import * as forge from 'node-forge';

// privateKey: PrivateKey
// publicKey: PublicKey
const constructMergedKey = (privateKey, publicKey) => {
  return PublicKey.fromPoint(publicKey.point.mul(privateKey.toBigNumber()));
};

const publicKeyToBuffer = pubKey => {
  const { x, y, compressed } = pubKey.toObject();
  const xBuf = Buffer.from(x, 'hex');
  const yBuf = Buffer.from(y, 'hex');
  let prefix;
  let buf;
  if (!compressed) {
    prefix = Buffer.from([0x04]);
    buf = Buffer.concat([prefix, xBuf, yBuf]);
  } else {
    const odd = yBuf[yBuf.length - 1] % 2;
    if (odd) {
      prefix = Buffer.from([0x03]);
    } else {
      prefix = Buffer.from([0x02]);
    }
    buf = Buffer.concat([prefix, xBuf]);
  }

  return buf;
};

// privateKey: WIF string,
// publicKey: hex string,
const createSharedKey = (privateKeyWIF: string, publicKeyHex: string): Buffer => {
  const publicKeyObj = PublicKey.fromBuffer(Buffer.from(publicKeyHex, 'hex'));
  const privateKeyObj = PrivateKey.fromWIF(privateKeyWIF);

  const mergedKey = constructMergedKey(privateKeyObj, publicKeyObj);
  // const rawMergedKey = mergedKey.toBuffer(); // this function throws assertion error sometimes
  const rawMergedKey = publicKeyToBuffer(mergedKey);
  const sharedKey = crypto.Hash.sha256(rawMergedKey);
  return sharedKey;
};

// Todo: Later should remove node-forge
// return a Promise
// sharedKey: Buffer, plainText: Uint8Array
const encrypt = (sharedKey: Buffer, plainText: Uint8Array) => {
  // Split shared key
  const iv = forge.util.createBuffer(sharedKey.slice(0, 16));
  const key = forge.util.createBuffer(sharedKey.slice(16));

  // Encrypt entries
  const cipher = forge.cipher.createCipher('AES-CBC', key);
  cipher.start({ iv });
  const rawBuffer = forge.util.createBuffer(plainText);
  cipher.update(rawBuffer);
  cipher.finish();
  const cipherText = Uint8Array.from(Buffer.from(cipher.output.toHex(), 'hex'));

  return cipherText;
};

// return a Promise
// sharedKey: Buffer, plainText: Uint8Array
const decrypt = (sharedKey: Buffer, cipherText: Uint8Array) => {
  // Split shared key
  const iv = forge.util.createBuffer(sharedKey.slice(0, 16));
  const key = forge.util.createBuffer(sharedKey.slice(16));

  // Encrypt entries
  const cipher = forge.cipher.createDecipher('AES-CBC', key);
  cipher.start({ iv });
  const rawBuffer = forge.util.createBuffer(cipherText);
  cipher.update(rawBuffer);
  cipher.finish();
  const plainText = Uint8Array.from(Buffer.from(cipher.output.toHex(), 'hex'));
  return plainText;
};

export { createSharedKey, encrypt, decrypt };
