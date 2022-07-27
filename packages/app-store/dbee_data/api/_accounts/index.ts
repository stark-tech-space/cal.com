import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Routes
import accounts from './routes/accounts';

const baseUrl = '/api/integrations/dbee_data';

const app = express();
const baseRouter = express.Router();

// base routes
baseRouter.use('/accounts/:accountId', accounts)

//middleware
// baseRouter.use()
app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: true }));
// app.use(express.json());
app.use(baseUrl,baseRouter);

export default app;
