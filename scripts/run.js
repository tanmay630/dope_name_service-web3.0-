
const hre = require("hardhat");

    const main = async () => {
    const [owner, randomPerson] = await hre.ethers.getSigners();  
    const domainContractFactory = await  hre.ethers.getContractFactory('Domains');
    const domainContract = await domainContractFactory.deploy("dope");
    await domainContract.deployed();
    console.log("contract deployed to:", domainContract.address);
    console.log("contract deployed by:", owner.address);
     
        let txn = await domainContract.register("tanya", {value: hre.ethers.utils.parseEther('0.1')})
         await txn.wait();

      const domainAddress = await domainContract.getAddress('tanya');
         console.log("owner of domain:", domainAddress);

      const balance = await hre.ethers.provider.getBalance(domainContract.address);
      console.log("Contract balance:", hre.ethers.utils.formatEther(balance));   
     
     

}


const runMain = async () => {
  try {
     await main();
     process.exit(0);
  } catch(error) {
    console.log(error);
    process.exit(1);
  }
}

runMain();


