import { verifications, type Verification } from "@shared/schema";

export interface IStorage {
  createVerification(verification: Omit<Verification, "id">): Promise<Verification>;
  getVerificationByDiscordId(discordId: string): Promise<Verification | undefined>;
  updateVerification(id: number, verification: Partial<Verification>): Promise<Verification>;
}

export class MemStorage implements IStorage {
  private verifications: Map<number, Verification>;
  currentId: number;

  constructor() {
    this.verifications = new Map();
    this.currentId = 1;
  }

  async createVerification(insertVerification: Omit<Verification, "id">): Promise<Verification> {
    const id = this.currentId++;
    const verification: Verification = { 
      ...insertVerification, 
      id
    };
    this.verifications.set(id, verification);
    return verification;
  }

  async getVerificationByDiscordId(discordId: string): Promise<Verification | undefined> {
    return Array.from(this.verifications.values()).find(
      (v) => v.discordId === discordId
    );
  }

  async updateVerification(id: number, updates: Partial<Verification>): Promise<Verification> {
    const verification = this.verifications.get(id);
    if (!verification) {
      throw new Error("Verification not found");
    }

    const updated = {
      ...verification,
      ...updates,
    };
    this.verifications.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();