import dotenv from 'dotenv';
dotenv.config();

import { connectDb } from '../lib/db';
import { DeliveryZone } from '../models/DeliveryZone';
import { Setting } from '../models/Setting';

const DEFAULT_WHATSAPP = '+2349098050402';
const DEFAULT_ZONES = [
    { name: 'VI/Lekki', fee: 8000 },
    { name: 'Ikoyi', fee: 7000 },
    { name: 'Surulere', fee: 4500 },
    { name: 'Ikeja/Maryland/Onipanu', fee: 3000 },
    { name: 'Agege/Ogba', fee: 4500 },
    { name: 'Festac/Ago Okota', fee: 6000 },
    { name: 'Magodo', fee: 4000 },
    { name: 'Ebute Meta', fee: 5500 },
    { name: 'Gbagada', fee: 3000 },
    { name: 'Ketu', fee: 3000 },
    { name: 'Ikorodu', fee: 6500 }
];

const run = async () => {
    await connectDb();

    await Setting.findOneAndUpdate(
        { key: 'whatsapp_number' },
        { $set: { value: DEFAULT_WHATSAPP } },
        { returnDocument: 'after', upsert: true, runValidators: true }
    );

    for (const zone of DEFAULT_ZONES) {
        await DeliveryZone.findOneAndUpdate(
            { name: zone.name },
            { $set: { fee: zone.fee } },
            { returnDocument: 'after', upsert: true, runValidators: true }
        );
    }

    console.log('✅ Seeded WhatsApp number and delivery zones');
    process.exit(0);
};

run().catch((err) => {
    console.error('Seed settings failed:', err);
    process.exit(1);
});
