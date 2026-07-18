// Structured logging utility for StatuteSense

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const CURRENT_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL || 'INFO'] || LOG_LEVELS.INFO;

export function log(level, message, context = {}) {
  const levelValue = LOG_LEVELS[level] || LOG_LEVELS.INFO;
  if (levelValue < CURRENT_LEVEL) return;

  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  if (level === 'ERROR') {
    console.error(JSON.stringify(logEntry));
  } else if (level === 'WARN') {
    console.warn(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}

export const logger = {
  debug: (msg, ctx) => log('DEBUG', msg, ctx),
  info: (msg, ctx) => log('INFO', msg, ctx),
  warn: (msg, ctx) => log('WARN', msg, ctx),
  error: (msg, ctx) => log('ERROR', msg, ctx),
};

export function trackError(error, context = {}) {
  logger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    ...context,
  });
  
  // In production, send to error tracking service (e.g., Sentry)
  if (process.env.SENTRY_DSN) {
    // Sentry.captureException(error, { extra: context });
  }
}

export function trackApiCall({ endpoint, method, duration, status, userId }) {
  logger.info('API call completed', {
    endpoint,
    method,
    duration,
    status,
    userId,
  });
}
