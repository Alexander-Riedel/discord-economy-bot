const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Shows a user their balance"),
    async execute(interaction, profileData) {
        const { balance} = profileData;
        const userId = interaction.user.id;
        console.log(interaction.user);
        await interaction.reply(`<@${userId}>, du hast ${balance} coins`);
    },
};