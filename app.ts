const Discord = require("discord.js");
const request = require("request");
const rcon = require("./rcon/app.js");
const SourceQuery = require("sourcequery");
const fs = require("fs");
const configdir = "config";
const maxServers = 50;
let players_dc = "";
let maxplayers_dc = "";
let currentmap_dc = "";
let dc_seedinState = "";
let EventAnnouncement_dc = "";
let serverStatus:boolean;
let dc_message = "";

// Create dir if not exist
if (!fs.existsSync(configdir)) {
  fs.mkdirSync(configdir);
}

// Create config file if not exist
fs.readdir(configdir, (err, files)=> {
  try {
    if (File.length < 1)
      var writeConfig =
        '{"debug":false,"token":"","apiSite":4,"apiUrl":"https://full uri here","serverIp":"","serverPort":"28015","enableRcon":"0","rconhost":"","rconport":"","rconpass":"","prefix":"!","roles":["Administrator","admins"],"queueMessage":"currently waiting in queue.","updateInterval":"3"}';

   var  jsonData = JSON.parse(writeConfig);//do not know why it doesnt accept it

    fs.writeFile(
      "config/server1.json",
      JSON.stringify(jsonData, null, 2),
      "utf8",
      function (err) {
        if (err) {
          console.log("An error occured while writing JSON Object to File.");
          return console.log(err);
        }
        console.log("Config file created");
      }
    );
  } catch (error) { }
});

