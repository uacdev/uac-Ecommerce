import dotenv from 'dotenv';
dotenv.config();

import { connectDb } from '../lib/db';
import { CHECKOUT_POLICY_KEY, DEFAULT_CHECKOUT_POLICY } from '../lib/checkoutPolicy';
import { Setting } from '../models/Setting';

const run = async () => {
    await connectDb();

    await Setting.findOneAndUpdate(
        { key: CHECKOUT_POLICY_KEY },
        { $setOnInsert: { value: JSON.stringify(DEFAULT_CHECKOUT_POLICY) } },
        { returnDocument: 'after', upsert: true, runValidators: true }
    );

    console.log('Checkout policy is present in the database; existing configuration was preserved.');
    process.exit(0);
};

run().catch(err => {
    console.error('Checkout policy seed failed:', err);
    process.exit(1);
});