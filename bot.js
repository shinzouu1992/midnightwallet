import { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', async () => {
    console.log(`🤖 Bot is running as ${client.user.tag}`);

    try {
        // Get the verification channel
        console.log('Fetching verification channel...');
        const channel = await client.channels.fetch(process.env.VERIFICATION_CHANNEL_ID);
        if (!channel || !channel.isTextBased()) {
            console.error('❌ Could not find verification channel');
            process.exit(1);
        }
        console.log('✅ Found verification channel');

        // Create the embed message with a sleek dark theme
        const embed = new EmbedBuilder()
            .setColor('#00006D')
            .setTitle('🌙 Midnight Wallet Verification')
            .setDescription('Connect your wallet and get verified in our community!')
            .addFields(
                { name: '🔹 Step 1', value: 'Install Midnight Lace Wallet browser extension' },
                { name: '🔹 Step 2', value: 'Click "Verify Wallet" below to connect' },
                { name: '🔹 Step 3', value: 'Complete the verification process' }
            )
            .setFooter({ text: '✨ Powered by Midnight Network' });

        // Create the buttons
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Install Wallet')
                    .setStyle(ButtonStyle.Link)
                    .setEmoji('🌐')
                    .setURL('https://docs.midnight.network/develop/tutorial/using/chrome-ext'),
                new ButtonBuilder()
                    .setLabel('Verify Wallet')
                    .setStyle(ButtonStyle.Link)
                    .setEmoji('✨')
                    .setURL(`${process.env.VERIFICATION_SERVER}/verify`)
            );

        // Send the message
        console.log('Sending verification message...');
        await channel.send({ 
            embeds: [embed], 
            components: [row]
        });

        console.log('✅ Verification message sent successfully');
    } catch (error) {
        console.error('Error in bot setup:', error);
        process.exit(1);
    }
});

// Error handling for the client
client.on('error', error => {
    console.error('Discord client error:', error);
    process.exit(1);
});

// Clean up the token - remove any whitespace
const token = process.env.DISCORD_TOKEN?.trim();
if (!token) {
    throw new Error('No Discord token provided in environment variables');
}

// Login to Discord
client.login(token).catch(error => {
    console.error('Failed to login:', error);
    process.exit(1);
});