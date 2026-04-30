import { Schema, model, InferSchemaType } from 'mongoose';

const checkoutSessionSchema = new Schema(
    {
        visitorId: { type: String, default: '', index: true },
        email: { type: String, default: '' },
        startedAt: { type: Date, default: Date.now, index: true },
        // Set when the buyer successfully creates an order tied to this session.
        // null → still abandoned.
        convertedAt: { type: Date, default: null, index: true },
        orderId: { type: String, default: '' },
        orderReference: { type: String, default: '' }
    },
    {
        timestamps: { createdAt: 'date', updatedAt: 'updated_at' },
        toJSON: { virtuals: true, versionKey: false },
        toObject: { virtuals: true, versionKey: false }
    }
);

checkoutSessionSchema.virtual('id').get(function () {
    return String(this._id);
});

export type CheckoutSessionDoc = InferSchemaType<typeof checkoutSessionSchema>;
export const CheckoutSession = model('CheckoutSession', checkoutSessionSchema);
