import { Schema, model, InferSchemaType } from 'mongoose';

// Categorised referrer sources for the analytics dashboard. Anything we can't
// classify falls into 'direct' (no referrer) or 'other' (unknown host).
export const REFERRER_SOURCES = [
    'instagram', 'twitter', 'facebook', 'whatsapp', 'tiktok', 'youtube',
    'google', 'bing', 'direct', 'email', 'other'
] as const;

const visitSchema = new Schema(
    {
        visitorId: { type: String, required: true, index: true },
        // YYYY-MM-DD in UTC — keys uniqueness so a visitor only counts once per day.
        dateKey: { type: String, required: true, index: true },
        path: { type: String, default: '' },
        userAgent: { type: String, default: '' },
        // ── Web analytics fields ───────────────────────────────────
        ip: { type: String, default: '' },
        country: { type: String, default: '', index: true },
        countryCode: { type: String, default: '', index: true },
        region: { type: String, default: '' },
        city: { type: String, default: '' },
        // Full Referer header value (URL or empty)
        referrer: { type: String, default: '' },
        // Categorised source — one of REFERRER_SOURCES, indexed for grouping.
        referrerSource: { type: String, enum: REFERRER_SOURCES, default: 'direct', index: true }
    },
    {
        timestamps: { createdAt: 'date', updatedAt: false },
        toJSON: { virtuals: true, versionKey: false },
        toObject: { virtuals: true, versionKey: false }
    }
);

visitSchema.index({ visitorId: 1, dateKey: 1 }, { unique: true });

export type VisitDoc = InferSchemaType<typeof visitSchema>;
export const Visit = model('Visit', visitSchema);