fs.readdir(configdir, (err, files) => {
  for (let i = 1; i <= files.length; i++) {
    if (i > maxServers) {
      console.log("Max servers is over " + maxServers);
      console.log("Please verify max servers and try again");
      process.exit();
    }

    // Functions
    const updateActivity = () => {

      if (apiSite === 3) {
        require("tls").DEFAULT_ECDH_CURVE = "auto";
        request(
          {
            url: apiUrl,
            headers: { json: true, Referer: "discord-rustserverstatus" },
            timeout: 10000
          },
          function (err, res, body) {
            if (!err && res.statusCode == 200) {
              const jsonData = JSON.parse(body);
              const server = jsonData.data.attributes;
              const mapserver = jsonData.data.attributes.details;
              const is_online = server.status;
              var today = new Date().getDay();
              var hours = new Date().getHours();
              if (is_online == "online") {
                const players = server.players;
                const map = mapserver.map;
                const maxplayers = server.maxPlayers;
                const queue = server.details.rust_queued_players;
                let EventAnnouncement = "";
                players_dc = players;
                maxplayers_dc = maxplayers;
                currentmap_dc = map;
                currentmap_dc = currentmap_dc.substring(3);
                let Servermsg = "Seeding Time!";
                if (players > 40) {
                  Servermsg = "Time to Kill";
                }
                dc_seedinState = Servermsg;
                if (
                  (today == 3 || today == 5 || today == 6) &&
                  (hours >= 19 && hours <= 21)
                ) {
                  EventAnnouncement = "EVENT!";
                }
                EventAnnouncement_dc = EventAnnouncement;
                let status = `${EventAnnouncement} ${players}/${maxplayers} ${currentmap_dc} ${Servermsg}  ${EventAnnouncement}`;
                if (typeof queue !== "undefined" && queue != "0") {
                  status += ` (${queue} ${queueMessage})`;
                }
                if (debug)
                  console.log(
                    "Updated from battlemetrics, serverid: " + server.id
                  );
                serverStatus = false;
                return client.user.setActivity(status, { type: statusType });
              } else {
                serverStatus = true;
                return client.user.setActivity("Offline ||Updating ");
              }
            }
          }
        );
      }
      if (apiSite == 4) {
        if (!serverIp || !serverPort) {
          console.log("You have to configure serverIP/port");
          process.exit();
        } else {
          const sq = new SourceQuery(1000); // 1000ms timeout
          sq.open(serverIp, serverPort);

          sq.getInfo(function (err, info) {
            if (err) {
              return client.user.setActivity("Offline");
            } else {
              //                           if (debug) { console.log('Server Info: \nIP: %s\nPort: %s\nName: %s\nPlayers: %s/%s', serverIp, serverPort, info.name, info.players, info.maxplayers) }
              const players = info.players;
              const maxplayers = info.maxplayers;
              let status = `${players}/${maxplayers}`;
              return client.user.setActivity(status, { type: statusType });
            }
          });
        }
      }
    };
    // End Functions

    try {
      var config = require("./config/server1.json");
    } catch (error) { console.error(error);}
    const client = new Discord.Client();
    let timevat;
    timevat = 1000;
    const updateInterval =
        timevat * config.updateInterval || 1000 * 3;
    const debug = process.env.debug || config.debug;
    const apiUrl = process.env.apiUrl || config.apiUrl;
    const apiSite = process.env.apiSite || config.apiSite;
    const serverIp = process.env.serverIp || config.serverIp;
    const serverPort = process.env.serverPort || config.serverPort;
    const enableRcon = process.env.enableRcon || config.enableRcon;
    const prefix = process.env.prefix || config.prefix;
    const roles = process.env.roles || config.roles;
    const queueMessage = process.env.queueMessage || config.queueMessage;
    const statusType = process.env.statusType || config.statusType;
    var setactivState = false;

    client.on("ready", () => {
      console.log(
        `Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`
      );
      updateActivity();
      setInterval(function () {
        updateActivity();
      }, updateInterval);
    });

let hello;
    client.on("message", message => {
      if ((hello = message.content.toLowerCase()) !== `${prefix}ilovehawaiipizza`) {
        return;
      }
      if (serverStatus) {
        console.log(`${serverStatus} Is Offline`);
        dc_message = new Discord.MessageEmbed()
            .setColor('#ffcc00')
            .setTitle('EU-Server-Status')
            .setThumbnail('https://thumbs.gfycat.com/GenuineHideousJuliabutterfly-size_restricted.gif')
            .addFields(
                {name: `Status`, value: "Currently offline; maybe Updating see #announcements"})
            .setTimestamp()
            .setFooter('Created by: VileEnd', 'https://static-cdn.jtvnw.net/jtv_user_pictures/63d0d633-72a6-4fda-bfb0-709cea4dcf04-profile_image-70x70.png');
      } else {
        dc_message = new Discord.MessageEmbed()
            .setColor('#ffcc00')
            .setTitle('EU-Server-Status')
            .setThumbnail('https://media1.tenor.com/images/8f4550dcf8cef9f7fbf8306d303e50bf/tenor.gif')
            .addFields(
                {name: `Players: `, value: `${players_dc}/${maxplayers_dc}`},
                {name: `Map:`, value: `${currentmap_dc}`},
                {name: `Status`, value: `${dc_seedinState}`})
            .setTimestamp()
            .setFooter('Created by: VileEnd', 'https://static-cdn.jtvnw.net/jtv_user_pictures/63d0d633-72a6-4fda-bfb0-709cea4dcf04-profile_image-70x70.png');
      }
      message.channel
          .send(dc_message)
          .then(msgReact => {
            msgReact.react('🔄');
            msgReact.react('😍');

            const filter = (reaction, user) => {
              console.log("MOIN")
              setactivState = false
              return ['🔄', '😍'].includes(reaction.emoji.name) && user.id === message.author.id
            };

            msgReact.awaitReactions(filter, {max: 1, time: 60000})
                .then(collected => {
                  const reaction = collected.first();
                  if (reaction.emoji.name === '🔄') {
                    console.log("HEY!")
                    if (!serverStatus) {
                      const newdc_message = new Discord.MessageEmbed()
                          .setColor('#ffcc00')
                          .setTitle('EU-Server-Status')
                          .setThumbnail('https://media1.tenor.com/images/8f4550dcf8cef9f7fbf8306d303e50bf/tenor.gif')

                          .addFields(
                              {name: `Players: `, value: `${players_dc}/${maxplayers_dc}`},
                              {name: `Map:`, value: `${currentmap_dc}`},
                              {name: `Status`, value: `${dc_seedinState}`})

                          .setTimestamp()
                          .setFooter('Created by: VileEnd', 'https://static-cdn.jtvnw.net/jtv_user_pictures/63d0d633-72a6-4fda-bfb0-709cea4dcf04-profile_image-70x70.png')
                      msgReact.edit(newdc_message);
                    }
                  }
                })
          })
    })


    client.on("guildCreate", (guild) => {
      console.log(
        `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`
      );
    });

    client.on("guildDelete", (guild) => {
      console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    });
    let error;
 client.on("error", error =>{
      if (debug) console.log(error);
    });

    process.on("unhandledRejection", (error:any) => {
      console.log(typeof error)
      if (error.code == "TOKEN_INVALID")
        return console.log(
          "Error: An invalid token was provided.\nYou have maybe added client secret instead of BOT token.\nPlease set BOT token"
        );
      return console.error("Unhandled promise rejection:", error);
    });

    client.login(process.env.token || config.token);
  }
});




