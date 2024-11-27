import connectDB from './app/database';
import createServer from './app/server';
import logger from './utils/logger';

// connect to database
connectDB();

// start server
const app = createServer();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  logger.info(`App running on port: http://localhost:${port}`);
});
