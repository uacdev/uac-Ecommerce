import { Product } from '../models/Product';
import { Admin } from '../models/Admin';

// Idempotent boot-time migrations. Each runs once per server boot and is safe to re-run.
export const runStartupMigrations = async () => {
    const configuredAdminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    if (configuredAdminEmail) {
        try {
            const configuredAdmin = await Admin.findOne({ email: configuredAdminEmail });
            if (!configuredAdmin) {
                const adminCount = await Admin.countDocuments();
                if (adminCount === 1) {
                    const admin = await Admin.findOne();
                    if (admin) {
                        admin.set('email', configuredAdminEmail);
                        await admin.save();
                        console.log(`🔁 Migration: updated the single admin login email to ${configuredAdminEmail}`);
                    }
                } else if (adminCount > 1) {
                    console.warn('Admin email migration skipped: multiple admin accounts exist; update the intended account explicitly.');
                }
            }
        } catch (err) {
            console.error('Admin email migration failed:', err);
        }
    }

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
