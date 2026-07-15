import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import path from 'path';
import { promises as fs } from 'fs';
import { connectDb } from '../lib/db';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { saveImage } from '../lib/storage';

// Resolve the archive folder relative to the repo root (backend runs from backend/).
const ARCHIVE_DIR = path.resolve(process.cwd(), '../frontend/Main Ecommerce website archive');

// Mime sniff by extension — Cloudinary needs this for the upload stream.
const mimeFor = (file: string): string => {
    const ext = path.extname(file).toLowerCase();
    if (ext === '.png') return 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
    if (ext === '.webp') return 'image/webp';
    return 'application/octet-stream';
};

type SeedProduct = {
    file: string;          // path relative to ARCHIVE_DIR
    name: string;
    brand: string;
    category: string;
    price: number;
    description: string;
    packaging: string;
    stockCount: number;    // Initial inventory; varied per SKU so the dashboard
                           //   shows realistic numbers instead of a flat 100.
};

// Hand-curated mapping: archive image → product fields.
// Prices come from `UFL Product Price List.xlsx` (carton/pack wholesale prices).
// Categories use buyer-friendly grouping (Water/Snacks/Seasoning) with the
// brand recorded separately so admin can later filter by either.
const SEED: SeedProduct[] = [
    // ── SWAN Water ──────────────────────────────────────────────
    {
        file: 'SWAN/50 CL.jpg',
        name: 'Swan Water 50cl — Pack of 12',
        brand: 'Swan',
        category: 'Water',
        price: 2018,
        description: 'Pure premium drinking water in a portable 50cl bottle. Pack of 12 — ideal for households, events, and on-the-go hydration.',
        packaging: '12 × 50cl bottles per pack',
        stockCount: 1240
    },
    {
        file: 'SWAN/75 CL (12pcs).png',
        name: 'Swan Water 75cl — Pack of 12',
        brand: 'Swan',
        category: 'Water',
        price: 2609,
        description: 'Premium drinking water in a 75cl bottle. Pack of 12 — the everyday office and household choice.',
        packaging: '12 × 75cl bottles per pack',
        stockCount: 980
    },
    {
        file: 'SWAN/75 CL (20pcs).jpg',
        name: 'Swan Water 75cl — Pack of 20',
        brand: 'Swan',
        category: 'Water',
        price: 4156,
        description: 'Premium drinking water in 75cl bottles. Bulk pack of 20 — the better-value option for events, restaurants, and offices.',
        packaging: '20 × 75cl bottles per pack',
        stockCount: 540
    },
    {
        file: 'SWAN/150 CL.png',
        name: 'Swan Water 150cl — Pack of 6',
        brand: 'Swan',
        category: 'Water',
        price: 2280,
        description: 'Family-size 1.5 litre bottles. Pack of 6 — convenient for the dining table and household use.',
        packaging: '6 × 1.5L bottles per pack',
        stockCount: 670
    },

    // ── Gala ────────────────────────────────────────────────────
    {
        file: 'Gala/Gala Classic.jpg',
        name: 'Gala Classic 60g — Carton of 26',
        brand: 'Gala',
        category: 'Snacks',
        price: 4200,
        description: 'The original Nigerian sausage roll since 1962. Tasty, nourishing, and trusted by millions. Carton of 26.',
        packaging: '26 × 60g sausage rolls per carton',
        stockCount: 850
    },
    {
        file: 'Gala/Gala Cocktail.jpg',
        name: 'Gala Cocktail — Carton of 4',
        brand: 'Gala',
        category: 'Snacks',
        price: 3700,
        description: 'Bite-size Gala in cocktail format — perfect for events, hospitality, and casual entertaining.',
        packaging: '4-pack cocktail carton',
        stockCount: 320
    },
    {
        file: 'Gala/King Size Gala.jpg',
        name: 'Gala Odogwo King Size 120g — Carton of 26',
        brand: 'Gala',
        category: 'Snacks',
        price: 10500,
        description: 'Twice the bite. Gala Odogwo packs the classic UAC sausage-roll flavour into a 120g king-size format. Carton of 26.',
        packaging: '26 × 120g sausage rolls per carton',
        stockCount: 460
    },

    // ── Funtime Coconut Chips ───────────────────────────────────
    {
        file: 'Fun time coconut chips/Fun time coconut chips 35g.png',
        name: 'Funtime Coconut Chips 35g — Carton of 18',
        brand: 'Funtime',
        category: 'Snacks',
        price: 3596,
        description: 'Crunchy roasted coconut chips in a resealable 35g pack. A wholesome on-the-go snack — naturally gluten-free.',
        packaging: '18 × 35g packs per carton',
        stockCount: 410
    },
    {
        file: 'Fun time coconut chips/Coconut Jar 350g.png',
        name: 'Funtime Coconut Jar 350g — Carton of 6',
        brand: 'Funtime',
        category: 'Snacks',
        price: 13800,
        description: 'Premium roasted coconut chips in a 350g sharing jar. Family- and pantry-friendly format.',
        packaging: '6 × 350g jars per carton',
        stockCount: 180
    },

    // ── Zuri Seasoning ──────────────────────────────────────────
    {
        file: 'Zuri seasoning/zuri-classic.png',
        name: 'Zuri Classic Seasoning',
        brand: 'Zuri',
        category: 'Seasoning',
        price: 21000,
        description: 'All-purpose Zuri Classic seasoning — the base flavour every Nigerian kitchen relies on. Available as a 300-pack of 10g sachets or 30-pack of 100g pouches.',
        packaging: '300 × 10g sachets or 30 × 100g pouches',
        stockCount: 750
    },
    {
        file: 'Zuri seasoning/zuri-jollof.png',
        name: 'Zuri Jollof Seasoning',
        brand: 'Zuri',
        category: 'Seasoning',
        price: 21000,
        description: 'Purpose-blended Zuri Jollof seasoning — gives jollof rice that signature smoky party-pot finish. Available as a 300-pack of 10g sachets or 30-pack of 100g pouches.',
        packaging: '300 × 10g sachets or 30 × 100g pouches',
        stockCount: 620
    },
    {
        file: 'Zuri seasoning/zuri-chicken.png',
        name: 'Zuri Chicken Seasoning',
        brand: 'Zuri',
        category: 'Seasoning',
        price: 21000,
        description: 'Zuri Chicken seasoning — slow-cooked depth for grills, stews, and chicken stocks. Available as a 300-pack of 10g sachets or 30-pack of 100g pouches.',
        packaging: '300 × 10g sachets or 30 × 100g pouches',
        stockCount: 540
    },
    {
        file: 'Zuri seasoning/zuri-beef.png',
        name: 'Zuri Beef Seasoning',
        brand: 'Zuri',
        category: 'Seasoning',
        price: 21000,
        description: 'Zuri Beef seasoning — rich, savoury blend tuned for red-meat dishes, soups, and pepper soup. Available as a 300-pack of 10g sachets or 30-pack of 100g pouches.',
        packaging: '300 × 10g sachets or 30 × 100g pouches',
        stockCount: 480
    }
];

