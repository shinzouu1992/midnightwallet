#!/usr/bin/env node

import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function checkSetup() {
  console.log('🔍 Checking project setup...\n');

  // Check .env file
  const envPath = join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found');
    process.exit(1);
  }

  // Check required environment variables
  const requiredEnvVars = [
    'DISCORD_TOKEN',
    'VERIFICATION_CHANNEL_ID',
    'GUILD_ID',
    'VERIFIED_ROLE_ID',
    'VERIFICATION_SERVER'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars.join(', '));
    process.exit(1);
  }

  // Test Discord bot connection
  console.log('🤖 Testing Discord bot connection...');
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers
    ]
  });

  try {
    await client.login(process.env.DISCORD_TOKEN);
    console.log('✅ Bot login successful');

    // Check guild access
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    console.log('✅ Guild access confirmed:', guild.name);

    // Check channel access
    const channel = await client.channels.fetch(process.env.VERIFICATION_CHANNEL_ID);
    console.log('✅ Channel access confirmed:', channel.name);

    // Check role
    const role = await guild.roles.fetch(process.env.VERIFIED_ROLE_ID);
    console.log('✅ Role access confirmed:', role.name);

    console.log('\n✨ Setup verification complete! All systems are ready.');
  } catch (error) {
    console.error('❌ Error during setup verification:', error.message);
    process.exit(1);
  } finally {
    client.destroy();
  }
}

checkSetup().catch(console.error);
