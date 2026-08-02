import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const DUMMY_PASSWORD_HASH = `scrypt:${"0".repeat(SALT_LENGTH * 2)}:${"0".repeat(KEY_LENGTH * 2)}`;

export async function hashPassword(password: string) {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;

  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string | null | undefined) {
  const [scheme, salt, storedKey] = (storedHash ?? DUMMY_PASSWORD_HASH).split(":");

  if (scheme !== "scrypt" || !salt || !storedKey) {
    return false;
  }

  const storedBuffer = Buffer.from(storedKey, "hex");
  const derivedKey = (await scryptAsync(password, salt, storedBuffer.length)) as Buffer;

  if (storedBuffer.length !== derivedKey.length) {
    return false;
  }

  return Boolean(storedHash) && timingSafeEqual(storedBuffer, derivedKey);
}

export function isStrongSeedPassword(password: string) {
  return (
    password.length >= 12 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}
