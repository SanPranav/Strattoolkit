import pino, { Logger } from "pino";

const levels = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10
} as const;

export const logger: Logger<keyof typeof levels> = pino({
  browser: { asObject: true },
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: "SYS:HH:MM:ss",
      ignore: "pid,hostname"
    }
  },
  redact: ["password", "email"],
  level: process.env.PINO_LOG_LEVEL || "debug",
  customLevels: levels,
  useOnlyCustomLevels: true,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    }
  },
  timestamp: pino.stdTimeFunctions.isoTimeNano
});
