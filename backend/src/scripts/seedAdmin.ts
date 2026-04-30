import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDb } from '../lib/db';
import { Admin } from '../models/Admin';
import { hashPassword } from '../lib/auth';

const EMAIL = process.argv[2] || process.env.ADMIN_EMAIL || 'gonyeanwuna@uacfoodsng.com';
const PASSWORD = process.argv[3] || process.env.SEED_ADMIN_PASSWORD || 'AdminPassword123!';
const FULL_NAME = process.argv[4] || 'G. Onyeanwuna';

const run = async () => {
    await connectDb();

    // Drop legacy adminprofiles collection from the pre-auth era, if it exists
    try {
        const collections = await mongoose.connection.db!.listCollections({ name: 'adminprofiles' }).toArray();
        if (collections.length > 0) {
            await mongoose.connection.db!.dropCollection('adminprofiles');
            console.log('🧹 Dropped legacy adminprofiles collection');
        }
    } catch (err) {
        console.warn('Could not check/drop legacy collection:', (err as Error).message);
    }

    const passwordHash = await hashPassword(PASSWORD);

    const existing = await Admin.findOne({ email: EMAIL.toLowerCase() });
    if (existing) {
        existing.passwordHash = passwordHash;
        if (FULL_NAME) existing.fullName = FULL_NAME;
        await existing.save();
        console.log(`✅ Updated admin password for ${EMAIL}`);
    } else {
        await Admin.create({
            email: EMAIL.toLowerCase(),
            passwordHash,
            fullName: FULL_NAME,
            role: 'System admin'
        });
        console.log(`✅ Created admin ${EMAIL}`);
    }

    console.log(`   Login with email: ${EMAIL}`);
    console.log(`   Password: ${PASSWORD}`);
    await mongoose.disconnect();
    process.exit(0);
};

run().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});
