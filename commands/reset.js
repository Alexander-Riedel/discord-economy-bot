const { SlashCommandBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reset")
        .setDescription("Setzt die Einstellungen zurück"),
    async execute(interaction, profileData) {
        const { id } = interaction.user;
        const { workLastUsed, claimed, atWork } = profileData;

        try {
            await profileModel.findOneAndUpdate(
                { userId: id },
                {
                    $set: {
                        workLastUsed: 0,
                        claimed: false,
                        atWork: false,
                    },
                }
            );
        } catch (err) {
            console.log(err);
            return await interaction.reply({
                content: "Es gab ein Problem. Bitte versuche es später erneut.",
                ephemeral: true,
            });
        }

        await interaction.reply(`Du hast die Parameter zurückgesetzt. Du kannst jetzt wieder arbeiten gehen.`);
    },
};
