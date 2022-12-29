import { currency } from '@bcpros/lixi-components/components/Common/Ticker';
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

  const satoshisToTip = satoshisToBurn.multipliedBy(0.04);

  let remainder: BigNumber = new BigNumber(totalInputUtxoValue).minus(satoshisToBurn).minus(txFee);
  try {
    // amount to send back to the remainder address.
    tipToAddresseses.map(item => {
      if (item.address !== changeAddress) {
        remainder = new BigNumber(remainder).minus(satoshisToTip);
      } else {
        remainder = new BigNumber(remainder);
      }
    });

    if (remainder.lt(0)) {
      throw new Error(`Insufficient funds`);
    }

    const burnOutputScript = generateBurnOpReturnScript(
      0x01,
      burnType ? true : false,
      burnForType,
      burnedBy,
      burnForId
    );
    txBuilder.addOutput(burnOutputScript, parseInt(satoshisToBurn.toString()));

    tipToAddresseses.forEach(item => {
      if (item.address && item.address !== changeAddress) {
        txBuilder.addOutput(item.address, parseInt(satoshisToTip.toString()));
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
