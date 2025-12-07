import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/health', healthRouter);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
