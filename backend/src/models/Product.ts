import { Schema, model, InferSchemaType } from 'mongoose';

export const PRODUCT_LOCATIONS = ['Ojota', 'Oregun', 'Kerang'] as const;
export const PRODUCT_STATUSES = ['available', 'out_of_stock', 'sold', 'reserved'] as const;

const productSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        brand: { type: String, default: '', trim: true },
        description: { type: String, default: '' },
        category: { type: String, required: true, trim: true },
        image: { type: String, default: '' },
        images: { type: [String], default: [] },
        location: { type: String, enum: PRODUCT_LOCATIONS, required: true },
        packaging: { type: String, default: '' },
        price: { type: Number, required: true, min: 0 },
        status: { type: String, enum: PRODUCT_STATUSES, default: 'available' },
        // Numeric inventory. Auto-flips status to out_of_stock when this hits 0;
        // back to available when it goes positive again.
        stockCount: { type: Number, default: 0, min: 0 },
        is_reserved: { type: Boolean, default: false }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        toJSON: { virtuals: true, versionKey: false },
        toObject: { virtuals: true, versionKey: false }
    }
);

productSchema.virtual('id').get(function () {
    return this._id.toString();
});

export type ProductDoc = InferSchemaType<typeof productSchema>;
export const Product = model('Product', productSchema);
