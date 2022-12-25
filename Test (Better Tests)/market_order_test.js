const Dex = artifacts.require("Dex")
const Link = artifacts.require("Link")
const truffleAssert = require('truffle-assertions');

contract("Dex", accounts => {
    //When creating a SELL market order, the seller needs to have enough tokens for the trade
    it("Should throw an error when creating a sell market order without adequate token balance", async () => {
         //We get the DEX
        let dex = await Dex.deployed()
         //make a balance variable
        let balance = await dex.balances(accounts[0], web3.utils.fromUtf8("LINK"))
        //Assert that balance is zero. 
//The assert instruction tests if a particular thing is true
//(the balance is zero).
//If that thing is not true (balance is not zero), 
//an error message is sent (balance is not 0).
        assert.equal( balance.toNumber(), 0, "Initial LINK balance is not 0" );
        //Make a test sell-market-order for 10 LINK.
//For this to be done, I need to have 10 LINK.
        await truffleAssert.reverts(
            dex.createMarketOrder(1, web3.utils.fromUtf8("LINK"), 10)
        )
    })
    //Market orders can be submitted even if the order book is empty
      //For a buy market order, the buyer needs to have enough ETH.
    it("Market orders can be submitted even if the order book is empty", async () => {
        let dex = await Dex.deployed()
          //Deposit ETH to buy LINK. In this instruction, it is 50,000 wei.
        await dex.depositEth({value: 50000});

        let orderbook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), 0); //Get buy side orderbook
        //Assert that the order book is empty with length == 0, and that
//the call createMarketOrder passes.
        assert(orderbook.length == 0, "Buy side Orderbook length is not 0");
        
        await truffleAssert.passes(
            dex.createMarketOrder(0, web3.utils.fromUtf8("LINK"), 10)
        )
    })
    //Market orders should be filled until the order book is empty or the market order is 100% filled
    it("Market orders should not fill more limit orders than the market order amount", async () => {
         //Market orders should be done until the order book is empty, 
    //or until the market order is 100% completed.
    //Only complete as many limit orders as the is an amoun in a connected market order.
        /Market orders can be submitted even if the order book is empty
        let dex = await Dex.deployed()
        
        let link = await Link.deployed()
//We start with the oder book empty.
        let orderbook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), 1); //Get sell side orderbook
        assert(orderbook.length == 0, "Sell side Orderbook should be empty at start of test");
   //We add the LINK token to the contract so we can deposit LINK.
        await dex.addToken(web3.utils.fromUtf8("LINK"), link.address)


        //Send LINK tokens to accounts 1, 2, 3 from account 0
        
        ////Send LINK tokens to accounts 1, 2, 3 from account 0.
        //Account 0 is the account in contract Link, in tokens.sol, which is the msg.sender,
        //that put the contract on the blockchain, and that also made 1000 new LINK.
        //This action is done to make a number of different accounts 
        //which can make orders in our exchange.r of different accounts 
        //which can make orders in our exchange.
        await link.transfer(accounts[1], 150)
        await link.transfer(accounts[2], 150)
        await link.transfer(accounts[3], 150)

        //Approve DEX for accounts 1, 2, 3
        await link.approve(dex.address, 50, {from: accounts[1]});
        await link.approve(dex.address, 50, {from: accounts[2]});
        await link.approve(dex.address, 50, {from: accounts[3]});

        //Deposit LINK into DEX for accounts 1, 2, 3
        await dex.deposit(50, web3.utils.fromUtf8("LINK"), {from: accounts[1]});
        await dex.deposit(50, web3.utils.fromUtf8("LINK"), {from: accounts[2]});
        await dex.deposit(50, web3.utils.fromUtf8("LINK"), {from: accounts[3]});

        //Fill up the sell order book
                //We make 3 limit orders in the sell order book. This is done with 3 accounts.
        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 5, 300, {from: accounts[1]})
        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 5, 400, {from: accounts[2]})
        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 5, 500, {from: accounts[3]})

        //Create market order that should fill 2/3 orders in the book
        await dex.createMarketOrder(0, web3.utils.fromUtf8("LINK"), 10);

        //Create buy market order that sells all 10 LINK in the order book, and 
        //there will still be 5 LINK in the order book that were not used for these exchanges.
        orderbook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), 1); //Get sell side orderbook
        
        //The 0rder book will have a length of 1, 
//because there will be 1 order (of 5 LINK) in the order book, after the 2 orders for 5 LINK
//have both been used for buying the available 10 LINK, and there is still 1 order for 5 LINK. 
        assert(orderbook.length == 1, "Sell side Orderbook should only have 1 order left");
        assert(orderbook[0].filled == 0, "Sell side order should have 0 filled");

    })
    //Market orders should be filled until the order book is empty or the market order is 100% filled
    //The 0rder book will have a length of 1, 
