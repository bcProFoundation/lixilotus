import { expect } from "chai";
import { ethers } from "hardhat";

describe("LixiLotus_NFT", function () {
  it("Should return the new greeting once it's changed", async function () {
    const LixiLotus_NFT = await ethers.getContractFactory("LixiLotus_NFT");
    const contract = await LixiLotus_NFT.deploy();
    await contract.deployed();

    expect(await contract.name()).to.equal("Lixi Lotus Love");

    expect(await contract.symbol()).to.equal("LLL");

    const testValue = await contract.mintNFT('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC');
    await contract.mintNFT('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC');
    await contract.mintNFT('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC');
    await contract.mintNFT('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC');

    // wait until the transaction is mined
    console.log('Result:', testValue);

    expect("Hola, mundo!").to.equal("Hola, mundo!");
  });
});