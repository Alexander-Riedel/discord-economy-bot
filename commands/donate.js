const { SlashCommandBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("donate")
        .setDescription("Sende eine Anzahl an Coins an einen anderen Benutzer")
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("Der Benutzer der die Coins erhalten soll")
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
                .setName("amount")
                .setDescription("Die Anzahl der Coins, die versendet werden sollen")
                .setRequired(true)
                .setMinValue(1)
        ),
    async execute(interaction, profileData) {
        const receiveUser = interaction.options.getUser("user");
        const donateAmt = interaction.options.getInteger("amount");

        const { coins } = profileData;

        if (coins < donateAmt) {
            await interaction.deferReply({ ephemeral: true });
            return await interaction.editReply(
                `Du hast keine ${donateAmt} Coins in deiner Wallet.`
            );
        }

        const receiveUserData = await profileModel.findOneAndUpdate(
            {
                userId: receiveUser.id
            },
            {
                $inc: {
                    coins: donateAmt,
                },
            }
        );

        if (!receiveUserData) {
            await interaction.deferReply({ ephemeral: true });
            return await interaction.editReply(
                `**${receiveUser.globalName}** hat noch keine Wallet. Du kannst die **${donateAmt} Coins** __nicht__ versenden.`
            );
        }

        await interaction.deferReply();

        await profileModel.findOneAndUpdate(
            {
                userId: interaction.user.id,
            },
            {
                $inc: {
                    coins: -donateAmt,
                },
            }
        );

        interaction.editReply(
            `Du hast **${receiveUser.globalName}** **${donateAmt} Coins** gesendet.`
        );
    },
};