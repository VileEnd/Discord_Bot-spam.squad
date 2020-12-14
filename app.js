var Discord = require("discord.js");
var request = require("request");
var rcon = require("./rcon/app.js");
var SourceQuery = require("sourcequery");
var fs = require("fs");
var configdir = "config";
var maxServers = 50;
var players_dc = "";
var maxplayers_dc = "";
var currentmap_dc = "";
var dc_seedinState = "";
var EventAnnouncement_dc = "";
var serverStatus;
var dc_message = "";
// Create dir if not exist
if (!fs.existsSync(configdir)) {
    fs.mkdirSync(configdir);
}
// Create config file if not exist
fs.readdir(configdir, function (err, files) {
    try {
        if (File.length < 1)
            var writeConfig = '{"debug":false,"token":"","apiSite":4,"apiUrl":"https://full uri here","serverIp":"","serverPort":"28015","enableRcon":"0","rconhost":"","rconport":"","rconpass":"","prefix":"!","roles":["Administrator","admins"],"queueMessage":"currently waiting in queue.","updateInterval":"3"}';
        var jsonData = JSON.parse(writeConfig); //do not know why it doesnt accept it
        fs.writeFile("config/server1.json", JSON.stringify(jsonData, null, 2), "utf8", function (err) {
            if (err) {
                console.log("An error occured while writing JSON Object to File.");
                return console.log(err);
            }
            console.log("Config file created");
        });
    }
    catch (error) { }
});
fs.readdir(configdir, function (err, files) {
    var _loop_1 = function (i) {
        if (i > maxServers) {
            console.log("Max servers is over " + maxServers);
            console.log("Please verify max servers and try again");
            process.exit();
        }
        // Functions
        var updateActivity = function () {
            if (apiSite === 3) {
                require("tls").DEFAULT_ECDH_CURVE = "auto";
                request({
                    url: apiUrl,
                    headers: { json: true, Referer: "discord-rustserverstatus" },
                    timeout: 10000
                }, function (err, res, body) {
                    if (!err && res.statusCode == 200) {
                        var jsonData = JSON.parse(body);
                        var server = jsonData.data.attributes;
                        var mapserver = jsonData.data.attributes.details;
                        var is_online = server.status;
                        var today = new Date().getDay();
                        var hours = new Date().getHours();
                        if (is_online == "online") {
                            var players = server.players;
                            var map = mapserver.map;
                            var maxplayers = server.maxPlayers;
                            var queue = server.details.rust_queued_players;
                            var EventAnnouncement = "";
                            players_dc = players;
                            maxplayers_dc = maxplayers;
                            currentmap_dc = map;
                            currentmap_dc = currentmap_dc.substring(3);
                            var Servermsg = "Seeding Time!";
                            if (players > 40) {
                                Servermsg = "Time to Kill";
                            }
                            dc_seedinState = Servermsg;
                            if ((today == 3 || today == 5 || today == 6) &&
                                (hours >= 19 && hours <= 21)) {
                                EventAnnouncement = "EVENT!";
                            }
                            EventAnnouncement_dc = EventAnnouncement;
                            var status_1 = EventAnnouncement + " " + players + "/" + maxplayers + " " + currentmap_dc + " " + Servermsg + "  " + EventAnnouncement;
                            if (typeof queue !== "undefined" && queue != "0") {
                                status_1 += " (" + queue + " " + queueMessage + ")";
                            }
                            if (debug)
                                console.log("Updated from battlemetrics, serverid: " + server.id);
                            serverStatus = false;
                            return client.user.setActivity(status_1, { type: statusType });
                        }
                        else {
                            serverStatus = true;
                            return client.user.setActivity("Offline ||Updating ");
                        }
                    }
                });
            }
            if (apiSite == 4) {
                if (!serverIp || !serverPort) {
                    console.log("You have to configure serverIP/port");
                    process.exit();
                }
                else {
                    var sq = new SourceQuery(1000); // 1000ms timeout
                    sq.open(serverIp, serverPort);
                    sq.getInfo(function (err, info) {
                        if (err) {
                            return client.user.setActivity("Offline");
                        }
                        else {
                            //                           if (debug) { console.log('Server Info: \nIP: %s\nPort: %s\nName: %s\nPlayers: %s/%s', serverIp, serverPort, info.name, info.players, info.maxplayers) }
                            var players = info.players;
                            var maxplayers = info.maxplayers;
                            var status_2 = players + "/" + maxplayers;
                            return client.user.setActivity(status_2, { type: statusType });
                        }
                    });
                }
            }
        };
        // End Functions
        try {
            config = require("./config/server1.json");
        }
        catch (error) {
            console.error(error);
        }
        var client = new Discord.Client();
        var timevat = void 0;
        timevat = 1000;
        var updateInterval = timevat * config.updateInterval || 1000 * 3;
        var debug = process.env.debug || config.debug;
        var apiUrl = process.env.apiUrl || config.apiUrl;
        var apiSite = process.env.apiSite || config.apiSite;
        var serverIp = process.env.serverIp || config.serverIp;
        var serverPort = process.env.serverPort || config.serverPort;
        var enableRcon = process.env.enableRcon || config.enableRcon;
        var prefix = process.env.prefix || config.prefix;
        var roles = process.env.roles || config.roles;
        var queueMessage = process.env.queueMessage || config.queueMessage;
        var statusType = process.env.statusType || config.statusType;
        setactivState = false;
        client.on("ready", function () {
            console.log("Bot has started, with " + client.users.cache.size + " users, in " + client.channels.cache.size + " channels of " + client.guilds.cache.size + " guilds.");
            updateActivity();
            setInterval(function () {
                updateActivity();
            }, updateInterval);
        });
        var hello;
        client.on("message", function (message) {
            if ((hello = message.content.toLowerCase()) !== prefix + "ilovehawaiipizza") {
                return;
            }
            if (serverStatus) {
                console.log(serverStatus + " Is Offline");
                dc_message = new Discord.MessageEmbed()
                    .setColor('#ffcc00')
                    .setTitle('EU-Server-Status')
                    .setThumbnail('https://thumbs.gfycat.com/GenuineHideousJuliabutterfly-size_restricted.gif')
                    .addFields({ name: "Status", value: "Currently offline; maybe Updating see #announcements" })
                    .setTimestamp()
                    .setFooter('Created by: VileEnd', 'https://static-cdn.jtvnw.net/jtv_user_pictures/63d0d633-72a6-4fda-bfb0-709cea4dcf04-profile_image-70x70.png');
            }
            else {
                dc_message = new Discord.MessageEmbed()
                    .setColor('#ffcc00')
                    .setTitle('EU-Server-Status')
                    .setThumbnail('https://media1.tenor.com/images/8f4550dcf8cef9f7fbf8306d303e50bf/tenor.gif')
                    .addFields({ name: "Players: ", value: players_dc + "/" + maxplayers_dc }, { name: "Map:", value: "" + currentmap_dc }, { name: "Status", value: "" + dc_seedinState })
                    .setTimestamp()
                    .setFooter('Created by: VileEnd', 'https://static-cdn.jtvnw.net/jtv_user_pictures/63d0d633-72a6-4fda-bfb0-709cea4dcf04-profile_image-70x70.png');
            }
            message.channel
                .send(dc_message)
                .then(function (msgReact) {
                msgReact.react('🔄');
                msgReact.react('😍');
                var filter = function (reaction, user) {
                    console.log("MOIN");
                    setactivState = false;
                    return ['🔄', '😍'].includes(reaction.emoji.name) && user.id === message.author.id;
                };
                msgReact.awaitReactions(filter, { max: 1, time: 60000 })
                    .then(function (collected) {
                    var reaction = collected.first();
                    if (reaction.emoji.name === '🔄') {
                        console.log("HEY!");
                        if (!serverStatus) {
                            var newdc_message = new Discord.MessageEmbed()
                                .setColor('#ffcc00')
                                .setTitle('EU-Server-Status')
                                .setThumbnail('https://media1.tenor.com/images/8f4550dcf8cef9f7fbf8306d303e50bf/tenor.gif')
                                .addFields({ name: "Players: ", value: players_dc + "/" + maxplayers_dc }, { name: "Map:", value: "" + currentmap_dc }, { name: "Status", value: "" + dc_seedinState })
                                .setTimestamp()
                                .setFooter('Created by: VileEnd', 'https://static-cdn.jtvnw.net/jtv_user_pictures/63d0d633-72a6-4fda-bfb0-709cea4dcf04-profile_image-70x70.png');
                            msgReact.edit(newdc_message);
                        }
                    }
                });
            });
        });
        client.on("guildCreate", function (guild) {
            console.log("New guild joined: " + guild.name + " (id: " + guild.id + "). This guild has " + guild.memberCount + " members!");
        });
        client.on("guildDelete", function (guild) {
            console.log("I have been removed from: " + guild.name + " (id: " + guild.id + ")");
        });
        var error = void 0;
        client.on("error", function (error) {
            if (debug)
                console.log(error);
        });
        process.on("unhandledRejection", function (error) {
            console.log(typeof error);
            if (error.code == "TOKEN_INVALID")
                return console.log("Error: An invalid token was provided.\nYou have maybe added client secret instead of BOT token.\nPlease set BOT token");
            return console.error("Unhandled promise rejection:", error);
        });
        client.login(process.env.token || config.token);
    };
    var config, setactivState;
    for (var i = 1; i <= files.length; i++) {
        _loop_1(i);
    }
});
