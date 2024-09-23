const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("coins")
        .setDescription("Zeigt die Anzahl der Coins in deiner Wallet"),
    async execute(interaction, profileData) {
        const { coins } = profileData;

        // Formatieren der Zahl mit Komma als Dezimaltrennzeichen
        const formattedCoins = coins.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // Ausgabe der Nachricht
        await interaction.reply(`Du hast **${formattedCoins} Coins** in deiner Wallet.`);
    },
};