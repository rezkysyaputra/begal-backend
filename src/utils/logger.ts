// src/utils/logger.ts
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Konfigurasi format log
const { combine, timestamp, printf, colorize } = format;
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Konfigurasi Winston logger
const logger = createLogger({
  format: combine(
    colorize(), // Menambahkan warna pada log di konsol
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d', // Menyimpan log selama 14 hari
    }),
  ],
});

// Log pesan error ke file terpisah
logger.add(new transports.File({ filename: 'logs/error.log', level: 'error' }));

export default logger;
