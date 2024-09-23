/**
 * Command handler for the /work command.
 * This command allows the user to go to work and earn coins, but only once per day from Monday to Friday.
 * The user can claim their reward after 8 hours.
 *
 * @module commands/work
 */

const { SlashCommandBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("work")
        .setDescription("Gehe arbeiten, um Coins zu verdienen"),

    /**
    * Executes the /work command.
    *
    * @async
    * @param {CommandInteraction} interaction - The interaction object representing the command execution.
    * @param {Object} profileData - The user's profile data from the database.
    * @param {string} profileData.id - The user ID.
    * @param {number} profileData.workLastUsed - The timestamp of the last time the user went to work.
    * @param {boolean} profileData.atWork - Indicates whether the user is currently at work.
    * @returns {Promise<void>}
    */
    async execute(interaction, profileData) {
        const { id } = interaction.user;
        const { workLastUsed, atWork, claimed } = profileData;

        // Überprüfe den aktuellen Wochentag (0 = Sonntag, 6 = Samstag)
        const today = new Date().getDay();

        if (today === 0 || today === 6) {
            return await interaction.reply({
                content: "Es ist Wochenende! Du kannst nur von Montag bis Freitag arbeiten, du Arbeitstier!",
                ephemeral: true,
            });
        }

        // Überprüfen ob der Benutzer noch auf Arbeit ist, aber schon claimen kann
        const workLastUsedDate = new Date(workLastUsed);
        const currentDate = new Date();
        const timeDifference = currentDate - workLastUsedDate;
        const hoursSinceWork = timeDifference / (1000 * 60 * 60);

        if (!claimed && atWork && hoursSinceWork > 8) {
            return await interaction.reply({
                content: "Du hast deine Arbeit erledigt. Du bekommst dein Gehalt mit </claim:1287671341469663314>.",
                ephemeral: true,
            });
        }

        // Überprüfen ob der Benutzer noch auf Arbeit ist
        if (!claimed && atWork) {
            return await interaction.reply({
                content: "Du bist noch auf Arbeit!",
                ephemeral: true,
            });
        }

        // Prüfen, ob der Befehl heute bereits benutzt wurde
        const lastUsedDate = new Date(workLastUsed);
        const todayDate = new Date();

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
        const claimTime = new Date(Date.now() + 8 * 60 * 60 * 1000);
        const hours = claimTime.getHours().toString().padStart(2, "0");
        const minutes = claimTime.getMinutes().toString().padStart(2, "0");

        await interaction.reply(`Du bist arbeiten gegangen. Mit </claim:1287671341469663314> kannst du deinen Lohn um **${hours}:${minutes} Uhr** abholen.`);
    },
};
