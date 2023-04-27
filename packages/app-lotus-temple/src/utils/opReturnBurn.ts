import { currency } from '@components/Common/Ticker';
import { BurnForType, BurnType } from '@bcpros/lixi-models/lib/burn';
import BCHJS from '@bcpros/xpi-js';
import BigNumber from 'bignumber.js';

const OP_0: number = 0x00;
const OP_16: number = 0x60;
const OP_RETURN: number = 0x6a;
const OP_PUSHDATA1: number = 0x4c;
const OP_PUSHDATA2: number = 0x4d;
const OP_PUSHDATA4: number = 0x4e;

export interface ParseBurnResult {
  version: number;
  burnType: BurnType;
  burnForType: BurnForType;
  burnedBy: string;
  burnForId: string;
}

export const parseBurnOutput = (scriptpubkey: Buffer | string): ParseBurnResult => {
  if (typeof scriptpubkey === 'string') {
    scriptpubkey = Buffer.from(scriptpubkey, 'hex');
  }

  let it: number = 0; // position in itObj
  let itObj: Buffer = scriptpubkey; // object it refers to

  const PARSE_CHECK = (v: boolean, str: string): void => {
    if (v) {
      throw Error(str);
    }
  };

  const extractU8 = (): BigNumber => {
    const r: number = itObj.readUInt8(it);
    it += 1;
    return new BigNumber(r);
  };

  const extractU16 = (): BigNumber => {
    const r: number = itObj.readUInt16LE(it);
    it += 2;
    return new BigNumber(r);
  };

  const extractU32 = (): BigNumber => {
    const r: number = itObj.readUInt32LE(it);
    it += 4;
    return new BigNumber(r);
  };

  const extractU64 = (): BigNumber => {
    const r1: number = itObj.readUInt32LE(it);
    it += 4;

    const r2: number = itObj.readUInt32LE(it);
    it += 4;

    return new BigNumber(r2).multipliedBy(2 ** 32).plus(r1);
  };

  PARSE_CHECK(itObj.length === 0, 'scriptpubkey cannot be empty');
  PARSE_CHECK(itObj[it] !== OP_RETURN, 'scriptpubkey not op_return');
  PARSE_CHECK(itObj.length < 10, 'scriptpubkey too small');
  ++it;

  const extractPushdata = (): number => {
    if (it === itObj.length) {
      return -1;
    }

    const cnt: number = extractU8().toNumber();
    if (cnt > OP_0 && cnt < OP_PUSHDATA1) {
      if (it + cnt > itObj.length) {
        --it;
        return -1;
      }

      return cnt;
    } else if (cnt === OP_PUSHDATA1) {
      if (it + 1 >= itObj.length) {
        --it;
        return -1;
      }
      return extractU8().toNumber();
    } else if (cnt === OP_PUSHDATA2) {
      if (it + 2 >= itObj.length) {
        --it;
        return -1;
      }
      return extractU16().toNumber();
    } else if (cnt === OP_PUSHDATA4) {
      if (it + 4 >= itObj.length) {
        --it;
        return -1;
      }
      return extractU32().toNumber();
    }

    // other opcodes not allowed
    --it;
    return -1;
  };

  const bufferToBigNumber = (): BigNumber => {
    if (itObj.length === 1) return extractU8();
    if (itObj.length === 2) return extractU16();
    if (itObj.length === 4) return extractU32();
    if (itObj.length === 8) return extractU64();
    throw new Error('extraction of number from buffer failed');
  };

  const chunks: Buffer[] = [];
  for (let len = extractPushdata(); len >= 0; len = extractPushdata()) {
    const buf: Buffer = itObj.slice(it, it + len);
    PARSE_CHECK(it + len > itObj.length, 'pushdata data extraction failed');

    it += len;
    chunks.push(buf);

    if (chunks.length === 1) {
      const lokadIdStr = chunks[0];
      PARSE_CHECK(lokadIdStr.length !== 5, 'lokad id wrong size');
      PARSE_CHECK(
        lokadIdStr[0] !== 'L'.charCodeAt(0) ||
          lokadIdStr[1] !== 'I'.charCodeAt(0) ||
          lokadIdStr[2] !== 'X'.charCodeAt(0) ||
          lokadIdStr[3] !== 'I'.charCodeAt(0) ||
          lokadIdStr[4] !== 0x00,
        'LIXI not in first chunk'
      );
    }
  }

  PARSE_CHECK(it !== itObj.length, 'trailing data');
  PARSE_CHECK(chunks.length === 0, 'chunks empty');

  let cit = 0;
  const CHECK_NEXT = (): void => {
    ++cit;
    PARSE_CHECK(cit === chunks.length, 'parsing ended early');
    it = 0;
    itObj = chunks[cit];
  };
  CHECK_NEXT(); // for quick exit check done above

  const versionBuf = itObj.reverse();
  PARSE_CHECK(versionBuf.length !== 1 && versionBuf.length !== 2, 'version string length must be 1 or 2');
  const version: number = bufferToBigNumber().toNumber();
  PARSE_CHECK(![0x01].includes(version), 'unknown version');

  CHECK_NEXT();
  const action = itObj.toString();
  PARSE_CHECK(action !== 'BURN', 'Invalid burn identifier');

  CHECK_NEXT();
  const burnTypeBuf = itObj;
  PARSE_CHECK(burnTypeBuf.length !== 1, 'brunType string length must be 1');
  const burnType = bufferToBigNumber().toNumber();

  CHECK_NEXT();
  const burnForTypeBuf = itObj.reverse();
  PARSE_CHECK(burnForTypeBuf.length !== 8, 'burnForType length must be 8');
  const burnForType: number = bufferToBigNumber().toNumber();

  CHECK_NEXT();
  const burnedBy = itObj.toString('hex');

  CHECK_NEXT();
  const burnForId = itObj.toString();

  const result: ParseBurnResult = {
    version,
    burnType,
    burnForType,
    burnedBy,
    burnForId
  };
  return result;
};

