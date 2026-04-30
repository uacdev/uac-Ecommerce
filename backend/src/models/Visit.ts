import { Schema, model, InferSchemaType } from 'mongoose';

const visitSchema = new Schema(
    {
        visitorId: { type: String, required: true, index: true },
        // YYYY-MM-DD in UTC — keys uniqueness so a visitor only counts once per day.
        dateKey: { type: String, required: true, index: true },
        path: { type: String, default: '' },
        userAgent: { type: String, default: '' }
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
