import axios from 'axios';

const logger = {
  sendLogToServer: async (level: string, message: string, data?: any) => {
    try {
      await axios.post('http://localhost:5000/api/log', { level, message, data });
      console.log(`[LOG SENT]: ${level.toUpperCase()} - ${message}`);
    } catch (err) {
      console.error('Error sending log to server:', err);
    }
  },
  info: (message: string, data?: any) => {
    console.log(`[INFO]: ${message}`, data || '');
    logger.sendLogToServer('info', message, data);
  },
  error: (message: string, data?: any) => {
    console.error(`[ERROR]: ${message}`, data || '');
    logger.sendLogToServer('error', message, data);
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN]: ${message}`, data || '');
    logger.sendLogToServer('warn', message, data);
  },
};

export default logger;
