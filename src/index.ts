import app from './app/app';
import logger from './utils/logger';

const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`App running on port: http://localhost:${port}`);
});
