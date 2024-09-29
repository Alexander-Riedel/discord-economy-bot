const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const profileModel = require("../models/profileSchema");
const { maxPlaysPerDay } = require("../globalValues.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lotto')
        .setDescription('Wähle deine Lottozahlen (5 aus 25)'),
    async execute(interaction, profileData) {
        const { id } = interaction.user;
        const setAmount = 5; // Kosten für einen Lottoschein
        const { coins } = profileData;

        // Überprüfe, ob der Benutzer genügend Coins hat
        if (coins < setAmount) {
            return await interaction.reply({
                content: `Du hast nicht genügend Coins. Ein Lottoschein kostet **5 Coins**, aber du hast nur **${coins.toLocaleString('de-DE')} Coins**.`,
                ephemeral: true,
            });
        }

        // Ziehe 5 Coins vom Benutzer ab
        await profileModel.findOneAndUpdate(
            { userId: id },
            { $inc: { coins: -setAmount } }
        );

        const rows = [];
        let row = new ActionRowBuilder();

        for (let i = 1; i <= 25; i++) {
            if (row.components.length >= 5) {
                rows.push(row);
                row = new ActionRowBuilder();
            }

            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`lotto_${i}`)
                    .setLabel(i.toString())
                    .setStyle(ButtonStyle.Primary)
            );
        }

        if (row.components.length > 0) {
            rows.push(row);
        }

        // Sende die Nachricht mit den Buttons
        await interaction.reply({ content: 'Wähle deine 5 Lottozahlen:', components: rows });

        // Event-Handler, der auf Button-Interaktionen reagiert
        const filter = (i) => i.customId.startsWith('lotto_') && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, max: 5, time: 60000 });

        const selectedNumbers = [];
        collector.on('collect', async (i) => {
            const num = parseInt(i.customId.split('_')[1]);

            if (!selectedNumbers.includes(num)) {
                selectedNumbers.push(num);

                // Buttons aktualisieren: Deaktiviere den gewählten Button
                i.message.components.forEach(actionRow => {
                    actionRow.components.forEach(button => {
                        if (button.customId === i.customId) {
                            button.setDisabled(true).setStyle(ButtonStyle.Secondary);
                        }
                    });
                });

                await i.update({
                    content: `Ausgewählt: ${selectedNumbers.join(', ')}`,
                    components: i.message.components,
                });
            } else {
                await i.reply({ content: `Du hast die Zahl ${num} bereits ausgewählt!`, ephemeral: true });
            }
        });

        collector.on('end', async () => {
            if (selectedNumbers.length < 5) {
                await interaction.followUp({ content: 'Du hast nicht alle 5 Zahlen ausgewählt.', ephemeral: true });
            } else {
                await interaction.followUp({ content: `Deine gewählten Lottozahlen sind: ${selectedNumbers.join(', ')}` });
            }
        });
    },
};
