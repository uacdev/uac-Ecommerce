import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDb } from '../lib/db';
import { Category } from '../models/Category';

const seedData = [
  {
    name: 'SWAN',
    packagingOptions: [
      { label: '50CL - 12 pieces', value: '50CL - 12 pieces', price: 2018.14 },
      { label: '75CL - 12 pieces', value: '75CL - 12 pieces', price: 2609.17 },
      { label: '75CL - 20 pieces', value: '75CL - 20 pieces', price: 4156.17 },
      { label: '150CL - 6 pieces', value: '150CL - 6 pieces', price: 2279.61 }
    ]
  },
  {
    name: 'Supreme',
    packagingOptions: [
      { label: '3LITRES - 2 pieces', value: '3LITRES - 2 pieces', price: 17199.60 },
      { label: '2LITRES - 4 pieces', value: '2LITRES - 4 pieces', price: 21496.20 },
      { label: '900ML - 12 pieces', value: '900ML - 12 pieces', price: 39414.10 },
      { label: '450ML - 12 pieces', value: '450ML - 12 pieces', price: 22781.85 },
      { label: '220ML - 24 pieces', value: '220ML - 24 pieces', price: 18331.50 },
      { label: '120ML - 50 pieces', value: '120ML - 50 pieces', price: 19431.50 },
      { label: 'ORANGE LOLLY - 48 pieces', value: 'ORANGE LOLLY - 48 pieces', price: 2902.90 },
      { label: 'FUNBLAST - 24 pieces', value: 'FUNBLAST - 24 pieces', price: 24933.00 },
      { label: '90ML VANILLA POUCH - 25 pieces', value: '90ML VANILLA POUCH - 25 pieces', price: 6800.00 },
      { label: '130ML VANILLA POUCH - 20 pieces', value: '130ML VANILLA POUCH - 20 pieces', price: 7550.00 },
      { label: '120ML YOGHURT - 25 pieces', value: '120ML YOGHURT - 25 pieces', price: 5350.00 }
    ]
  },
  {
    name: 'Gala',
    packagingOptions: [
      { label: 'GALA CLASSIC 60G - 26 pieces', value: 'GALA CLASSIC 60G - 26 pieces', price: 4200.00 },
      { label: 'GALA ODOGWO 120G - 26 pieces', value: 'GALA ODOGWO 120G - 26 pieces', price: 10500.00 },
      { label: 'COCKTAIL - 4 pieces', value: 'COCKTAIL - 4 pieces', price: 3700.00 }
    ]
  },
  {
    name: 'Funtime',
    packagingOptions: [
      { label: 'FUNTIME COCONUT CHIPS - 18 pieces', value: 'FUNTIME COCONUT CHIPS - 18 pieces', price: 3596.00 },
      { label: 'FUNTIME COCONUT JAR - 6 pieces', value: 'FUNTIME COCONUT JAR - 6 pieces', price: 13800.00 },
      { label: 'GALA CHIN CHIN - 60 pieces', value: 'GALA CHIN CHIN - 60 pieces', price: 7725.00 }
    ]
  },
  {
    name: 'Zuri',
    packagingOptions: [
      { label: 'ZURI CLASSIC 10G - 300 pieces', value: 'ZURI CLASSIC 10G - 300 pieces', price: 21000.00 },
      { label: 'ZURI JOLLOF 10G - 300 pieces', value: 'ZURI JOLLOF 10G - 300 pieces', price: 21000.00 },
      { label: 'ZURI CHICKEN 10 - 300 pieces', value: 'ZURI CHICKEN 10 - 300 pieces', price: 21000.00 },
      { label: 'ZURI CLASSIC 100G - 30 pieces', value: 'ZURI CLASSIC 100G - 30 pieces', price: 21000.00 },
      { label: 'ZURI BEEF 100G - 30 pieces', value: 'ZURI BEEF 100G - 30 pieces', price: 21000.00 },
      { label: 'ZURI JOLLOF 100G - 30 pieces', value: 'ZURI JOLLOF 100G - 30 pieces', price: 21000.00 },
      { label: 'ZURI CHICKEN 100G - 30 pieces', value: 'ZURI CHICKEN 100G - 30 pieces', price: 21000.00 },
      { label: 'ZURI BEEF 10G - 300 pieces', value: 'ZURI BEEF 10G - 300 pieces', price: 21000.00 }
    ]
  },
  {
    name: 'Kingsway Bread',
    packagingOptions: [
      { label: 'Jumbo 1300g - 1 piece', value: 'Jumbo 1300g - 1 piece', price: 1850.00 },
      { label: 'Family Loaf 800g - 1 piece', value: 'Family Loaf 800g - 1 piece', price: 1400.00 },
      { label: 'Midi Loaf 400g - 1 piece', value: 'Midi Loaf 400g - 1 piece', price: 700.00 }
    ]
  }
];

const run = async () => {
  await connectDb();

  for (const item of seedData) {
    await Category.updateOne(
      { name: item.name },
      {
        $set: {
          name: item.name,
          packagingOptions: item.packagingOptions,
          parent: 'Brand',
          color: 'bg-indigo-50 text-indigo-600'
        }
      },
      { upsert: true }
    );
  }

  console.log('✅ Seeded category packaging pricing data');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
