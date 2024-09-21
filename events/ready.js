const {Events} = require("discord.js");

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logges in as ${client.user.tag}`);
    },
};