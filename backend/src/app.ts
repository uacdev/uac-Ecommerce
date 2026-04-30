import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import productRouter from './routes/productRouter';
import orderRouter from './routes/orderRouter';
import statsRouter from './routes/statsRouter';
import categoryRouter from './routes/categoryRouter';
import deliveryRouter from './routes/deliveryRouter';
import reviewRouter from './routes/reviewRouter';
import notificationRouter from './routes/notificationRouter';
import adminRouter from './routes/adminRouter';
import authRouter from './routes/authRouter';
import uploadRouter from './routes/uploadRouter';
import searchRouter from './routes/searchRouter';
import customerRouter from './routes/customerRouter';
import { UPLOAD_DIR } from './lib/storage';

dotenv.config();

const app = express();

// Middleware
// crossOriginResourcePolicy disabled so /uploads images can be loaded by the frontend on a different port
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Static — uploaded images
app.use('/uploads', express.static(UPLOAD_DIR));

// Routes
app.get('/health', (_req, res) => {
    res.json({
        status: 'UP',
        service: 'UFL-Ecommerce-API',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/stats', statsRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/delivery', deliveryRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);
app.use('/api/uploads', uploadRouter);
app.use('/api/search', searchRouter);
app.use('/api/customer', customerRouter);

app.get('/api', (_req, res) => {
    res.json({ message: 'Welcome to UFL E-Commerce API' });
});

export default app;
