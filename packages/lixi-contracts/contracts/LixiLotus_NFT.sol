// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract LixiLotus_NFT is Context, Ownable, ERC721Enumerable, ERC721Pausable, ERC721Burnable {
  using Counters for Counters.Counter;
  using EnumerableSet for EnumerableSet.AddressSet;

  string private _baseTokenURI;

  /** @notice Token ID counter declared */
  Counters.Counter private _tokenIds;

  /** @notice Mapping to track number of mints per address */
  mapping(address => uint256) public userMintCount;

  constructor() ERC721("Lixi Lotus Love", "LLL") {
    console.log("constructor");
    _baseTokenURI = "https://lixilotus.test/";
  }

  function _baseURI() internal view virtual override returns (string memory) {
    return _baseTokenURI;
  }

  function mintNFT(address receiver) public virtual onlyOwner returns (uint256) {
    _tokenIds.increment();

    uint256 newItemId = _tokenIds.current();
    _mint(receiver, newItemId);

    console.log(newItemId);
    return newItemId;
  }

  /**
   * @dev Pauses all token transfers and mint
   */
  function pause() external onlyOwner {
    _pause();
  }

  /**
   * @dev Unpauses all token transfers and mint.
   */
  function unpause() external onlyOwner {
    _unpause();
  }

  function totalMintCount() external view returns (uint256) {
    return _tokenIds.current();
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 tokenId
  ) internal virtual override(ERC721, ERC721Enumerable, ERC721Pausable) {
    super._beforeTokenTransfer(from, to, tokenId);
  }

  /**
   * @dev See {IERC165-supportsInterface}.
   */
  function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721Enumerable) returns (bool) {
    return super.supportsInterface(interfaceId);
  }
}
