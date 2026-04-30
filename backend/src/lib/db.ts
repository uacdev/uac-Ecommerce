import mongoose from 'mongoose';

let connection: typeof mongoose | null = null;

export const connectDb = async () => {
    if (connection) return connection;

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI is not set in environment');
    }

    mongoose.set('strictQuery', true);
    connection = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${mongoose.connection.name}`);
    return connection;
};
