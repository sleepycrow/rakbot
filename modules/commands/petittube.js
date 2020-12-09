const axios = require('axios');

module.exports = {
    name: "petittube",
    command: true,
    regex: /petittube/,
    usage: "&petittube",
    description: "Wysyła losowy film z YouTube posiadający małą ilość wyświetleń",
    category: "Zabawa",

    onInvoke: function(ctx, message){
        message.channel.startTyping();

        axios.get("https://petittube.com", {responseType: "text"})
        .then(resp => {
            let embedURL = resp.data.match(/https?:\/\/(www.)?youtube.com\/embed\/([^\? "]+)/gi);

            if(embedURL != null){
                let videoLink = embedURL[0].replace(/https?:\/\/(www.)?youtube.com\/embed\//, "https://youtu.be/");
                message.channel.send(videoLink);
            }else{
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
