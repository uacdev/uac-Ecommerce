import { Schema, model, InferSchemaType } from 'mongoose';

export const ORDER_STATUSES = [
    'pending', 'paid', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled'
] as const;

// not_sent → processing → synced, or failed (retried automatically while sapRetryable is true)
export const SAP_STATUSES = ['not_sent', 'processing', 'synced', 'failed'] as const;

export const FULFILLMENT_TYPES = ['delivery', 'pickup'] as const;
export const DELIVERY_METHODS = ['pending', 'assisted', 'self'] as const;

const orderItemSchema = new Schema(
    {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        image: { type: String, default: '' },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
    },
    { _id: false }
);

const orderSchema = new Schema(
    {
        reference: { type: String, required: true, unique: true, index: true },
        items: { type: [orderItemSchema], required: true, validate: (v: any[]) => v.length > 0 },
        productAmount: { type: Number, required: true, min: 0 },
        deliveryFee: { type: Number, default: 0, min: 0 },
        amount: { type: Number, required: true, min: 0 },
        commission: { type: Number, default: 0, min: 0 },

        buyerName: { type: String, required: true, trim: true },
        buyerEmail: { type: String, required: true, trim: true, lowercase: true },
        buyerPhone: { type: String, required: true, trim: true },
        buyerAddress: { type: String, required: function(this: any) { return String(this.fulfillmentType || 'delivery') === 'delivery' }, trim: true },
        buyerState: { type: String, default: '', trim: true, index: true },

        deliveryZone: { type: String, default: '' },
        deliveryMethod: { type: String, enum: DELIVERY_METHODS, default: 'pending' },
        fulfillmentType: { type: String, enum: FULFILLMENT_TYPES, default: 'delivery' },
        pickupType: { type: String, enum: ['self', 'dispatch'], default: 'self' },
        pickupWindowAccepted: { type: Boolean, default: false },
        pickupWindowMinutes: { type: Number, default: 60 },
        dispatchAddress: { type: String, default: '' },
        dispatchPhone: { type: String, default: '' },
        pickupCode: { type: String, default: '' },
        pickupDeadlineAt: { type: Date, default: null },
        pickupReminderSentAt: { type: Date, default: null },
        shippedAt: { type: Date, default: null },
        completionReminderClaimedAt: { type: Date, default: null },
        completionReminderSentAt: { type: Date, default: null },
        completedAt: { type: Date, default: null },
        logisticsPartner: { type: String, default: '' },

        paymentMethod: { type: String, default: '' },
        status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
        statusUpdatedAt: { type: Date, default: null },
        cancellationReason: { type: String, default: '' },

        // OPay details captured when the payment is confirmed (used for the SAP payment notification)
        opayTransactionId: { type: String, default: '' },
        opayFee: { type: Number, default: 0, min: 0 },
        paidAt: { type: Date, default: null },

        // SAP integration — see lib/sap.ts
        sapStatus: { type: String, enum: SAP_STATUSES, default: 'not_sent', index: true },
        sapSalesOrderNo: { type: String, default: '' },
        sapSalesOrderAt: { type: Date, default: null },
        sapPaymentSentAt: { type: Date, default: null },
        sapPaymentDocumentNo: { type: String, default: '' },
        sapPaymentPostedAt: { type: Date, default: null },
        sapAttempts: { type: Number, default: 0 },
        sapLastAttemptAt: { type: Date, default: null },
        sapLockedAt: { type: Date, default: null },
        sapRetryable: { type: Boolean, default: true },
        sapError: { type: String, default: '' }
    },
    {
        timestamps: { createdAt: 'date', updatedAt: 'updated_at' },
        toJSON: { virtuals: true, versionKey: false },
        toObject: { virtuals: true, versionKey: false }
    }
);

orderSchema.virtual('id').get(function () {
    return this._id.toString();
});

export type OrderDoc = InferSchemaType<typeof orderSchema>;
export const Order = model('Order', orderSchema);
