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
import trackingRouter from './routes/trackingRouter';
import paymentRouter from './routes/paymentRouter';
import { UPLOAD_DIR } from './lib/storage';

dotenv.config();

const app = express();

app.set('trust proxy', true);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(morgan('dev'));

// Payment router is mounted BEFORE express.json() so the webhook route can
// apply express.raw() and capture the exact body bytes for HMAC verification
app.use('/api/payment', paymentRouter);

app.use(express.json());

app.use('/uploads', express.static(UPLOAD_DIR));

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
app.use('/api/track', trackingRouter);

app.get('/api', (_req, res) => {
    res.json({ message: 'Welcome to UFL E-Commerce API' });
});

export default app;
