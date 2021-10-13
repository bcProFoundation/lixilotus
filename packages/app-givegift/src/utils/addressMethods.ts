export interface AddressInfo {
  address: string;
  isValid: boolean;
};

export function parseAddress(XPI: any, addressString: string): AddressInfo {

  const addressInfo: AddressInfo = {
    address: '',
    isValid: false
  };
  // Parse address string for parameters
  const paramCheck = addressString.split('?');
  let cleanAddress = paramCheck[0];
  addressInfo.address = cleanAddress;

  let isValidAddress;

  try {
    isValidAddress = XPI.Address.isXAddress(cleanAddress);
  } catch (err) {
    isValidAddress = false;
  }

  addressInfo.isValid = isValidAddress;

  return addressInfo;
}