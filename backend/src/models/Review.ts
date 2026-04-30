import { Schema, model, InferSchemaType, Types } from 'mongoose';

const reviewSchema = new Schema(
    {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
        productName: { type: String, default: '' },
        customerName: { type: String, required: true, trim: true },
        customerEmail: { type: String, default: '', trim: true, lowercase: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, default: '', trim: true },
        approved: { type: Boolean, default: true }
    },
    {
        timestamps: { createdAt: 'date', updatedAt: 'updated_at' },
        toJSON: { virtuals: true, versionKey: false },
        toObject: { virtuals: true, versionKey: false }
    }
);

reviewSchema.virtual('id').get(function () {
    return this._id.toString();
});

export type ReviewDoc = InferSchemaType<typeof reviewSchema>;
export const Review = model('Review', reviewSchema);
