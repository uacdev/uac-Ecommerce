import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        service: 'UFL-Ecommerce-API',
        timestamp: new Date().toISOString()
    });
});

// Routes
// We'll add routes/products.ts and routes/orders.ts later
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to UFL E-Commerce API' });
});

export default app;
