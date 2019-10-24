const fs = require('fs');
const Discord = require('discord.js');

module.exports = {
    name: "macro",
    helpEntry: "**&macro** lub **&&** - Wysyła listę makr\n"
        +"**&macro <nazwa makra>** lub **&&<nazwa>** - Używa podanego makra\n"
        +"**&addmacro <nazwa> <makro>** - Dodaje nowe makro\n"
        +"**&delmacro <nazwa>** - Usuwa makro",
    category: "Macro",
    enabled: true,
    macros: {},
    macroDB: "./assets/macros.json",
    macroCommandRegex: /^(&macro ?|&&)([A-Za-z0-9!_-]+)?/i,
    addMacroCommandRegex: /^&addmacro ([A-Za-z0-9!_-]+) ([^]+)/i,
    delMacroCommandRegex: /^&delmacro ([A-Za-z0-9!_-]+)/i,

    onStart: function(ctx){
        fs.readFile(this.macroDB, (error, data) => {
            if(!error){
                this.macros = JSON.parse(data.toString());
            }else{
                this.enabled = false;
                console.log("[!!!] Error while enabling macros: " + error);
            }
        });
    },

    onMessage: function(ctx, message){
        if(this.enabled && !message.author.bot){
            if(message.content.match(this.macroCommandRegex) != null) this.macroCommand(ctx, message);
            else if(message.content.match(this.addMacroCommandRegex) != null) this.addMacroCommand(ctx, message);
            else if(message.content.match(this.delMacroCommandRegex) != null) this.delMacroCommand(ctx, message);
        }
    },

    macroCommand: function(ctx, message){
        let invocation = message.content.match(this.macroCommandRegex);

        if(invocation[2]){
            let macroName = invocation[2];

            if(this.macros[macroName]){
                message.channel.send(this.macros[macroName].content);
            }else{
                message.channel.send("⚠ To makro nie istnieje.");
            }
        }else{
            let list = "";

            for(let macroName in this.macros){
                list += "- " + macroName + "\n"
            }
          
            list += "\nProtip: Masz copypastę? Reaction image? ASCII art? Wrzuć go w makro aby nie być bebilem! 👍"

            message.channel.send(new Discord.RichEmbed({
                title: "Lista makr:",
                description: list
            }));
        }
    },
    
    addMacroCommand: function(ctx, message){
        let invocation = message.content.match(this.addMacroCommandRegex);
        
        if(invocation[1] && invocation[2]){
            let name = invocation[1];
            let contents = invocation[2];

            if(!this.macros[name]){
                this.macros[name] = {
                    author: message.author.id,
                    content: contents
                };
                this.saveMacros();
                message.channel.send("✔ Makro dodane pomyślnie!");
            }else{
                message.channel.send("⚠ Istnieje już makro o nazwie " + name);
            }
        }else{
            message.channel.send("⚠ Niewystarczająco wiele lub niepoprawne argumenty.");
        }
    },
  
    delMacroCommand: function(ctx, message){
        let invocation = message.content.match(this.delMacroCommandRegex);
        
        if(invocation[1] && this.macros[invocation[1]]){
            let macro = this.macros[invocation[1]];
            if(message.author.id == macro.author || message.author.id == process.env.ADMIN_DISCORD_ID){
                delete this.macros[invocation[1]];
                this.saveMacros();
                message.channel.send("✔ Makro usunięte pomyślnie!");
            }else{
                message.channel.send("⚠ Nie jesteś autorem tego makra!");
            }
        }else{
            message.channel.send("⚠ Makro " + invocation[1] + " nie istnieje!");
        }
    },

    saveMacros: function(){
        fs.writeFile(this.macroDB, JSON.stringify(this.macros, null, 4), (error) => {
            if(error) console.error("[!!!] Error while saving macros " + error);
            else console.log("Macros saved!");
        });
    }
}