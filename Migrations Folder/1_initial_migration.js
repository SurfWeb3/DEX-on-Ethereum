const Migrations = artifacts.require("Migrations");

//artifact.require is used to import the contract

//Migrations is the Smart Contract

module.exports = function(deployer) {
  //deployer is a Tuffle object used to deploy the contract which we imported
  deployer.deploy(Migrations);
};
