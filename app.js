var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var Discord = require("discord.js");
var request = require("request");
var rcon = require("./rcon/app.js");
var SourceQuery = require("sourcequery");
var fs = require("fs");
var configdir = "./config";
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
        if (files.length < 1)
            var writeConfig = '{"debug":false,"token":"","apiSite":4,"apiUrl":"https://full uri here","serverIp":"","serverPort":"28015","enableRcon":"0","rconhost":"","rconport":"","rconpass":"","prefix":"!","roles":["Administrator","admins"],"queueMessage":"currently waiting in queue.","updateInterval":"3"}';
        var jsonData = JSON.parse(writeConfig);
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
    var _loop_1 = function () {
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
            config = require("./config/server" + i + ".json");
        }
        catch (error) { }
        var client = new Discord.Client();
        var updateInterval = 1000 * 3 ||
            1000 * process.env.updateInterval ||
            1000 * config.updateInterval;
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
        // function onMessageReaction(collected) {
        //   const reaction = collected.first();
        //   console.log("hi");
        //   if (reaction.emoji.name === '🔄') {
        //     refresh = true;
        //     message.channel.send("refresh");
        //   }
        //onClientMessage(message) 
        var hello;
        client.on("message", function (message) {
            if ((hello = message.content.toLowerCase()) === prefix + "ilovehawaiipizza") {
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
            }
        });
        //Current Map: ${currentmap_dc} ${EventAnnouncement_dc}`
        if (enableRcon == 1) {
            client.on("message", function (message) { return __awaiter(_this, void 0, void 0, function () {
                var args, command, getMessage, argumentString;
                return __generator(this, function (_a) {
                    if (message.author.bot)
                        return [2 /*return*/];
                    if (message.content.indexOf(prefix) !== 0)
                        return [2 /*return*/];
                    args = message.content
                        .slice(prefix.length)
                        .trim()
                        .split(/ +/g);
                    command = args.shift().toLowerCase();
                    if (command === "rcon") {
                        // Checks for discord permission
                        if (!message.member.roles.cache.some(function (r) { return roles.includes(r.name); }))
                            return [2 /*return*/, message.reply("Sorry, you don't have permissions to use this!")];
                        getMessage = args.join(" ");
                        argumentString = "" + getMessage;
                        // Rcon Config
                        rconhost = process.env.rconhost || config.rconhost;
                        rconport = process.env.rconport || config.rconport;
                        rconpass = process.env.rconpass || config.rconpass;
                        // Run rcon command.
                        rcon.RconApp(argumentString, rconhost, rconport, rconpass, debug);
                        // Send message back to discord that we are trying to relay the command.
                        message.channel.send("Trying to relay command: " + getMessage);
                    }
                    return [2 /*return*/];
                });
            }); });
        }
        else if (debug)
            console.log("Rcon mode disabled");
        client.on("guildCreate", function (guild) {
            console.log("New guild joined: " + guild.name + " (id: " + guild.id + "). This guild has " + guild.memberCount + " members!");
        });
        client.on("guildDelete", function (guild) {
            console.log("I have been removed from: " + guild.name + " (id: " + guild.id + ")");
        });
        client.on("error", function (error) {
            if (debug)
                console.log(error);
        });
        process.on("unhandledRejection", function (error) {
            if (error.code == "TOKEN_INVALID")
                return console.log("Error: An invalid token was provided.\nYou have maybe added client secret instead of BOT token.\nPlease set BOT token");
            return console.error("Unhandled promise rejection:", error);
        });
        client.login(process.env.token || config.token);
    };
    var config, setactivState;
    for (var i = 1; i <= files.length; i++) {
        _loop_1();
    }
});
