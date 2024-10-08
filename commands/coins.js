const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("coins")
        .setDescription("Zeigt die Anzahl der Coins in deiner Wallet"),
    async execute(interaction, profileData) {
        const { coins } = profileData;

        // Ausgabe der Nachricht
        await interaction.reply(`Du hast **${coins} Coins** in deiner Wallet.`);
    },
};