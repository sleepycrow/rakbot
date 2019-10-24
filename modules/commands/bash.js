const axios = require('axios');

module.exports = {
    name: "bash",
    command: true,
    regex: /bash/,
    usage: "&bash",
    description: "Wysyła losowy cytat z bash.org",
    category: "Zabawa",

    onInvoke: function(ctx, message){
        message.channel.startTyping();

        axios.get("http://bash.org/?random", {responseType: "text"})
        .then(resp => {
            try{
                let quote = resp.data.replace(/<br \/>/gi, "")
                quote = quote.match(/<p class="qt">([^<]+)/i)[1];
                quote = quote.replace(/&gt;/g, ">");
                quote = quote.replace(/&lt;/g, "<");
                quote = quote.replace(/&([^;]+);/g, "");
                message.channel.send(quote);
            }catch(e){
                console.error(e);
                throw {};
            }
        })
        .catch(err => {
            ctx.utils.sendError(err, message.channel);
        })
        .then(() => {
            message.channel.stopTyping();
        });
    }
};