import hre, { ethers } from "hardhat";
async function main() {
  const PortfolioManagerFactory = await ethers.getContractFactory(
    "PortfolioManager"
  );

  const PortfolioManager = await PortfolioManagerFactory.deploy({
    gasLimit: 10000000,
  });
  await PortfolioManager.waitForDeployment();
  console.log(
    "PortfolioManager deployed to:",
    await PortfolioManager.getAddress()
  );

  await new Promise((resolve) => setTimeout(resolve, 10000));

  await verify({
    address: await PortfolioManager.getAddress(),
    deployTransaction: {
      args: [],
    },
  });
}

const verify = async (contract: {
  address: any;
  deployTransaction: { args: any };
}) => {
  await hre.run("verify:verify", {
    address: contract.address,
    constructorArguments: contract.deployTransaction.args,
  });
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
