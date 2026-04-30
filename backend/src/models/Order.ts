import { Schema, model, InferSchemaType } from 'mongoose';

export const ORDER_STATUSES = [
    'pending', 'paid', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled'
] as const;

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
        buyerAddress: { type: String, required: true, trim: true },
        buyerState: { type: String, default: '', trim: true, index: true },

        deliveryZone: { type: String, default: '' },
        deliveryMethod: { type: String, enum: DELIVERY_METHODS, default: 'pending' },
        fulfillmentType: { type: String, enum: FULFILLMENT_TYPES, default: 'delivery' },
        pickupCode: { type: String, default: '' },
        logisticsPartner: { type: String, default: '' },

        paymentMethod: { type: String, default: '' },
        status: { type: String, enum: ORDER_STATUSES, default: 'pending' }
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
