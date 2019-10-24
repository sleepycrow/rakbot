var emoji_special_chars = {
    "a": ":a:",
    "b": ":b:",
    "?": ":question:",
    "!": ":exclamation:",
    " ": "  ",
    "p": ":parking:",
    "0": ":zero:",
    "1": ":one:",
    "2": ":two:",
    "3": ":three:",
    "4": ":four:",
    "5": ":five:",
    "6": ":six:",
    "7": ":seven:",
    "8": ":eight:",
    "9": ":nine:"
};

module.exports = {
    name: "emoji",
    command: true,
    regex: /emoji ([^`]+)/,
    usage: "&emoji <tekst>",
    description: "hahaha cycki lool xDD",
    category: "Narzędzia",

    onInvoke: function(context, message){
        var input = message.content.toLowerCase().match(this.regex)[1];

        var output = "";
        for(var i = 0;i < input.length;i++){
            var curChar = input.substr(i, 1);
        
            if(typeof emoji_special_chars[curChar] !== "undefined"){
                output += emoji_special_chars[curChar] + " ";
            }else if(curChar.match(/[a-z]/)){
                output += ":regional_indicator_" + curChar + ": ";
            }else{
                output += curChar;
            }
        }
        
        message.channel.send(output.substr(0, 2000));
    }
};