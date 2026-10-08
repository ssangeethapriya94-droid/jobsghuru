import crypto from "crypto";
import bcrypt from "bcryptjs";

const LEGACY_SALT = "careerbridge_salt_2026";

export function isBcryptHash(hash: string): boolean {
  return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(hash);
}

export function hashLegacyPassword(password: string): string {
  return crypto.createHash("sha256").update(password + LEGACY_SALT).digest("hex");
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export function hashPasswordSync(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!hash || !password) return false;

  if (isBcryptHash(hash)) {
    return await bcrypt.compare(password, hash);
  }

  // Fallback to legacy SHA256 check
  const legacyHashed = hashLegacyPassword(password);
  return legacyHashed === hash;
}

export function verifyPasswordSync(password: string, hash: string): boolean {
  if (!hash || !password) return false;

  if (isBcryptHash(hash)) {
    return bcrypt.compareSync(password, hash);
  }

  const legacyHashed = hashLegacyPassword(password);
  return legacyHashed === hash;
}
