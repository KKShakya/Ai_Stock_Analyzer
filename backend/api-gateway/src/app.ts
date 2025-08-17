import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes';
import { env } from './config/env';
import { errorHandler, notFound } from './middlewares/errorHandler';
import { requestId } from './middlewares/requestId';
import { rateLimit } from './middlewares/rateLimit';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(morgan('dev'));
app.use(express.json());
app.use(requestId);
app.use(rateLimit);

app.use('/app/v1', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
