const { SlashCommandBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("work")
        .setDescription("Gehe arbeiten, um Coins zu verdienen"),
    async execute(interaction, profileData) {
        const { id } = interaction.user;
        const { workLastUsed } = profileData;

        // Überprüfe den aktuellen Wochentag (0 = Sonntag, 6 = Samstag)
        const today = new Date().getDay();
        if (today === 0 || today === 6) {
            return await interaction.reply({
                content: "Du kannst nur von Montag bis Freitag arbeiten.",
                ephemeral: true,
            });
        }

        // Prüfen, ob der Befehl heute bereits benutzt wurde
        const lastUsedDate = new Date(workLastUsed);
        const todayDate = new Date();
        const isSameDay = lastUsedDate.getUTCFullYear() === todayDate.getUTCFullYear() &&
            lastUsedDate.getUTCMonth() === todayDate.getUTCMonth() &&
            lastUsedDate.getUTCDate() === todayDate.getUTCDate();

        if (isSameDay) {
            return await interaction.reply({
                content: "Du bist heute bereits zur Arbeit gegangen. Du kannst nur einmal am Tag arbeiten gehen.",
                ephemeral: true,
            });
        }

        // Speichern, dass der Benutzer heute arbeiten gegangen ist
        try {
            await profileModel.findOneAndUpdate(
                { userId: id },
                {
                    $set: {
                        workLastUsed: Date.now(),
                        claimed: false,
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

        console.log(workLastUsed);

        // Berechne die Zeit 8 Stunden später
        const claimTime = new Date(Date.now() + 8 * 60 * 60 * 1000);
        const hours = claimTime.getHours().toString().padStart(2, "0");
        const minutes = claimTime.getMinutes().toString().padStart(2, "0");

        await interaction.reply(`Du bist arbeiten gegangen. Mit </claim:0> kannst du deinen Lohn um ${hours}:${minutes} Uhr abholen.`);
    },
};
