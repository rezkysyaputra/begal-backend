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
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Tambahkan Console logging untuk semua environment
    new transports.Console(),
  ],
});

// Hanya tambahkan DailyRotateFile dan File logging di pengembangan lokal
if (process.env.NODE_ENV === 'development') {
  logger.add(
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d', // Menyimpan log selama 14 hari
    })
  );

  // Log pesan error ke file terpisah hanya di pengembangan
  logger.add(
    new transports.File({ filename: 'logs/error.log', level: 'error' })
  );
}

export default logger;
