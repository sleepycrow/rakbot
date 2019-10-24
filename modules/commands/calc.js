module.exports = {
    name: "calc",
    command: true,
    regex: /calc ([^`]+)/,
    usage: "&calc <działanie>",
    description: "sam kurwa nie wiem lol",
    category: "Narzędzia",

    onInvoke: function(context, message){
        var rawInput = message.content.match(this.regex)[1];
        var input = rawInput;
        input = input.replace(/([A-Za-z]+)/gi, "Math.$1");
        input = input.replace(/({|}|;)/gi, "");

        try{
            message.channel.send(rawInput + " = **" + eval(input) + "**");
            //message.channel.send(rawInput + " = **" + eval("(function(){ return " + input + "; }).call(Object.assign(Math, {}));") + "**");
        }catch(e){
            console.error(e);
            message.channel.send("❌ Wystąpił błąd.");
        }
    }
};