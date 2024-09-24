const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("@discordjs/builders");
const profileModel = require("../models/profileSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Zeige die Top 10 Coin Besitzer an"),
    async execute(interaction, profileData) {
        /*console.log(interaction);*/
        await interaction.deferReply();

        const { globalName, id } = interaction.user;
        console.log(interaction.user);
        const { coins } = profileData;

        let leaderboardEmbed = new EmbedBuilder()
            .setTitle("**Top 10 Coin Besitzer**")
            .setColor(0xba0719)
            .setFooter({ text: "Du hast noch keinen Rang." });

        const members = await profileModel
            .find()
            .sort({ coins: -1 })
            .catch((err) => console.log(err));

        const memberIdx = members.findIndex((member) => member.userId === id);

        leaderboardEmbed.setFooter({
            text: `${globalName}, du bist die #${memberIdx + 1} mit ${coins} Coins`,
        })

        const topTen = members.slice(0, 10);

        let desc = "";
        for (let i = 0; i < topTen.length; i++) {
            let { user } = await interaction.guild.members.fetch(topTen[i].userId);
            if (!user) return;
            let userBalance = topTen[i].coins;
            desc += `**${i + 1}. ${user.globalName}: **${userBalance} coins\n`;
        }

        if (desc !== "") {
            leaderboardEmbed.setDescription(desc);
        }

        await interaction.editReply({ embeds: [leaderboardEmbed] });
    },
};