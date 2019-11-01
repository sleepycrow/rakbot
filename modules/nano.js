const fs = require('fs');
const Discord = require('discord.js');
const sqlite3 = require("sqlite3").verbose();
const nanocurrency = require('nanocurrency');
const NanoClient = require('nano-node-rpc');

const client = new NanoClient({apiKey: process.env.MYNANONINJA_KEY});
const altClient = new NanoClient({url: 'https://nanoverse.io/api/node'});
var db = null;
var usrCache = {};

module.exports = {
    name: "nano",
    helpEntry: "**&init-nano** - Tworzy konto nano\n"
        +"**&funds** - Wysyła adres i saldo twojego konta nano\n"
        +"**&transfer <ilosc> <adres lub tag discord>** - Przelewa podaną ilość nano do kogoś\n"
        +"**&receive** - Odbiera wszystkie oczekujące środki\n\n"
        +"Więcej informacji: https://telegra.ph/Informacje-o-Nano-10-24",
    category: "Kryptowaluta Nano",
    enabled: false,
    accountDB: "./assets/accounts.db",
    initCommandRegex: /init-nano/i,
    fundsCommandRegex: /funds/i,
    transferCommandRegex: /transfer ([0-9.]+) (<@!?([0-9]+)>|([^ ]+))/i,
    receiveCommandRegex: /receive/i,

    onStart: function(ctx){
        // start DB
        var dbExists = fs.existsSync(this.accountDB);
        db = new sqlite3.Database(this.accountDB);

        db.serialize(() => {
            if(!dbExists){
                console.log("[nano] DB not found, creating one now...");
                db.run("CREATE TABLE accounts (user TEXT, address TEXT, key TEXT)");
                this.enabled = true;
            }else{
                console.log("[nano] DB found.");
                db.all("SELECT rowid FROM accounts", (err, rows) => {
                    if(err){
                        console.error("[nano] Error occured while reading DB, disabling self...", err);
                        this.enabled = false;
                    }

                    if(rows){
                        console.log("[nano] DB contains " + rows.length + " entries.");
                        this.enabled = true;
                    }
                });
            }
        });
    },

    onMessage: function(ctx, message){
        if(this.enabled && !message.author.bot && message.isRakbotCmd){
            if(message.content.match(this.initCommandRegex) != null) this.initCommand(ctx, message);
            else if(message.content.match(this.fundsCommandRegex) != null) this.fundsCommand(ctx, message);
            else if(message.content.match(this.receiveCommandRegex) != null) this.receiveCommand(ctx, message);
            else if(message.content.match(this.transferCommandRegex) != null) this.transferCommand(ctx, message);
        }
    },

    initCommand: function(ctx, message){
        message.channel.startTyping();
        var accData = {};

        isInDb(db, "user", message.author.id)
        .then(hasAcc => {
            if(!hasAcc){
                return nanocurrency.generateSeed();
            }else{
                throw({usrMsg: "Masz już konto nano!"});
            }
        })
        .then(seed => {
            accData.seed = seed;
            accData.secretKey = nanocurrency.deriveSecretKey(accData.seed, 0);
            accData.publicKey = nanocurrency.derivePublicKey(accData.secretKey);
            accData.address = nanocurrency.deriveAddress(accData.publicKey, {useNanoPrefix: true});

            return message.author.createDM();
        })
        .then(dm => {
            var stmt = db.prepare("INSERT INTO accounts (user, address, key) VALUES ((?), (?), (?))");
            stmt.run(message.author.id, accData.address, accData.secretKey, err => {
                if(err){
                    throw({});
                }else{
                    message.channel.send("👏 Gotowe!");
                    dm.send(new Discord.RichEmbed({
                        title: "🔐 Twój nowy portfel nano!",
                        description: "Adres twojego konta #0 to `" + accData.address + "`\n\n"
                            +"**Zapisz następujące dane w bezpiecznym miejscu i utrzymaj je w tajemnicy:**\n"
                            +"Seed portfela: `" + accData.seed + "`\n"
                            +"Prywatny klucz konta #0: `" + accData.secretKey + "`"
                    }));
                }
            });
        })
        .catch(err => {
            handleErr(message, err);
        })
        .then(() => {
            message.channel.stopTyping();
        });
    },

    fundsCommand: function(ctx, message){
        message.channel.startTyping();
        var account;

        getUsrData(message.author.id)
        .then(data => {
            account = data.address;
            console.log("Getting balance for " + account);
            return altClient.account_balance(account);
        })
        .then(balance => {
            console.log(balance);
            let available = nanocurrency.convert(balance.balance, {from: nanocurrency.Unit.raw, to: nanocurrency.Unit.NANO});
            let pending = nanocurrency.convert(balance.pending, {from: nanocurrency.Unit.raw, to: nanocurrency.Unit.NANO});

            message.channel.send(new Discord.RichEmbed({
                title: account,
                url: "https://nanocrawler.cc/explorer/account/" + account,
                description: "**Dostępne środki**: " + available + " NANO\n"
                    +"**Środki oczekujące**: " + pending + " NANO"
            }));
        })
        .catch(err => {
            handleErr(message, err);
        })
        .then(() => {
            message.channel.stopTyping();
        });
    },

    receiveCommand: function(ctx, message){
        var usrData, accInfo;

        message.channel.startTyping();

        getUsrData(message.author.id)
        .then(data => {
            usrData = data;
            console.log("Getting account info for " + usrData.address);
            return client.account_info(usrData.address, true);
        })
        .then(info => {
            accInfo = sanitizeAccInfo(info);

            console.log("Getting pending transactions for " + usrData.address);
            return altClient._send("accounts_pending", {
                accounts: [usrData.address],
                source: true
            });
        })
        .then(data => {
            if(!data.blocks[usrData.address] || data.blocks[usrData.address].length <= 0) throw({usrMsg: "Nie posiadasz żadnych oczekujących transakcji!"});

            var pending = data.blocks[usrData.address];
            message.channel.send("⏳ **Przetwarzanie oczekujących transakcji**:\n"
                +"```json\n" + JSON.stringify(pending, null, 2) + "```"
                +"To może chwilę potrwać...");

            return processTransactions(usrData.key, accInfo, pending);
        })
        .then(() => {
            message.channel.send("✔ Transakcje dla adresu `" + usrData.address + "` zostały przetworzone pomyślnie!");
        })
        .catch(err => {
            handleErr(message, err);
        })
        .then(() => {
            message.channel.stopTyping();
        });
    },

    transferCommand: function(ctx, message){
        var invocation = message.content.match(this.transferCommandRegex);
        var usrData, accInfo;

        message.channel.startTyping();

        getUsrData(message.author.id)
        .then(data => {
            usrData = data;
            console.log("Getting account info for " + usrData.address);
            return client.account_info(usrData.address, true);
        })
        .then(info => {
            accInfo = sanitizeAccInfo(info);

            //check if funds are sufficient
            if(BigInt(accInfo.balance) < BigInt(nanocurrency.convert(invocation[1], {from: nanocurrency.Unit.NANO, to: nanocurrency.Unit.raw})))
                throw({usrMsg: "Nie posiadasz wystarczającej ilości środków aby wykonać tę transakcję."});

            //Got everything ready on the sender's side. Now to make sure we can actually send the funds.
            if(invocation[4]){ //nano_ address
                return new Promise((resolve, reject) => {
                    if(nanocurrency.checkAddress(invocation[4])) resolve(invocation[4]);
                    else reject({usrMsg: "Niepoprawny adres!"});
                });
            }else if(invocation[3]){ //discord tag
                return new Promise((resolve, reject) => {
                    db.get("SELECT address FROM accounts WHERE user=(?)", invocation[3], (err, row) => {
                        if(err) reject({});
                        if(!row) reject({usrMsg: "Ten użytkownik nie ma jeszcze konta nano!"});
                        else resolve(row.address);
                    })
                });
            }
        })
        .then(target => {
            return attemptTransfer(usrData.key, accInfo, nanocurrency.convert(invocation[1], {from: nanocurrency.Unit.NANO, to: nanocurrency.Unit.raw}), target);
        })
        .then(() => {
            message.channel.send("✔ Fundusze zostały wysłane.")
        })
        .catch(err => {
            handleErr(message, err);
        })
        .then(() => {
            message.channel.stopTyping();
        });
    }

}



