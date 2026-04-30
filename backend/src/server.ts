import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDb } from './lib/db';
import { runStartupMigrations } from './lib/migrations';

const PORT = process.env.PORT || 4000;

const start = async () => {
    try {
        await connectDb();
        await runStartupMigrations();
        app.listen(PORT, () => {
            console.log(`🚀 UFL E-Commerce API is running on http://localhost:${PORT}`);
            console.log(`🔥 Health check: http://localhost:${PORT}/health`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
};

start();
