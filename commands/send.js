const { SlashCommandBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("send")
        .setDescription("Sende eine Anzahl an Coins an einen anderen Benutzer ( Gebühr 2,5 % )")
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("Der Benutzer, der die Coins erhalten soll")
                .setRequired(true)
        )
        .addNumberOption((option) =>
            option
                .setName("amount")
                .setDescription("Die Anzahl der Coins, die versendet werden sollen (mit zwei Dezimalstellen)")
                .setRequired(true)
                .setMinValue(1.00)
        ),
    async execute(interaction, profileData) {
        const receiveUser = interaction.options.getUser("user");
        const sendAmt = parseFloat(interaction.options.getNumber("amount").toFixed(2));

        const { coins } = profileData;

        if (coins < sendAmt) {
            await interaction.deferReply({ ephemeral: true });
            return await interaction.editReply(
                `Du hast nicht genügend Coins. Dein Guthaben: **${coins.toLocaleString('de-DE', { minimumFractionDigits: 2 })}**.`
            );
        }

        const receiveUserData = await profileModel.findOneAndUpdate(
            { userId: receiveUser.id },
            { $inc: { coins: sendAmt } }
        );

        if (!receiveUserData) {
            await interaction.deferReply({ ephemeral: true });
            return await interaction.editReply(
                `**${receiveUser.globalName}** hat noch keine Wallet. Du kannst die **${sendAmt.toLocaleString('de-DE', { minimumFractionDigits: 2 })} Coins** __nicht__ versenden.`
            );
        }

        await interaction.deferReply();

        await profileModel.findOneAndUpdate(
            { userId: interaction.user.id },
            { $inc: { coins: -sendAmt } }
        );

        interaction.editReply(
            `Du hast **${receiveUser.globalName}** **${sendAmt.toLocaleString('de-DE', { minimumFractionDigits: 2 })} Coins** gesendet.`
        );
    },
};
