import pino, { Logger } from "pino";

// Lightweight universal logger wrapper around pino that works in both
// browser and server (Node / edge) environments without relying on worker
// transports that Next.js cannot bundle (eg. thread-stream).
const isBrowser = typeof window !== "undefined";

export const logger: Logger = pino({
  browser: isBrowser
    ? {
        asObject: true // Log as objects in the browser for better structure
      }
    : undefined,
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: "SYS:HH:MM:ss",
      ignore: "pid,hostname"
    }
  },
  level: process.env.PINO_LOG_LEVEL || "info",
  redact: ["password", "creditCardNumber"]
});
