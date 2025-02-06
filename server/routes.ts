import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { initiateVerificationSchema, completeVerificationSchema } from "@shared/schema";
import { Client, GatewayIntentBits } from 'discord.js';
import { sendVerificationSuccess } from './discord-bot';
import crypto from 'crypto';

// Initialize Discord client with proper intents
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);

// Add ready event to confirm bot is initialized
client.once('ready', () => {
  console.log('🤖 Discord client ready for role assignment');
});

function generateChallenge(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function registerRoutes(app: Express): Server {
  // Step 1: Initiate verification
  app.post("/api/verify/initiate", async (req, res) => {
    try {
      console.log('📝 Initiating verification request:', { body: req.body });
      const data = initiateVerificationSchema.parse(req.body);

      // Generate challenge
      const challenge = generateChallenge();
      const challengeExpiry = new Date();
      challengeExpiry.setMinutes(challengeExpiry.getMinutes() + 5); // 5 minutes expiry

      // Store verification request
      const verification = await storage.createVerification({
        ...data,
        challenge,
        challengeExpiry,
        verified: false,
        walletAddress: '', // Will be set during completion
      });

      res.json({ 
        success: true,
        challenge,
        expiresAt: challengeExpiry
      });
    } catch (error) {
      console.error('❌ Verification initiation error:', error);
      res.status(400).json({ error: "Invalid verification request" });
    }
  });

  // Step 2: Complete verification
  app.post("/api/verify/complete", async (req, res) => {
    try {
      console.log('📝 Completing verification:', { body: req.body });
      const data = completeVerificationSchema.parse(req.body);

      // Get stored verification
      const pendingVerification = await storage.getVerificationByDiscordId(data.discordId);
      if (!pendingVerification) {
        throw new Error('No pending verification found');
      }

      // Check if challenge has expired
      if (pendingVerification.challengeExpiry && new Date() > new Date(pendingVerification.challengeExpiry)) {
        throw new Error('Challenge has expired');
      }

      // Update verification
      const verification = await storage.updateVerification(pendingVerification.id, {
        ...pendingVerification,
        walletAddress: data.walletAddress,
        verified: true,
        verifiedAt: new Date(),
      });

      // If verification successful, assign Discord role
      if (verification.verified && verification.discordId) {
        try {
          if (!process.env.GUILD_ID) {
            throw new Error('GUILD_ID not configured');
          }
          if (!process.env.VERIFIED_ROLE_ID) {
            throw new Error('VERIFIED_ROLE_ID not configured');
          }

          console.log(`🔄 Assigning role to user ${verification.discordId}`);

          // Check if client is ready
          if (!client.isReady()) {
            throw new Error('Discord client not ready');
          }

          const guild = await client.guilds.fetch(process.env.GUILD_ID);
          console.log('✅ Found guild:', guild.name);

          const member = await guild.members.fetch(verification.discordId);
          console.log('✅ Found member:', member.user.tag);

          await member.roles.add(process.env.VERIFIED_ROLE_ID);
          console.log(`✅ Successfully assigned role to user ${verification.discordId}`);

          // Send success message in Discord
          await sendVerificationSuccess(verification.discordId);
          console.log('✅ Sent verification success message');

          // Send success response
          res.json({ 
            success: true,
            roleAssigned: true,
            message: "Verification successful and role assigned!"
          });
        } catch (error) {
          console.error('❌ Error assigning Discord role:', error);
          // Send error response but don't fail the request
          res.json({ 
            success: true,
            roleAssigned: false,
            error: "Failed to assign role. Please contact an administrator."
          });
        }
      } else {
        console.log('⚠️ Verification not complete or Discord ID missing:', verification);
        res.json({ success: false, message: "Verification failed" });
      }
    } catch (error) {
      console.error('❌ Verification completion error:', error);
      res.status(400).json({ 
        success: false,
        error: error instanceof Error ? error.message : "Invalid verification data" 
      });
    }
  });

  // Backwards compatibility endpoint - redirects to new flow
  app.post("/api/verify", async (req, res) => {
    res.status(400).json({ 
      error: "Please use the new verification flow (/api/verify/initiate and /api/verify/complete)" 
    });
  });

  app.get("/api/verify/:discordId", async (req, res) => {
    const { discordId } = req.params;
    const verification = await storage.getVerificationByDiscordId(discordId);

    if (!verification) {
      res.status(404).json({ error: "Verification not found" });
      return;
    }

    res.json(verification);
  });

  const httpServer = createServer(app);
  return httpServer;
}