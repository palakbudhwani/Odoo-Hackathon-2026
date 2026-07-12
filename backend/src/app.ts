import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import users from './routes/users';
import roles from './routes/roles';
import authRoutes from './routes/auth';
import vehicles from './routes/vehicles';
import drivers from './routes/drivers';
import trips from './routes/trips';
import maintenance from './routes/maintenance';
import fuel from './routes/fuel';
import expenses from './routes/expenses';
import { errorHandler } from './middleware/errorHandler';

const app = express();
app.use(helmet() as any);
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
	res.json({ status: 'ok', service: 'TransitOps API' });
});

app.use('/users', users);
app.use('/roles', roles);
app.use('/auth', authRoutes);
app.use('/vehicles', vehicles);
app.use('/drivers', drivers);
app.use('/trips', trips);
app.use('/maintenance', maintenance);
app.use('/fuel', fuel);
app.use('/expenses', expenses);

app.use(errorHandler);

export default app;
