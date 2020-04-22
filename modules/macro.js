const fs = require('fs');
const sqlite3 = require("sqlite3").verbose();
const Discord = require('discord.js');

var db = null;

module.exports = {
    name: "macro",
    helpEntry: "**&&<nazwa>** - Używa makra\n"
        +"**&macro list** - Wysyła listę makr\n"
        +"**&macro list global** - Wysyła wszystkie makra rakbota\n"
        +"**&macro add <nazwa> <zawartość>** - Tworzy nowe makro tekstowe\n"
        +"**&macro add-img <nazwa> <adres obrazka>** - Tworzy nowe makro obrazkowe\n"
        +"**&macro del <nazwa>** - Usuwa makro",
    category: "Macro",
    enabled: false,
    macroDB: "./assets/macros.db",
    adminCmdRegex: /macro ?([A-Za-z0-9!_-]+)? ?([A-Za-z0-9!_-]+)? ?([^]+)?/i,
    useMacroCmdRegex: /^&&([A-Za-z0-9!_-]+)/i,

    onStart: function(ctx){
        // start DB
        var dbExists = fs.existsSync(this.macroDB);
        db = new sqlite3.Database(this.macroDB);

        db.serialize(() => {
            if(!dbExists){
                console.log("[macro] DB not found, creating one now...");
                db.run("CREATE TABLE macros (name TEXT, type TEXT, author TEXT, server TEXT, content TEXT)");
                this.enabled = true;
            }else{
                console.log("[macro] DB found.");
                db.all("SELECT rowid FROM macros", (err, rows) => {
                    if(err){
                        console.error("[macro] Error occured while reading DB, disabling self...", err);
                        this.enabled = false;
                    }

                    if(rows){
                        console.log("[macro] DB contains " + rows.length + " entries.");
                        this.enabled = true;
                    }
                });
            }
        });
    },

    onMessage: function(ctx, message){
        if(this.enabled && !message.author.bot && message.isRakbotCmd){
            if(message.content.match(this.useMacroCmdRegex) != null){
                this.useMacro(ctx, message);
            }else if(message.content.match(this.adminCmdRegex) != null){
                var invocation = message.content.match(this.adminCmdRegex);
                
                if(invocation[1] == "add") this.addMacro(ctx, message);
                else if(invocation[1] == "add-img") this.addMacro(ctx, message);
                else if(invocation[1] == "del") this.delMacro(ctx, message);
                else if(invocation[1] == "list") this.listMacros(ctx, message);
                else this.showHelpMsg(ctx, message);
            }
        }
    },
    
    showHelpMsg: function(ctx, message){
        message.channel.send(new Discord.RichEmbed({
            title: this.category,
            description: this.helpEntry
        }));
    },
    
    useMacro: function(ctx, message){
        var invocation = message.content.match(this.useMacroCmdRegex);
        
        new Promise((resolve, reject) => {
            var stmt = db.prepare("SELECT type, content FROM macros WHERE name = (?) LIMIT 1");
            stmt.get(invocation[1], (err, row) => {
                stmt.finalize();
                
                if(err){
                    reject({});
                }else{
                    if(row != null) resolve(row);
                    else reject({usrMsg: "Takie makro nie istnieje!"});
                }
            });
        })
        .then(row => {
            if(row.type == "text") message.channel.send(row.content);
            else if(row.type == "image") message.channel.send("", { files: [row.content] });
        })
        .catch(err => {
            handleErr(message, err);
        });
    },

    addMacro: function(ctx, message){
        var invocation = message.content.match(this.adminCmdRegex);

        isInDb(db, "macros", "name", invocation[2])
        .then(alreadyExists => {
            if(alreadyExists) throw({usrMsg: "Istnieje już makro o takiej nazwie!"});
            
            switch(invocation[1]){
                case "add":
                    return "text";
                    break;
                case "add-img":
                    return "image";
                    break;
                default:
                    throw({usrMsg: "Niepoprawny rodzaj makra!"});
            }
        })
        .then(macroType => {
            var serverId = message.guild ? message.guild.id : "";
            
            var stmt = db.prepare("INSERT INTO macros (name, type, author, server, content) VALUES ((?), (?), (?), (?), (?))");
            stmt.run(invocation[2], macroType, message.author.id, serverId, invocation[3], err => {
                if(err){
                    throw({});
                }else{
                    message.channel.send("👏 Gotowe!");
                }
            });
        })
        .catch(err => {
            handleErr(message, err);
        });
    },

    delMacro: function(ctx, message){
        var invocation = message.content.match(this.adminCmdRegex);
        
        new Promise((resolve, reject) => {
            var stmt = db.prepare("SELECT rowid, author FROM macros WHERE name = (?) LIMIT 1");
            stmt.get(invocation[2], (err, row) => {
                stmt.finalize();
                
                if(err){
                    reject({});
                }else{
                    if(row != null){
                        if(message.author.id == row.author || message.author.id == process.env.ADMIN_DISCORD_ID) resolve(row.rowid);
                        else reject({usrMsg: "Nie masz uprawnień do usunięcia tego makra!"});
                    }else{
                        reject({usrMsg: "Nie ma żadnego makra o takiej nazwie!"});
                    }
                }
            });
        })
        .then(rowid => {
            var stmt = db.prepare("DELETE FROM macros WHERE rowid = (?)");
            stmt.run(rowid, (err) => {
                stmt.finalize();
                
                if(err){
                    console.error(err);
                    handleErr(message, {});
                }else{
                    message.channel.send("👏 Gotowe!");
                }
            });
        })
        .catch(err => {
            handleErr(message, err);
        });
        
    },

    listMacros: function(ctx, message){
        var invocation = message.content.match(this.adminCmdRegex);
        var searchMode = (!message.guild || invocation[2] == "global") ? "global" : "local";
        var serverId = (message.guild && searchMode == "local") ? message.guild.id : 1;
        
        new Promise((resolve, reject) => {
            var stmt = db.prepare("SELECT name FROM macros" + (searchMode == "local" ? " WHERE server = (?)" : " WHERE (?)"));
            stmt.all(serverId, (err, rows) => {
                stmt.finalize();
                
                if(err){
                    reject({});
                }else{
                    resolve(rows);
                }
            });
        })
        .then(macros => {
            let list = "";

            for(let macro of macros){
                list += "- " + macro.name + "\n";
            }
          
            if(searchMode == "local") list += "\nAktualnie widzisz tylko makra stworzone na tym serwerze. Aby zobaczyć wszystkie makra, wpisz &macro list global";
            else if(searchMode == "global") list += "\nAktualnie widzisz wszystkie makra w bazie makr rakbota!";

            message.channel.send(new Discord.RichEmbed({
                title: (searchMode == "local" ? "Lokalna" : "Globalna") + " lista makr:",
                description: list
            }));
        })
        .catch(err => {
            handleErr(message, err);
        });
    }
}

// Utilities...
function isInDb(db, table, col, value){
    return new Promise((resolve, reject) => {
        var stmt = db.prepare("SELECT rowid FROM " + table + " WHERE " + col + "=(?)");
        stmt.get(value, (err, row) => {
            if(err) reject(err);
            else if(row) resolve(true);
            else resolve(false);
        });
    });
}

function handleErr(message, err){
    console.error("[macros]", err);

    let errorMessage = "Wystąpił wewnętrzny błąd, spróbuj ponownie później.";
    if(err.usrMsg) errorMessage = err.usrMsg;

    message.channel.send(new Discord.RichEmbed({
        title: "🛑 Błąd",
        description: errorMessage
    }));
}
