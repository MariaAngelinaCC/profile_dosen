import crypto from "crypto"

// Simple password hashing (gunakan bcrypt untuk production)
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export function comparePassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex")
}
