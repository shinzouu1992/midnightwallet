import { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// Store the last interaction for each user to respond after verification
const userInteractions = new Map();

async function checkIfUserVerified(interaction: any): Promise<boolean> {
  try {
    if (!process.env.GUILD_ID || !process.env.VERIFIED_ROLE_ID) {
      throw new Error('Missing required environment variables');
    }

    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const member = await guild.members.fetch(interaction.user.id);
    return member.roles.cache.has(process.env.VERIFIED_ROLE_ID);
  } catch (error) {
    // Only log actual errors, not expected cases
    if (error.code !== 10062 && error.code !== 40060) {
      console.error('❌ Error checking user verification status:', error);
    }
    return false;
  }
}

export async function sendVerificationSuccess(userId: string) {
  try {
    const interaction = userInteractions.get(userId);
    if (!interaction) {
      console.log('⚠️ No stored interaction found for user:', userId);
      return;
    }

    const successEmbed = new EmbedBuilder()
      .setColor(0x111111)
      .setTitle('✨ Verification Successful!')
      .setDescription('Welcome to the Midnight Network community! Your wallet has been verified.')
      .addFields(
        { 
          name: '📚 Documentation',
          value: '[View Documentation](https://docs.midnight.network/)',
          inline: true
        },
        { 
          name: '🌐 Website',
          value: '[Visit Website](https://midnight.network/)',
          inline: true
        },
        { 
          name: '🐦 Twitter',
          value: '[Follow Us](https://x.com/MidnightNtwrk)',
          inline: true
        }
      )
      .setFooter({ text: '🌙 Welcome to Midnight Network' })
      .setTimestamp();

    await interaction.editReply({
      embeds: [successEmbed],
      components: []
    });

    // Clear the stored interaction
    userInteractions.delete(userId);
  } catch (error) {
    console.error('❌ Error sending verification success message:', error);
  }
}

export function initializeBot() {
  client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    let hasResponded = false;

    try {
      console.log(`🔄 Processing button interaction: ${interaction.customId}`);

      if (interaction.customId === 'verify_wallet') {
        // Store the interaction for later use
        userInteractions.set(interaction.user.id, interaction);

        // Check if user is already verified
        const isVerified = await checkIfUserVerified(interaction);

        if (isVerified) {
          const successEmbed = new EmbedBuilder()
            .setColor(0x111111)
            .setTitle('✨ Already Verified!')
            .setDescription('You are already verified and have access to our community!')
            .addFields(
              { 
                name: '📚 Documentation',
                value: '[View Documentation](https://docs.midnight.network/)',
                inline: true
              },
              { 
                name: '🌐 Website',
                value: '[Visit Website](https://midnight.network/)',
                inline: true
              },
              { 
                name: '🐦 Twitter',
                value: '[Follow Us](https://x.com/MidnightNtwrk)',
                inline: true
              }
            )
            .setFooter({ text: '🌙 Welcome to Midnight Network' })
            .setTimestamp();

          try {
            await interaction.reply({
              embeds: [successEmbed],
              ephemeral: true
            });
            hasResponded = true;
            return;
          } catch (responseError) {
            console.error('❌ Error sending already verified message:', responseError);
            return;
          }
        }

        if (!process.env.VERIFICATION_SERVER) {
          throw new Error('VERIFICATION_SERVER environment variable must be set');
        }

        const verifyUrl = `${process.env.VERIFICATION_SERVER}/verify?discordId=${interaction.user.id}`;
        console.log(`🔗 Generated verification URL: ${verifyUrl}`);

        const verifyButton = new ButtonBuilder()
          .setLabel('Verify Wallet')
          .setStyle(ButtonStyle.Link)
          .setEmoji('✨')
          .setURL(verifyUrl);

        const row = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(verifyButton);

        try {
          if (!hasResponded) {
            await interaction.deferReply({ ephemeral: true });
            hasResponded = true;
          }

          const verifyEmbed = new EmbedBuilder()
            .setColor(0x111111)
            .setTitle('🌕 Verify Your Wallet')
            .setDescription('Click the button below to connect your wallet and complete verification.')
            .setFooter({ text: 'Powered by Midnight Network' })
            .setTimestamp();

          await interaction.editReply({
            embeds: [verifyEmbed],
            components: [row]
          });

          console.log(`✅ Successfully sent verification link to user ${interaction.user.tag}`);
        } catch (responseError: any) {
          if (responseError.code === 40060) {
            console.log('⚠️ Interaction already acknowledged, skipping response');
          } else if (responseError.code === 10062) {
            console.log('⚠️ Interaction expired, unable to respond');
          } else {
            throw responseError;
          }
        }
      }
    } catch (error) {
      console.error('❌ Error handling verification button:', error);

      try {
        if (!hasResponded && !interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: 'Sorry, there was an error processing your request. Please try again later.',
            ephemeral: true
          });
        } else if (hasResponded) {
          await interaction.editReply({
            content: 'Sorry, there was an error processing your request. Please try again later.'
          });
        }
      } catch (responseError) {
        console.error('❌ Failed to send error message:', responseError);
      }
    }
  });

  client.once('ready', async () => {
    console.log(`🤖 Bot is running as ${client.user?.tag}`);

    try {
      if (!process.env.VERIFICATION_CHANNEL_ID) {
        throw new Error('VERIFICATION_CHANNEL_ID not set');
      }

      const channel = await client.channels.fetch(process.env.VERIFICATION_CHANNEL_ID);
      if (!channel?.isTextBased()) {
        throw new Error('Could not find verification channel');
      }

      const embed = new EmbedBuilder()
        .setColor(0x111111)  // Dark grey to match Midnight's dark theme
        .setTitle('🌕 Midnight Wallet Verification')
        .setDescription('Ready to join the Midnight community? Follow these simple steps to verify your wallet:')
        .addFields(
          { 
            name: '🔹 Step 1',
            value: 'Install the Midnight Lace Wallet browser extension if you haven\'t already.',
            inline: false
          },
          { 
            name: '🔹 Step 2',
            value: 'Click Verify Wallet below to connect securely.',
            inline: false
          },
          { 
            name: '🔹 Step 3',
            value: 'Complete the process to unlock full access to our community.',
            inline: false
          },
          {
            name: '🔒 Safety Tip',
            value: 'Never share your recovery phrase or private keys with ANYONE.',
            inline: false
          }
        )
        .setFooter({ text: 'Powered by Midnight Lace Wallet' })
        .setTimestamp();

      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setLabel('Install Wallet')
            .setStyle(ButtonStyle.Link)
            .setEmoji('🌐')
            .setURL('https://docs.midnight.network/develop/tutorial/using/chrome-ext'),
          new ButtonBuilder()
            .setCustomId('verify_wallet')
            .setLabel('Verify Wallet')
            .setStyle(ButtonStyle.Secondary)  // Changed from Primary to Secondary for darker theme
            .setEmoji('✨')
        );

      try {
        await channel.send({
          embeds: [embed],
          components: [row]
        });
        console.log('✅ Verification message sent successfully');
      } catch (sendError) {
        console.error('❌ Failed to send verification message:', sendError);
        throw sendError;
      }
    } catch (error) {
      console.error('❌ Error in bot setup:', error);
    }
  });

  client.on('error', error => {
    console.error('❌ Discord client error:', error);
  });

  const token = process.env.DISCORD_TOKEN?.trim();
  if (!token) {
    throw new Error('No Discord token provided');
  }

  client.login(token).catch(error => {
    console.error('❌ Failed to login:', error);
  });

  return client;
}