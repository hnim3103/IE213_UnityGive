import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Deploying UnityGive Contract...");

  const UnityGive = await ethers.getContractFactory("UnityGive");
  const unityGive = await UnityGive.deploy();
  await unityGive.waitForDeployment();

  const address = await unityGive.getAddress();
  console.log(`UnityGive deployed to: ${address}`);

  // Paths
  const frontendEnvPath = path.join(__dirname, "../../frontend/.env");
  const backendEnvPath = path.join(__dirname, "../../backend/.env");
  const artifactPath = path.join(__dirname, "../artifacts/contracts/UnityGive.sol/UnityGive.json");
  const frontendAbiPath = path.join(__dirname, "../../frontend/src/lib/UnityGive.json");
  const backendAbiPath = path.join(__dirname, "../../backend/src/lib/UnityGive.json");

  // Helper to update .env
  const updateEnv = (envPath: string, key: string, newValue: string) => {
    if (fs.existsSync(envPath)) {
      let content = fs.readFileSync(envPath, "utf8");
      const regex = new RegExp(`^${key}=.*$`, "m");
      if (regex.test(content)) {
        // Handle quotes for VITE_CONTRACT_ADDRESS if they exist
        if (content.match(new RegExp(`^${key}=".*"$`, "m"))) {
           content = content.replace(regex, `${key}="${newValue}"`);
        } else {
           content = content.replace(regex, `${key}=${newValue}`);
        }
      } else {
        content += `\n${key}=${newValue}\n`;
      }
      fs.writeFileSync(envPath, content);
      console.log(`Updated ${key} in ${path.basename(path.dirname(envPath))}/.env`);
    } else {
      console.warn(`Could not find ${envPath}`);
    }
  };

  // Update .env files
  updateEnv(frontendEnvPath, "VITE_CONTRACT_ADDRESS", address);
  updateEnv(backendEnvPath, "CONTRACT_ADDRESS", address);

  // Copy ABI
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abiFileContent = JSON.stringify({ abi: artifact.abi }, null, 2);
    
    fs.writeFileSync(frontendAbiPath, abiFileContent);
    fs.writeFileSync(backendAbiPath, abiFileContent);
    console.log("Copied ABI to frontend and backend");
  } else {
    console.warn("Could not find compiled ABI. Please run 'npx hardhat compile' first.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
