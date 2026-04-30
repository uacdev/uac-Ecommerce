import { Schema, model, InferSchemaType } from 'mongoose';

const stockSubscriptionSchema = new Schema(
    {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
        productName: { type: String, default: '' },
        email: { type: String, required: true, trim: true, lowercase: true, index: true },
        notifiedAt: { type: Date, default: null }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        toJSON: { virtuals: true, versionKey: false },
        toObject: { virtuals: true, versionKey: false }
    }
);

// One pending subscription per (product, email) — re-subscribing after a notify is allowed.
stockSubscriptionSchema.index(
    { productId: 1, email: 1 },
    { unique: true, partialFilterExpression: { notifiedAt: null } }
);

stockSubscriptionSchema.virtual('id').get(function () {
    return this._id.toString();
});

export type StockSubscriptionDoc = InferSchemaType<typeof stockSubscriptionSchema>;
export const StockSubscription = model('StockSubscription', stockSubscriptionSchema);
