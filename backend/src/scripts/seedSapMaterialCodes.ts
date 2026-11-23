/*
 * Fills Product.sapMaterialCode from the SAP material list UFL shared (Nov 2026).
 * Dry run by default; pass --apply to write. Never overwrites a code that's already set.
 *   npm run seed:sap-codes            # preview
 *   npm run seed:sap-codes -- --apply # write
 */
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { Product } from '../models/Product';

// Keyed by the exact product name on the website.
const CODES: Record<string, string> = {
    'Zuri Chicken 10G - 200 pieces': '1200011854',
    'Zuri Beef 10G - 200 pieces': '1200011861',
    'Zuri Jollof 10G - 200 pieces': '1200011858',
    'Zuri Classic 100G - 30 pieces': '1200010791',
    'Zuri Beef 100G - 30 pieces': '1200010789',
    'Zuri Jollof 100G - 30 pieces': '1200010787',
    'Zuri Chicken 100G - 30 pieces': '1200010785',
    'Gala Classic 60G - 26 pieces': '1200000024',
    'Gala Odogwu 120G - 26 pieces': '1200010634',
    'Gala Chin Chin - 60 pieces': '1200010023',
    'Funtime Coconut Chips - 18 pieces': '1200000001',
    '50CL*12- 12 pieces': '1200009366',
    '75CL*12 - 12 pieces': '1200000063',
    '150CL*6 - 6 pieces': '1200000061',
    '75CL*20 - 20 pieces': '1200000065',
    '120ML Strawberry': '1200000048',
    '120ML Vanilla': '1200000047',
    '220ML Vanilla': '1200000046',
    '220ML Strawberry': '1200000056',
    '2Litres Vanilla/Chocolate': '1200000041',
    '2Litres Vanilla/Strawberry': '1200000042',
    '130ml Supreme Chocolate': '1200012231',
    '130ml Supreme Strawberry': '1200012229',
    '130ML Vanilla Pouch': '1200010292',
    '90ML Vanilla Pouch': '1200010303',
    'Orange Lolly': '1200009972',
    '450ML Vanilla': '1200009800',
    '450ML Vanilla/Strawberry': '1200009801',
    '450ML Vanilla/Chocolate': '1200009802'
};

// In the SAP list but need a business check before mapping.
const NEEDS_CHECK: Record<string, string> = {
    'Zuri Classic 10G - 300 pieces': 'SAP 1200011866 is 10g x 10 x 20 (200 pieces); website says 300',
    'Gala Cocktail - 4 pieces': 'SAP 1200010718 is "Cocktail*320g"; confirm pack matches',
    '2Litres Vanilla': 'two website products share this name (6 and 4 pieces); SAP 1200000040 is 4 pieces',
    '3Litres Vanilla': 'two website products share this name; SAP has 3L Vanilla 1200009806, Van-Straw 1200009807, Van-Choco 1200009808'
};

const run = async () => {
    const apply = process.argv.includes('--apply');
    await mongoose.connect(process.env.MONGODB_URI as string);
    const products = await Product.find({}, { name: 1, sapMaterialCode: 1 });

    const counts = new Map<string, number>();
    for (const p of products) counts.set(p.name, (counts.get(p.name) || 0) + 1);

    const updates: { id: any; name: string; code: string }[] = [];
    const report = { set: [] as string[], alreadySet: [] as string[], check: [] as string[], missing: [] as string[] };
    for (const p of products) {
        const code = CODES[p.name];
        if (p.sapMaterialCode) report.alreadySet.push(`${p.name} = ${p.sapMaterialCode}`);
        else if (NEEDS_CHECK[p.name]) report.check.push(`${p.name}: ${NEEDS_CHECK[p.name]}`);
        else if (code && counts.get(p.name) === 1) { updates.push({ id: p._id, name: p.name, code }); report.set.push(`${p.name} → ${code}`); }
        else if (code) report.check.push(`${p.name}: duplicate name on website`);
        else report.missing.push(p.name);
    }

    console.log(`\n${apply ? 'Setting' : 'Would set'} (${report.set.length}):\n  ${report.set.join('\n  ')}`);
    if (report.alreadySet.length) console.log(`\nAlready set (${report.alreadySet.length}):\n  ${report.alreadySet.join('\n  ')}`);
    console.log(`\nNeeds business check (${report.check.length}):\n  ${report.check.join('\n  ')}`);
    console.log(`\nNo SAP code in the list (${report.missing.length}):\n  ${report.missing.join('\n  ')}`);

    if (apply && updates.length) {
        const res = await Product.bulkWrite(updates.map(u => ({
            updateOne: { filter: { _id: u.id, sapMaterialCode: { $in: ['', null] } }, update: { $set: { sapMaterialCode: u.code } } }
        })) as any);
        console.log(`\nUpdated ${res.modifiedCount} products.`);
    } else if (!apply) console.log('\nDry run — nothing written. Re-run with --apply to save.');
    await mongoose.disconnect();
};

run().catch(err => { console.error(err); process.exit(1); });
