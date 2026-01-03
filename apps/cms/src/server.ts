import payload from 'payload';
import config from './payload.config.js';

const start = async () => {
  await payload.init({
    config,
    // Other options like secret, email, express app, etc., go here if needed
  });

  payload.logger.info('Payload server started');
};

start();