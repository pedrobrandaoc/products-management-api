import { randomBytes } from "node:crypto";

export function generateCsrfToken() {
  return randomBytes(32).toString("hex");
}
