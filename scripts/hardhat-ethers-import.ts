import "@nomicfoundation/hardhat-ethers";
import * as hardhat from "hardhat";

// Cast to any to avoid type errors with hardhat runtime
const hre = hardhat as any;
export const ethers = hre.ethers;