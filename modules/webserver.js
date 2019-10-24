const path = require('path');
const express = require('express');
const app = express();

module.exports = {
    name: "webserver",

    onStart: function(context){
        app.use("/", express.static("./assets/webserver"));
      
        app.get("/macros", function (request, response) {
            console.log("/macros requested");
            response.sendFile(path.resolve(__dirname, "../assets/macros.json"));
        });
      
        var listener = app.listen(process.env.PORT, function () {
            console.log('[webserver] Express is listening on port ' + listener.address().port);
        });
    }
};