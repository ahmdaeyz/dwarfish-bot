const BootBot = require('bootbot');
const validUrl = require('valid-url');
const req = require("request");

const bot = new BootBot({
    accessToken: process.env["PAGE_ACCESS_TOKEN"],
    verifyToken: process.env["VERIFY_TOKEN"],
    appSecret: process.env["APP_SECRET"]
});
bot.setPersistentMenu([
    { type: 'postback', title: 'Shorten A Link', payload: 'SHORTEN' },
    { type: 'postback', title: 'Get Info About A Link', payload: 'INFO' }
]);
bot.setGreetingText('Shorten links at ' + process.env["HEROKU_APP_NAME"] + ".herokuapp.com");
bot.setGetStartedButton((payload, chat) => {
    chat.say("Let's shorten 'em all!");
});
bot.on('postback:SHORTEN', (payload, chat) => {
    console.log(process.env["HEROKU_APP_NAME"])
    chat.conversation((convo) => {
        convo.ask("Please send the link to be shortened..", (payload, conv) => {
            const url = payload.message.text;
            if (validUrl.isUri(url)) {
                req.post("https://+" + process.env["HEROKU_APP_NAME"] + ".herokuapp.com/l", { body: { "long_url": url }, json: true, encoding: "utf8" }, (err, res) => {
                    if (err !== null) {
                        conv.say("Something Went Wrong Please Try Again.");
                        convo.end();
                    }
                    const json = res.toJSON().body;
                    if ("error" in json) {
                        conv.say("url doesn't exist");
                        convo.end();
                    }
                    const short = json["short_url"];
                    const shortener = "https://+" + process.env["HEROKU_APP_NAME"] + ".herokuapp.com/s/";
                    conv.say(shortener + short);
                    convo.end();
                });
            } else {
                conv.say("Link sent isn't valid,Try again!");
                convo.end();
            }
        });
    });
});
bot.on("postback:INFO", (payload, chat) => {
    chat.conversation((convo) => {
        convo.ask("Please send the link to be checked..", (payload, conv) => {
            const url = payload.message.text;
            if (validUrl.isUri(url) && url.includes("https://+" + process.env["HEROKU_APP_NAME"] + ".herokuapp.com/s/")) {
                const shortener = "https://+" + process.env["HEROKU_APP_NAME"] + ".herokuapp.com/l/";
                req.get(+url.replace("https://+" + process.env["HEROKU_APP_NAME"] + ".herokuapp.com/s/", ""), { encoding: "utf8" }, (err, res) => {
                    if (err !== null) {
                        conv.say("Something Went Wrong Please Try Again");
                        convo.end();
                    }
                    const json = JSON.parse(res.toJSON().body);
                    if ("error" in json) {
                        conv.say("url doesn't exist");
                        convo.end();
                    }
                    const long = json["long_url"];
                    const views = json["views"];
                    conv.say("Long Link :" + long + "\nNumber Of Views : " + views);
                    convo.end();
                });
            } else {
                conv.say("Link sent isn't valid,Try again!");
                convo.end();
            }
        });
    });
});
bot.start(process.env.PORT || 8080);