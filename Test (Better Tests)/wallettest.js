const Dex = artifacts.require("Dex")
const Link = artifacts.require("Link")
const truffleAssert = require('truffle-assertions');

//In the first section, we call the contract function, 
//with the contract name, Dex, as an argument.
//The second argument is a function which receives an argument of the accounts array, 
//which is sent into this function.

contract.skip("Dex", accounts => {
     //in here, we can make tests 
    //everything within this contract function will be run with 
    //a single set of deployed contracts,
    //and for each contract statement/instruction , 
    //it will deploy our contract again another time
    //and all the tests will be run
    //we make a new test by wtiting "it", and in parenthese and quotes 
    //there is information about it/the test, which should be like a sentece.
    //The second argument is a function without arguments
    it("should only be possible for owner to add tokens", async () => {
         //in here we write our test, and we can add a lot of code from our migration file,
      //for example from 3_token_migration.js, the first 5 lines of instructions
      //in the module.exports function
  
        let dex = await Dex.deployed()
        let link = await Link.deployed()
        //in the lesson, the next line does not have "await"
         //We add the LINK token to the contract
         //It should only be possible for the owner to add tokens
         //so that means that we want to try it with the zero account
         //If this test is correct, the next line of code should work,
         //we need to use normal Mocha statements to show if it is true
         //to do this, we use a library called Truffle Assertions
        await truffleAssert.passes(
            dex.addToken(web3.utils.fromUtf8("LINK"), link.address, {from: accounts[0]})
        )
        
        //When we call this as a non-owner, it should fail
//We can call from account 1, which is not the owner, and it should fail
//reverts replaces asserts, and account 1 replaces account 0
        await truffleAssert.reverts(
            dex.addToken(web3.utils.fromUtf8("AAVE"), link.address, {from: accounts[1]})
        )
    })
     //We can make another test
    it("should handle deposits correctly", async () => {
         //in here we write our test, and we can add a lot of code from our migration file,
  //for example from 3_token_migration.js, the first 5 lines of instructions
  //in the module.exports function
        let dex = await Dex.deployed()
        let link = await Link.deployed()
        
        await link.approve(dex.address, 500);
        await dex.deposit(100, web3.utils.fromUtf8("LINK"));
        let balance = await dex.balances(accounts[0], web3.utils.fromUtf8("LINK"))
        assert.equal( balance.toNumber(), 100 )
    })
    it("should handle faulty withdrawals correctly", async () => {
        let dex = await Dex.deployed()
        let link = await Link.deployed()
             //in the lesson, the next line does not have "await"
     //We add the LINK token to the contract
     //It should only be possible for the owner to add tokens
     //so that means that we want to try it with the zero account
     //If this test is correct, the next line of code should work,
     //we need to use normal Mocha statements to show if it is true
     //to do this, we use a library called Truffle Assertions

     //assert comes with the Truffle library, we can use the normal Mocha assert
     //this compares the 2 arguments
        await truffleAssert.reverts(dex.withdraw(500, web3.utils.fromUtf8("LINK")))
    })
    
     //We can make another test
    it("should handle correct withdrawals correctly", async () => {
          //in here we write our test, and we can add a lot of code from our migration file,
  //for example from 3_token_migration.js, the first 5 lines of instructions
  //in the module.exports function
        let dex = await Dex.deployed()
        let link = await Link.deployed()
           //in the lesson, the next line does not have "await"
     //We add the LINK token to the contract
     //It should only be possible for the owner to add tokens
     //so that means that we want to try it with the zero account
     //If this test is correct, the next line of code should work,
     //we need to use normal Mocha statements to show if it is true
     //to do this, we use a library called Truffle Assertions

     //assert comes with the Truffle library, we can use the normal Mocha assert
     //this compares the 2 arguments
        await truffleAssert.passes(dex.withdraw(100, web3.utils.fromUtf8("LINK")))
    })
    it("should deposit the correct amount of ETH", async () => {
        let dex = await Dex.deployed()
        let link = await Link.deployed()
        await dex.depositEth({value: 1000});
        let balance = await dex.balances(accounts[0], web3.utils.fromUtf8("ETH"))
        assert.equal(balance.toNumber(), 1000);
    })
    it("should withdraw the correct amount of ETH", async () => {
        let dex = await Dex.deployed()
        let link = await Link.deployed()
        await dex.withdrawEth(1000);
        let balance = await dex.balances(accounts[0], web3.utils.fromUtf8("ETH"))
        assert.equal(balance.toNumber(), 0);
    })
    it("should not allow over-withdrawing of ETH", async () => {
        let dex = await Dex.deployed()
        let link = await Link.deployed()
        await truffleAssert.reverts(dex.withdrawEth(100));
    })
})
