const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const profileModel = require("../models/profileSchema");
const { maxPlaysPerDay } = require("../globalValues.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play-3-doors")
        .setDescription("Setze Coins und wähle eine Tür")
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("Betrag, den du setzen möchtest (max. 100)")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        ),
    async execute(interaction, profileData) {
        const { id } = interaction.user;
        const setAmount = interaction.options.getInteger("amount");
        const { coins, play3DoorsLastUsed, playCount3Doors } = profileData;

        // Überprüfen ob heute schon gespielt wurde, ansonsten Zähler zurücksetzen
        const lastPlay = new Date(play3DoorsLastUsed);
        const todayDate = new Date();

        const isSameDay = lastPlay.getFullYear() === todayDate.getFullYear() &&
            lastPlay.getMonth() === todayDate.getMonth() &&
            lastPlay.getDate() === todayDate.getDate();

        if (!isSameDay) {
            try {
                await profileModel.findOneAndUpdate(
                    { userId: id },
                    { $set: { playCount3Doors: 0 } }
                );
            } catch (err) {
                console.log(err);
                return await interaction.reply({
                    content: "Es gab ein Problem. Bitte versuche es später erneut.",
                    ephemeral: true,
                });
            }
        }

        // Überprüfen, ob die maximale Anzahl der Spiele pro Tag erreicht wurde
        if (playCount3Doors >= maxPlaysPerDay) {
            return await interaction.reply({
                content: `Du hast die maximale Anzahl von ${maxPlaysPerDay} Spielen pro Tag erreicht. Komme morgen wieder.`,
                ephemeral: true,
            });
        }

        // Überprüfe, ob der Benutzer genügend Coins hat
        if (coins < setAmount) {
            return await interaction.reply({
                content: `Du hast nicht genügend Coins. Dein Wallet-Guthaben: **${coins} Coins**.`,
                ephemeral: true,
            });
        }

        // Erstelle die Buttons für die Türen
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("door1")
                    .setLabel("Tür 1")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("door2")
                    .setLabel("Tür 2")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("door3")
                    .setLabel("Tür 3")
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.reply({
            content: "Wähle eine Tür:",
            components: [row],
        });

        // Warte auf die Button-Interaktion
        const filter = i => {
            return ["door1", "door2", "door3"].includes(i.customId) && i.user.id === id;
        };

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on("collect", async i => {
            const doorChosen = i.customId;
            const randomOutcome = Math.random();
            let resultMessage;

            // Zufallsentscheidung über den Ausgang
            if (randomOutcome < 0.33) {
                try {
                    await profileModel.findOneAndUpdate(
                        { userId: id },
                        {
                            $inc: {
                                coins: -setAmount,
                                playCount3Doors: 1,
                            },
                            $set: {
                                play3DoorsLastUsed: Date.now(),
                            },
                        }
                    );
                    resultMessage = `Verloren: Du hast **${setAmount} Coins** verloren!`;
                } catch (err) {
                    console.log(err);
                    return await interaction.reply({
                        content: "Es gab ein Problem. Bitte versuche es später erneut.",
                        ephemeral: true,
                    });
                }
            } else if (randomOutcome < 0.66) {
                const winnings = setAmount / 2;
                try {
                    await profileModel.findOneAndUpdate(
                        { userId: id },
                        {
                            $inc: {
                                coins: -winnings,
                                playCount3Doors: 1,
                            },
                            $set: {
                                play3DoorsLastUsed: Date.now(),
                            },
                        }
                    );
                    resultMessage = `Halbiert: Du hast **${winnings} Coins** verloren!`;
                } catch (err) {
                    console.log(err);
                    return await interaction.reply({
                        content: "Es gab ein Problem. Bitte versuche es später erneut.",
                        ephemeral: true,
                    });
                }
            } else {
                const winnings = setAmount * 2;
                try {
                    await profileModel.findOneAndUpdate(
                        { userId: id },
                        {
                            $inc: {
                                coins: winnings,
                                playCount3Doors: 1,
                            },
                            $set: {
                                play3DoorsLastUsed: Date.now(),
                            },
                        }
                    );
                    resultMessage = `Verdoppelt: Du hast **${winnings} Coins** gewonnen!`;
                } catch (err) {
                    console.log(err);
                    return await interaction.reply({
                        content: "Es gab ein Problem. Bitte versuche es später erneut.",
                        ephemeral: true,
                    });
                }
            }

            await i.update({ content: `${resultMessage}\nDu hast ${doorChosen} gewählt.`, components: [] });
            collector.stop();
        });

        collector.on("end", collected => {
            if (collected.size === 0) {
                interaction.followUp({ content: "Zeit abgelaufen! Bitte versuche es erneut.", ephemeral: true });
            }
        });
    },
};
