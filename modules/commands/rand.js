module.exports = {
    name: "rand",
    command: true,
    regex: /rand/,
    usage: "&rand \"<opcja 1>\" \"<opcja 2>\"...",
    description: "Wybiera tak randomowo jedną z podanych opcji lol",
    category: "Narzędzia",

    onInvoke: function(context, message){
        var args = message.content.match(/"([^"]+)"/gi);
      
        if(args != null && args.length > 0){
            var id = Math.round(Math.random() * (args.length - 1));
            message.channel.send(args[id].replace(/"/gi, ""));
        }else{
            message.channel.send("⚠ No ale nie podałeś żadnych opcji meen...");
        }
    }
};