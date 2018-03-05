'use strict';

const config = require("../helpers/config").config;

function depositCoin(transaction){
    //throw error if invalid amount
    if(transaction.amount<=0 && transaction.amount>1000000){
        throw Error("Transfer error, limit between 0 and 1 million");
    }

    const factory = getFactory();

    //add amount to vault
    let vault = transaction.vault;
    vault += transaction.amount;

    //create a new transaction and set properties
    const newTransaction = factory.newConcept(config.project, "CoinTransaction");
    newTransaction.amount = transaction.amount;
    newTransaction.type = "DEPOSIT";

    //if there are previous transactions, concat the new one
    if(vault.transactions){
        vault.transactions.push(newTransaction)
    }else{
        vault.transactions = [newTransaction]
    }
    
    return getAssetRegistry(config.safe)
        .then((assetRegistry)=>{
            return assetRegistry.update(safe);
        })
        .then(()=>{
            //transaction completed
        });
}

function withdrawCoin(transaction){
    const vault = transaction.vault;
    if(transaction.amount>vault.amount || transaction.amount<=10 || transaction.amount>1000000){
        throw Error("Invalid amount");
    }

    const factory = getFactory();
    vault.amount = vault.amount - transaction.amount;
    const newTransaction = factory.newConcept(config.project, "CoinTransaction");
    newTransaction.amount = transaction.amount;
    newTransaction.tpe = "WITHDRAWAL";

    if(vault.transactions){
        vault.transactions.push(newTransaction)
    }else{
        vault.transactions = [newTransaction];
    }

    return getAssetRegistry(config.safe)
        .then((assetRegistry)=>{
            return assetRegistry.update(safe);
        })
        .then(()=>{
            //transaction completed
        });
}

function transferCoin(transaction){
    //transaction.sender is the senders safe, transaction.reciever is the recievers safe
    if(transaction.amount>transaction.sender.amount || transaction.amount<=10 || transaction>1000000){
        throw Error("Invalid amount");
    }
    transaction.sender.amount = transaction.sender.amount - transaction.amount;
    transaction.reciever.amount = transaction.reciever.amount + transaction.amount;

    const factory = getFactory();

    const senderTransaction = factory.newConcept(config.project, "CoinTransaction");
    senderTransaction.amount = transaction.amount;
    senderTransaction.type = "SEND";
    if(transaction.sender.transactions){
        transaction.sender.transactions.push(senderTransaction);
    }else{
        transaction.sender.transactions = [senderTransaction];
    }

    const recieverTransaction = factory.newConcept(config.project, "CoinTransaction");
    recieverTransaction.amount = transaction.amount;
    recieverTransaction.type = "RECEIVE";
    if(transaction.reciever.transactions){
        transaction.reciever.transactions.push(recieverTransaction);
    }else{
        transaction.reciever.transactions = [recieverTransaction];
    }

    return getAssetRegistry(config.safe)
        .then((assetRegistry)=>{
            return assetRegistry.updateAll([transaction.sender, transaction.reciever]);
        })
        .then(()=>{
            //transaction completed
        });
}