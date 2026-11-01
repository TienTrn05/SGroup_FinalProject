import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

export const hashPassword = async (password) => {
  const salt = randomBytes(16).toString("hex");
  const hash = await scryptAsync(password, salt, 64, {
    N: 32768,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  });
  // Store algorithm, parameters, salt and hash together for future verification.
  return `scrypt$32768$8$1$${salt}$${hash.toString("hex")}`;
};

export const verifyPassword = async (password, storedHash) => {
  if (typeof storedHash !== "string") return false;
  const parts = storedHash.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt" ||
      parts[1] !== "32768" || parts[2] !== "8" || parts[3] !== "1" ||
      !/^[a-f0-9]{32}$/i.test(parts[4]) || !/^[a-f0-9]{128}$/i.test(parts[5])) {
    return false;
  }
  const expected = Buffer.from(parts[5], "hex");
  const actual = await scryptAsync(password, parts[4], expected.length, {
    N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024,
  });
  return timingSafeEqual(actual, expected);
};
