const { SlashCommandBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("work")
        .setDescription("Gehe arbeiten, um Coins zu verdienen"),
    async execute(interaction, profileData) {
        const { id } = interaction.user;
        const { workLastUsed, atWork } = profileData;

        // Überprüfe den aktuellen Wochentag (0 = Sonntag, 6 = Samstag)
        const weekDays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
        /*const today = new Date().getDay();*/
        const todayName = weekDays[today];
        console.log("const today = " + today + " (" + todayName + ")");

        if (today === 0 || today === 6) {
            return await interaction.reply({
                content: "Du kannst nur von Montag bis Freitag arbeiten.",
                ephemeral: true,
            });
        }

        // Prüfen, ob der Befehl heute bereits benutzt wurde
        const lastUsedDate = new Date(workLastUsed);
        const todayDate = new Date();
        /*console.log("const lastUsedDate = ", lastUsedDate.toLocaleDateString('de-DE'));*/
        /*console.log("const todayDate = ", todayDate.toLocaleDateString('de-DE'));*/

        const isSameDay = lastUsedDate.getFullYear() === todayDate.getFullYear() &&
            lastUsedDate.getMonth() === todayDate.getMonth() &&
            lastUsedDate.getDate() === todayDate.getDate();

        if (isSameDay) {
            return await interaction.reply({
                content: "Du warst heute schon arbeiten. Du kannst nur einmal am Tag arbeiten gehen.",
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
                        atWork: true,
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
        
        // Berechne die Zeit 8 Stunden später
        const claimTime = new Date(Date.now() + 1 * 60 * 60 * 1000); // 8 * 60 * 60 * 1000
        const hours = claimTime.getHours().toString().padStart(2, "0");
        const minutes = claimTime.getMinutes().toString().padStart(2, "0");

        await interaction.reply(`Du bist arbeiten gegangen. Mit </claim:1287671341469663314> kannst du deinen Lohn um **${hours}:${minutes} Uhr** abholen.`);
    },
};