export const pushdata = (buf: Buffer | Uint8Array): Buffer => {
  if (buf.length === 0) {
    return Buffer.from([OP_PUSHDATA1, 0x00]);
  } else if (buf.length < OP_PUSHDATA1) {
    return Buffer.concat([Buffer.from([buf.length]), buf]);
  } else if (buf.length < 0xff) {
    return Buffer.concat([Buffer.from([OP_PUSHDATA1, buf.length]), buf]);
  } else if (buf.length < 0xffff) {
    const tmp = Buffer.allocUnsafe(2);
    tmp.writeUInt16LE(buf.length, 0);
    return Buffer.concat([Buffer.from([OP_PUSHDATA2]), tmp, buf]);
  } else if (buf.length < 0xffffffff) {
    const tmp = Buffer.allocUnsafe(4);
    tmp.writeUInt32LE(buf.length, 0);
    return Buffer.concat([Buffer.from([OP_PUSHDATA4]), tmp, buf]);
  } else {
    throw new Error('does not support bigger pushes yet');
  }
};

export const BNToInt64BE = (bn: BigNumber): Buffer => {
  if (!bn.isInteger()) {
    throw new Error('bn not an integer');
  }

  if (!bn.isPositive()) {
    throw new Error('bn not positive integer');
  }

  const h = bn.toString(16);
  if (h.length > 16) {
    throw new Error('bn outside of range');
  }

  return Buffer.from(h.padStart(16, '0'), 'hex');
};

export const generateBurnOpReturnScript = (
  version: number,
  burnType: boolean,
  burnForType: number,
  burnedBy: string | Buffer,
  burnForId: string
): Buffer => {
  if (![0x01].includes(version)) {
    throw new Error('unknown versionType');
  }

  if (typeof burnedBy === 'string') {
    if (!burnedBy.match(/^[0-9a-fA-F]{40}$/)) {
      throw new Error('burnedBy must be hex');
    }
    burnedBy = Buffer.from(burnedBy, 'hex');
  }

  const burnForTypeBn = new BigNumber(burnForType);

  const buf = Buffer.concat([
    Buffer.from([0x6a]), // OP_RETURN
    pushdata(Buffer.from('LIXI\0')),
    pushdata(Buffer.from([version])), // versionType
    pushdata(Buffer.from('BURN')),
    pushdata(Buffer.from([burnType ? 1 : 0])),
    pushdata(BNToInt64BE(burnForTypeBn)),
    pushdata(burnedBy),
    pushdata(Buffer.from(burnForId))
  ]);

  return buf;
};

export const generateBurnTxOutput = (
  XPI: BCHJS,
  feeInSatsPerByte: number,
  satoshisToBurn: BigNumber,
  burnType: BurnType,
  burnForType: BurnForType,
  burnedBy: string | Buffer,
  burnForId: string,
  totalInputUtxoValue: BigNumber,
  changeAddress: string,
  txFee: number,
  txBuilder: any,
  tipToAddresseses?: { address: string; amount: string }[]
) => {
  if (!XPI || !satoshisToBurn || !txFee || !txBuilder) {
    throw new Error('Invalid tx input parameters');
  }

  let remainder: BigNumber = new BigNumber(totalInputUtxoValue).minus(satoshisToBurn).minus(txFee);

  try {
    // amount to send back to the remainder address.
    tipToAddresseses.map(item => {
      if (item.address !== changeAddress) {
        remainder = remainder.minus(item.amount);
      }
    });

    const burnOutputScript = generateBurnOpReturnScript(
      0x01,
      burnType ? true : false,
      burnForType,
      burnedBy,
      burnForId
    );

    // Minus the op_return fee
    remainder = remainder.minus(burnOutputScript.length * feeInSatsPerByte);

    if (remainder.lt(0)) {
      throw new Error(`Insufficient funds`);
    }
    txBuilder.addOutput(burnOutputScript, parseInt(satoshisToBurn.toString()));

    tipToAddresseses &&
      tipToAddresseses.forEach(item => {
        if (item.address && item.address !== changeAddress) {
          txBuilder.addOutput(item.address, parseInt(item.amount.toString()));
        }
      });

    // if a remainder exists, return to change address as the final output
    if (remainder.gte(new BigNumber(currency.dustSats))) {
      txBuilder.addOutput(changeAddress, parseInt(remainder.toString()));
    }

    return txBuilder;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
