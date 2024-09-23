const { SlashCommandBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");
const { workMin, workMax } = require("../globalValues.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("claim")
        .setDescription("Hole dein Gehalt nach der Arbeit ab"),
    async execute(interaction, profileData) {
        const { id } = interaction.user;
        const { workLastUsed, claimed } = profileData;

        // Prüfen, ob der Benutzer bereits sein Gehalt beansprucht hat
        if (claimed) {
            return await interaction.reply({
                content: "Du hast dein Gehalt bereits abgeholt. Du musst erst arbeiten gehen, bevor du dein nächstes Gehalt beanspruchen kannst.",
                ephemeral: true,
            });
        }

        // Berechne die Differenz seit der letzten Arbeit
        const workLastUsedDate = new Date(workLastUsed);
        const currentDate = new Date();
        const timeDifference = currentDate - workLastUsedDate;
        const hoursSinceWork = timeDifference / (1000 * 60 * 60);

        // Überprüfe, ob 8 Stunden seit dem letzten Arbeiten vergangen sind
        if (hoursSinceWork < 8) {
            const remainingTime = 8 - hoursSinceWork;
            const remainingHours = Math.floor(remainingTime);
            const remainingMinutes = Math.floor((remainingTime - remainingHours) * 60);
            return await interaction.reply({
                content: `Du kannst deinen Lohn erst in **${remainingHours} Std. ${remainingMinutes} Min.** abholen.`,
                ephemeral: true,
            });
        }

        // Berechne den zufälligen Lohn
        const randomAmt = Math.floor(
            Math.random() * (workMax - workMin) + workMin
        );

        try {
            // Aktualisiere den Kontostand und setze claimed auf true
            await profileModel.findOneAndUpdate(
                { userId: id },
                {
                    $inc: {
                        balance: randomAmt,
                    },
                    $set: {
                        claimed: true,
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

        await interaction.reply(`Du hast **${randomAmt} Coins** verdient. Die Coins wurden an deine Wallet überwiesen.`);
    },
};