//because there will be 1 order (of 5 LINK) in the order book, after the 2 orders for 5 LINK
//have both been used for buying the available 10 LINK, and there is still 1 order for 5 LINK. 
    it("Market orders should be filled until the order book is empty", async () => {
        let dex = await Dex.deployed()

        let orderbook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), 1); //Get sell side orderbook
        assert(orderbook.length == 1, "Sell side Orderbook should have 1 order left");

        //Fill up the sell order book again
                //Add 2 new orders to the order book.
        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 5, 400, {from: accounts[1]})
        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 5, 500, {from: accounts[2]})

        //check buyer link balance before link purchase
                //check buyer link balance before link purchase

        let balanceBefore = await dex.balances(accounts[0], web3.utils.fromUtf8("LINK"))
        //Create market order, for 50 LINK, 
//that can complete the actions of more than the entire order book (15 link)
//There 15 LINK in the sell side of the order book
//But we make an order for buying 50 LINK
//All 15 LINK should be bought (but not more, until the are more matching LINK orders).
//The order book will become empty, and then the exchange shold stop 
//(until more matching orders are put in the order book).
        
        //Create market order that could fill more than the entire order book (15 link)
        await dex.createMarketOrder(0, web3.utils.fromUtf8("LINK"), 50);

        //check buyer link balance after link purchase
                //check buyer link balance after link purchase
        let balanceAfter = await dex.balances(accounts[0], web3.utils.fromUtf8("LINK"))

                //Buyer should have 15 more link after, even though order was for 50. 
        //Buyer should have 15 more link after, even though order was for 50. 
        assert.equal(balanceBefore.toNumber() + 15, balanceAfter.toNumber());
    })

    //The eth balance of the buyer should decrease with the filled amount
        //The eth balance of the buyer should decrease with the amount used for buying LINK.
    it("The eth balance of the buyer should decrease with the filled amount", async () => {
        let dex = await Dex.deployed()
        let link = await Link.deployed()

        //Seller deposits link and creates a sell limit order for 1 link for 300 wei
             //Seller deposits link and makes a sell limit order for 1 link for 300 wei
        //300 wei with accounts array item 1
        await link.approve(dex.address, 500, {from: accounts[1]});
        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 1, 300, {from: accounts[1]})

        //Check buyer ETH balance before trade
            //Check buyer ETH balance before trade
        //Check balance before and after.
        //For 1 LINK
        let balanceBefore = await dex.balances(accounts[0], web3.utils.fromUtf8("ETH"));
        await dex.createMarketOrder(0, web3.utils.fromUtf8("LINK"), 1);
        let balanceAfter = await dex.balances(accounts[0], web3.utils.fromUtf8("ETH"));

         //Make sure that, with the purchase, the balance decreases 300 wei
        //The balance should show this fact.
        assert.equal(balanceBefore.toNumber() - 300, balanceAfter.toNumber());
    })

    //The token balances of the limit order sellers should decrease with the filled amounts.
    //The token balances of the limit order sellers should decrease with the sold amounts.
    //This is similar to an earlier test, but connected with the seller instead of the buyer.
    it("The token balances of the limit order sellers should decrease with the filled amounts.", async () => {
        let dex = await Dex.deployed()
        let link = await Link.deployed()

        let orderbook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), 1); //Get sell side orderbook
        assert(orderbook.length == 0, "Sell side Orderbook should be empty at start of test");

        //Seller Account[2] deposits link
        await link.approve(dex.address, 500, {from: accounts[2]});
        await dex.deposit(100, web3.utils.fromUtf8("LINK"), {from: accounts[2]});

        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 1, 300, {from: accounts[1]})
        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 1, 400, {from: accounts[2]})

        //Check sellers Link balances before trade
        let account1balanceBefore = await dex.balances(accounts[1], web3.utils.fromUtf8("LINK"));
        let account2balanceBefore = await dex.balances(accounts[2], web3.utils.fromUtf8("LINK"));

        //Account[0] created market order to buy up both sell orders
                //Seller account 1 already has approved and deposited  LINK from earlier tests.

        //Seller Account[2] approves and deposits link
        await dex.createMarketOrder(0, web3.utils.fromUtf8("LINK"), 2);

        //Check sellers Link balances after trade
        let account1balanceAfter = await dex.balances(accounts[1], web3.utils.fromUtf8("LINK"));
        let account2balanceAfter = await dex.balances(accounts[2], web3.utils.fromUtf8("LINK"));

        assert.equal(account1balanceBefore.toNumber() - 1, account1balanceAfter.toNumber());
        assert.equal(account2balanceBefore.toNumber() - 1, account2balanceAfter.toNumber());
    })

    //Filled limit orders should be removed from the orderbook
    xit("Filled limit orders should be removed from the orderbook", async () => {
        let dex = await Dex.deployed()
        let link = await Link.deployed()
        await dex.addToken(web3.utils.fromUtf8("LINK"), link.address)

        //Seller deposits link and creates a sell limit order for 1 link for 300 wei
        await link.approve(dex.address, 500);
                //We make 2 limit orders, both for 1 link, but with different prices
        await dex.deposit(50, web3.utils.fromUtf8("LINK"));
        
        await dex.depositEth({value: 10000});

        let orderbook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), 1); //Get sell side orderbook

        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 1, 300)
        await dex.createMarketOrder(0, web3.utils.fromUtf8("LINK"), 1);

        orderbook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), 1); //Get sell side orderbook
        assert(orderbook.length == 0, "Sell side Orderbook should be empty after trade");
    })

    //Partly filled limit orders should be modified to represent the filled/remaining amount
    it("Limit orders filled property should be set correctly after a trade", async () => {
        let dex = await Dex.deployed()

        let orderbook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), 1); //Get sell side orderbook
        assert(orderbook.length == 0, "Sell side Orderbook should be empty at start of test");

        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 5, 300, {from: accounts[1]})
        await dex.createMarketOrder(0, web3.utils.fromUtf8("LINK"), 2);

        orderbook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), 1); //Get sell side orderbook
        assert.equal(orderbook[0].filled, 2);
        assert.equal(orderbook[0].amount, 5);
    })
    //When creating a BUY market order, the buyer needs to have enough ETH for the trade
    it("Should throw an error when creating a buy market order without adequate ETH balance", async () => {
        let dex = await Dex.deployed()
             // Check sellers Link balances before trade?
        let balance = await dex.balances(accounts[4], web3.utils.fromUtf8("ETH"))
        assert.equal( balance.toNumber(), 0, "Initial ETH balance is not 0" );
        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 5, 300, {from: accounts[1]})

        await truffleAssert.reverts(
            dex.createMarketOrder(0, web3.utils.fromUtf8("LINK"), 5, {from: accounts[4]})
        )
    })


})


  //Account[0] creates a market order to buy both sell orders
        //This should buy all the link in available in the order book. 
  //      await dex.createMarketOrder(0, web3.utils.fromUtf8("LINK"), 2);

        //Check sellers Link balances after trade 
        //If the order is successful, both accounts should have less LINK
    //            let account1balanceAfter = await dex.balances(accounts[1], web3.utils.fromUtf8("LINK"));
      //  let account2balanceAfter = await dex.balances(accounts[2], web3.utils.fromUtf8("LINK"));

        //The balances of the 2 accounts should decrease, and be 1 LINK less.
        //assert.equal(account1balanceBefore.toNumber() - 1, account1balanceAfter.toNumber());
        //assert.equal(account2balanceBefore.toNumber() - 1, account2balanceAfter.toNumber());
   // })

    //Completed limit orders should be removed from the orderbook
  //  it("Completed limit orders should be removed from the orderbook", async () => {
  //      let dex = await Dex.deployed()
  //      let link = await Link.deployed()
  //      await dex.addToken(web3.utils.fromUtf8("LINK"), link.address)

        //Seller deposits link and creates a sell limit order for 1 link for 300 wei

  //   await link.approve(dex.address, 500);
  //      await dex.deposit(50, web3.utils.fromUtf8("LINK"));
        
  //      await dex.depositEth({value: 10000});

        //In the lesson, this was line number 2 of this section 
        //("Market Order Test Solution" at about 13 minutes & 10 seconds)
  //      let orderbook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), 1); //Get sell side orderbook

        //We make a limit order, then a market order
 //       await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 1, 300)
 //       await dex.createMarketOrder(0, web3.utils.fromUtf8("LINK"), 1);

 //       orderbook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), 1); //Get sell side orderbook
        
        //The sell order book should be zero
