// BUILD Factory Contract Address (shared by all projects)
export const BUILD_FACTORY_ADDRESS = "0xEd587067E15bCED0F7226133FaCD65248939c6bA";

// Contract ABIs
export const BUILD_FACTORY_ABI = [
  "function getProjectSeasonConfig(address token, uint256 seasonId) view returns (tuple(uint256 tokenAmount, bytes32 merkleRoot, uint40 unlockDelay, uint40 unlockDuration, uint40 earlyVestRatioMinBps, uint40 earlyVestRatioMaxBps, uint16 baseTokenClaimBps, bool isRefunding), uint256 seasonUnlockStartTime)",
  "function getTokenAmounts(address token) view returns (tuple(uint256 totalDeposited, uint256 totalWithdrawn, uint256 totalAllocatedToAllSeasons, uint256 totalRefunded))"
];

export const BUILD_CLAIM_ABI = [
  "function getGlobalState(uint256[] seasonIds) view returns (tuple(uint256 totalLoyalty, uint256 totalLoyaltyIneligible, uint256 totalClaimed)[])",
  "function getCurrentClaimValues(address user, tuple(uint256 seasonId, uint256 maxTokenAmount)[] seasonIdsAndMaxTokenAmounts) view returns (tuple(uint256 base, uint256 bonus, uint256 vested, uint256 claimable, uint256 earlyVestableBonus, uint256 loyaltyBonus, uint256 claimed)[])",
  "function getUserState(tuple(address user, uint256 seasonId)[] usersAndSeasonIds) view returns (tuple(uint256 claimed, bool hasEarlyClaimed)[])"
];

// 9 BUILD Projects with their details
export const BUILD_PROJECTS = [
  {
    projectId: 1,
    seasonId: 1,
    name: "Space and Time",
    ticker: "SXT",
    tokenAddress: "0xe6bfd33f52d82ccb5b37e16d3dd81f9ffdabb195",
    claimAddress: "0xfed8d071c2ca87bc9ab95fa9efb64fa092d4e527",
    decimals: 18,
  },
  {
    projectId: 2,
    seasonId: 1,
    name: "Dolomite",
    ticker: "DOLO",
    tokenAddress: "0x0f81001ef0a83ecce5ccebf63eb302c70a39a654",
    claimAddress: "0x2f41d42de3eab9e75f3d417259f24421771fb700",
    decimals: 18,
  },
  {
    projectId: 3,
    seasonId: 1,
    name: "Brickken",
    ticker: "BKN",
    tokenAddress: "0x0a638f07acc6969abf392bb009f216d22adea36d",
    claimAddress: "0x6bb8108475453f5e33f97a195a0a1413463cdc8c",
    decimals: 18,
  },
  {
    projectId: 4,
    seasonId: 1,
    name: "bitsCrunch",
    ticker: "BCUT",
    tokenAddress: "0xbef26bd568e421d6708cca55ad6e35f8bfa0c406",
    claimAddress: "0xa98571832fd3b6e136b72fb90013bb886d562586",
    decimals: 18,
  },
  {
    projectId: 5,
    seasonId: 1,
    name: "Folks Finance",
    ticker: "FOLKS",
    tokenAddress: "0xff7f8f301f7a706e3cfd3d2275f5dc0b9ee8009b",
    claimAddress: "0x6e768a40f97f586b11a7dae6bb8e5d970e82d9ff",
    decimals: 6,
  },
  {
    projectId: 6,
    seasonId: 1,
    name: "Mind Network",
    ticker: "FHE",
    tokenAddress: "0xd55c9fb62e176a8eb6968f32958fefdd0962727e",
    claimAddress: "0x6d1d5af3ace2219912b6cbf2b6278002f676e518",
    decimals: 18,
  },
  {
    projectId: 7,
    seasonId: 1,
    name: "Suku",
    ticker: "SUKU",
    tokenAddress: "0x0763fdccf1ae541a5961815c0872a8c5bc6de4d7",
    claimAddress: "0xbe91d37adbf9f399d59d2025e885df45a13865be",
    decimals: 18,
  },
  {
    projectId: 8,
    seasonId: 1,
    name: "Truflation",
    ticker: "TRUF",
    tokenAddress: "0x243c9be13faba09f945ccc565547293337da0ad7",
    claimAddress: "0xe5716a166b54fef9b4b17e06f56f63dec1b1c882",
    decimals: 18,
  },
  {
    projectId: 9,
    seasonId: 1,
    name: "XSwap",
    ticker: "XSWAP",
    tokenAddress: "0x8fe815417913a93ea99049fc0718ee1647a2a07c",
    claimAddress: "0xc3973da4cdc48abfc12b382fbdeab29658990d0f",
    decimals: 18,
  },
];

// Project registry map (for backend - keyed by lowercase token address)
export const PROJECTS_MAP = BUILD_PROJECTS.reduce((acc, project) => {
  return {
    ...acc,
    [project.tokenAddress.toLowerCase()]: {
      name: project.ticker,
      decimals: project.decimals,
      claimAddress: project.claimAddress
    }
  };
}, {});