// Brand metadata — categories ARE brands.
const BRAND_META: Record<string, { abstract: string; color: string }> = {
    Gala:    { abstract: "Nigeria's iconic sausage roll since 1962.",                 color: 'bg-rose-50 text-rose-700' },
    Swan:    { abstract: 'Premium natural spring water — household to event sizing.', color: 'bg-sky-50 text-sky-700' },
    Funtime: { abstract: 'Crunchy roasted coconut chips, party-snack ready.',         color: 'bg-amber-50 text-amber-700' },
    Zuri:    { abstract: 'Recipe-specific Nigerian-kitchen seasoning blends.',        color: 'bg-fuchsia-50 text-fuchsia-700' },
    Supreme: { abstract: 'Rich, creamy ice cream and dairy treats.',                  color: 'bg-violet-50 text-violet-700' }
};

const upsertCategory = async (name: string, coverImage: string) => {
    const meta = BRAND_META[name] || { abstract: '', color: 'bg-indigo-50 text-indigo-600' };
    // Insert path: full payload via $setOnInsert.
    await Category.updateOne(
        { name },
        {
            $setOnInsert: {
                name,
                abstract: meta.abstract,
                color: meta.color,
                coverImage,
                parent: 'Brand'
            }
        },
        { upsert: true }
    );
    // Backfill path: a previous run may have created the row without abstract/
    // color/parent (e.g. ensureCategoriesFromProducts only sets parent+color).
    // Fill empty fields without overwriting admin-edited ones.
    await Category.updateOne({ name, $or: [{ abstract: '' }, { abstract: { $exists: false } }] }, { $set: { abstract: meta.abstract } });
    await Category.updateOne({ name, parent: { $ne: 'Brand' } }, { $set: { parent: 'Brand' } });
    if (coverImage) {
        await Category.updateOne({ name, coverImage: '' }, { $set: { coverImage } });
    }
};

