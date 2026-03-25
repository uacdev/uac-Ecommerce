import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import productRouter from './routes/productRouter';
import orderRouter from './routes/orderRouter';
import statsRouter from './routes/statsRouter';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        service: 'UFL-Ecommerce-API',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/stats', statsRouter);

app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to UFL E-Commerce API' });
});

export default app;