//        assert(orderbook.length == 0, "Sell side Orderbook should be empty after purchase");
//    })
//We show, in order and order book information, that the order was only partly done,
//And show the amount which still should be done, to complete the order
//In the lesson, the teacher said that he made a filled property, maybe with a struct
//During the lesson, the teacher said that he ahd not yet made this item.
//But he said that we need a filled property in the order struct 

//    it("Limit orders filled property should be set correctly after a trade", async () => {
//        let dex = await Dex.deployed()

//The teacher assumes that the sell side of the order book is empty at the start of the test.
//        let orderbook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), 1); //Get sell side orderbook
//        assert(orderbook.length == 0, "Sell side Orderbook should be empty at start of test");

 //We cmake a limit order for selling 5 link, and a market order to buy 2 of them.
//        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 5, 300, {from: accounts[1]})
//        await dex.createMarketOrder(0, web3.utils.fromUtf8("LINK"), 2);

//        orderbook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), 1); //Get sell side orderbook
      //The only order in the order book should have the filled property 2, 
      //since 2 have been filled.
      //We can use this later, connected with what is left to do to complete the orders.
//        assert.equal(orderbook[0].filled, 2);
//        assert.equal(orderbook[0].amount, 5);
      //Amount - filled = available amount
    })
    //When creating a BUY market order, the buyer needs to have enough ETH for the trade
//    it("Should throw an error when creating a buy market order without adequate ETH balance", async () => {
//        let dex = await Dex.deployed()
        
//        let balance = await dex.balances(accounts[4], web3.utils.fromUtf8("ETH"))
//        assert.equal( balance.toNumber(), 0, "Initial ETH balance is not 0" );
//        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 5, 300, {from: accounts[1]})

//        await truffleAssert.reverts(
//            dex.createMarketOrder(0, web3.utils.fromUtf8("LINK"), 5, {from: accounts[4]})
//        )
//    })


//})