const upsertProduct = async (p: SeedProduct, imageUrl: string) => {
    return Product.findOneAndUpdate(
        { name: p.name },
        {
            $set: {
                name: p.name,
                brand: p.brand,
                category: p.category,
                description: p.description,
                packaging: p.packaging,
                price: p.price,
                image: imageUrl,
                images: [imageUrl],
                location: 'Ojota',
                status: 'available'
            },
            // Apply the seeded stockCount only on first insert; preserve admin-edited
            // counts on re-runs so seeding doesn't reset live inventory.
            $setOnInsert: { stockCount: p.stockCount }
        },
        { upsert: true, returnDocument: 'after' }
    );
};

const run = async () => {
    const wipe = process.argv.includes('--wipe');

    await connectDb();

    // Fail loudly if Cloudinary isn't configured — local-FS upload would generate
    // localhost URLs that break in deployed environments.
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
        console.warn('⚠️  Cloudinary not configured — images will be saved locally and only work when the API is reachable.');
    }

    if (wipe) {
        const deletedProducts = await Product.deleteMany({});
        const deletedCategories = await Category.deleteMany({});
        console.log(`🧹 Wiped ${deletedProducts.deletedCount} products, ${deletedCategories.deletedCount} categories`);
    }

    // Make sure the archive is actually here
    try {
        await fs.access(ARCHIVE_DIR);
    } catch {
        console.error(`❌ Archive folder not found at ${ARCHIVE_DIR}`);
        process.exit(1);
    }

    let uploaded = 0;
    const brandCovers = new Map<string, string>();

    for (const p of SEED) {
        const filePath = path.join(ARCHIVE_DIR, p.file);
        try {
            const buf = await fs.readFile(filePath);
            const stored = await saveImage(buf, path.basename(p.file), mimeFor(p.file));
            await upsertProduct(p, stored.url);
            // First product of each brand donates its image as the brand's cover.
            if (!brandCovers.has(p.brand)) brandCovers.set(p.brand, stored.url);
            uploaded += 1;
            console.log(`  ✓ ${p.name}`);
        } catch (err: any) {
            console.error(`  ✗ ${p.name} — ${err.message}`);
        }
    }

    // Brand-categories: include Supreme even though images are pending so its
    // chip exists when imagery later arrives.
    const allBrands = ['Gala', 'Swan', 'Funtime', 'Zuri', 'Supreme'];
    for (const name of allBrands) {
        await upsertCategory(name, brandCovers.get(name) || '');
    }

    console.log(`\n✅ Seeded ${uploaded}/${SEED.length} products into ${allBrands.length} brand categories.`);
    await mongoose.disconnect();
    process.exit(0);
};

run().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});
