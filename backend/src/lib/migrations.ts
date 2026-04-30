import { Product } from '../models/Product';

// Idempotent boot-time migrations. Each runs once per server boot and is safe to re-run.
export const runStartupMigrations = async () => {
    try {
        // Backfill: products created before stockCount existed get a sensible default
        // so the storefront has something to show. Admin can adjust per-product afterward.
        const result = await Product.updateMany(
            { stockCount: { $exists: false } },
            { $set: { stockCount: 100 } }
        );
        if (result.modifiedCount > 0) {
            console.log(`🔁 Migration: backfilled stockCount=100 on ${result.modifiedCount} legacy product(s)`);
        }
    } catch (err) {
        console.error('Migration error (non-fatal):', err);
    }
};
