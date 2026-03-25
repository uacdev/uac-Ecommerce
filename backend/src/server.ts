import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`🚀 UFL E-Commerce API is running on http://localhost:${PORT}`);
    console.log(`🔥 Health check: http://localhost:${PORT}/health`);
});
