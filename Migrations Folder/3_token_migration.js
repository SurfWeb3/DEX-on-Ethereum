const Link = artifacts.require("Link");
const Dex = artifacts.require("Dex");

//artifact.require is used to import the contract

//Migrations is the Smart Contract

module.exports = async function(deployer, network, accounts) {
  //deployer is a Tuffle object used to deploy the contract which we imported
//"LINK" MEANS THE CRYPTO LINK 
  await deployer.deploy(Link);
  //THE INSTRUCTIONS BELOW WERE STOPPED, BECAUSE IT IS BETTER TO DO THESE ACTIONS 
//IN THE TESTING SOFTWARE, AND USE THIS FILE'S CODE TO JUST MIGRATE THE TOKEN
//   let dex = await Dex.deployed()
//   let link = await Link.deployed()
//
//         //we want to approve wallet:
      //in the lesson link.approve is brfore wallet2.addToken
//   await link.approve(dex.address, 500)
   //we add token:
//   await dex.addToken(web3.utils.fromUtf8("LINK"), link.address)

    //and we want to deposit:
//   await dex.deposit(100, web3.utils.fromUtf8("LINK"))
//   let balanceOfLink = await dex.balances(accounts[0], web3.utils.fromUtf8("LINK"));
//   console.log(balanceOfLink);
  
};