// Utilities...
function isInDb(db, col, value){
    return new Promise((resolve, reject) => {
        var stmt = db.prepare("SELECT rowid FROM accounts WHERE " + col + "=(?)");
        stmt.get(value, (err, row) => {
            if(err) reject(err);
            else if(row) resolve(true);
            else resolve(false);
        });
    });
}

function getUsrData(usr){
    return new Promise((resolve, reject) => {
        if(usrCache[usr]) resolve(usrCache[usr]);

        db.get("SELECT * FROM accounts WHERE user=(?)", usr, (err, row) => {
            if(err) reject({usrMsg: "Nie masz jeszcze konta nano."});
            else if(row){
                usrCache[usr] = row;
                resolve(row);
            }
        });
    })
}

function handleErr(message, err){
    console.error("[nano]", err);

    let errorMessage = "Wystąpił wewnętrzny błąd, spróbuj ponownie później.";
    if(err.usrMsg) errorMessage = err.usrMsg;

    message.channel.send(new Discord.RichEmbed({
        title: "🛑 Błąd",
        description: errorMessage
    }));
}

function sanitizeAccInfo(accInfo){
    return Object.assign({
        frontier: "0000000000000000000000000000000000000000000000000000000000000000",
        balance: "0",
        representative: "nano_3tta9pdxr4djdcm6r3c7969syoirj3dunrtynmmi8n1qtxzk9iksoz1gxdrh"
    }, accInfo);
}

async function processTransactions(key, accInfo, transactions){
    for(let tx in transactions){
        if(BigInt(transactions[tx].amount) < BigInt(0)) continue; //ignore gay shit

        var bal = String(BigInt(accInfo.balance) + BigInt(transactions[tx].amount));

        var block = await client._send("block_create", {
            type: "state",
            previous: accInfo.frontier,
            balance: bal,
            key: key,
            link: tx,
            representative: accInfo.representative
        });
        
        if(!block.error && block.hash){
            var result = await client.process(block.block);

            if(!result.error && result.hash){
                console.log(result.hash + " successfully processed.");
                accInfo.frontier = result.hash;
                accInfo.balance = bal;
            }else{
                throw(result);
            }
        }else{
            throw(block);
        }
    }
}

async function attemptTransfer(key, accInfo, amount, target){
    let block = await client._send("block_create", {
        type: "state",
        previous: accInfo.frontier,
        balance: String(BigInt(accInfo.balance) - BigInt(amount)),
        key: key,
        link: target,
        representative: accInfo.representative
    });
        
    if(!block.error && block.hash){
        let result = await client.process(block.block);

        if(!result.error && result.hash){
            console.log(result.hash + " successfully processed.");
            return result.hash;
        }else{
            throw(result);
        }
    }else{
        throw(block);
    }
}