import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const verifications = pgTable("verifications", {
  id: serial("id").primaryKey(),
  discordId: text("discord_id").notNull(),
  walletAddress: text("wallet_address").notNull(),
  verified: boolean("verified").default(false).notNull(),
  verifiedAt: timestamp("verified_at"),
  // Add fields for secure wallet verification
  challenge: text("challenge"),
  challengeExpiry: timestamp("challenge_expiry"),
  midnightAuthorized: boolean("midnight_authorized").default(false),
});

// Schema for initiating verification
export const initiateVerificationSchema = createInsertSchema(verifications).pick({
  discordId: true,
});

// Schema for completing verification
export const completeVerificationSchema = createInsertSchema(verifications).pick({
  discordId: true,
  walletAddress: true,
});

export type InitiateVerification = z.infer<typeof initiateVerificationSchema>;
export type CompleteVerification = z.infer<typeof completeVerificationSchema>;
export type Verification = typeof verifications.$inferSelect;