type LogLevel = 'info' | 'warn' | 'error' | 'debug';

type LogMetadata = Record<string, string | number | boolean | null | undefined>;

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: LogMetadata;
  error?: Error;
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production';

  private formatMessage(entry: LogEntry): string {
    const { level, message, timestamp, metadata, error } = entry;
    const parts = [
      `[${timestamp}]`,
      level.toUpperCase(),
      message,
    ];

    if (metadata) {
      parts.push(JSON.stringify(metadata));
    }

    if (error) {
      parts.push(`\nError: ${error.message}\nStack: ${error.stack}`);
    }

    return parts.join(' ');
  }

  private log(level: LogLevel, message: string, metadata?: LogMetadata, error?: Error): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata,
      error,
    };

    const formatted = this.formatMessage(entry);

    switch (level) {
      case 'error':
        console.error(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'debug':
        if (!this.isProduction) {
          console.debug(formatted);
        }
        break;
      default:
        console.log(formatted);
    }

    // In production, you might want to send to a logging service
    // e.g., Sentry, Datadog, CloudWatch, etc.
  }

  info(message: string, metadata?: LogMetadata): void {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: LogMetadata): void {
    this.log('warn', message, metadata);
  }

  error(message: string, error?: Error, metadata?: LogMetadata): void {
    this.log('error', message, metadata, error);
  }

  debug(message: string, metadata?: LogMetadata): void {
    this.log('debug', message, metadata);
  }
}

export const logger = new Logger();
