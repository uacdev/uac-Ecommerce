import { Schema, model, InferSchemaType } from 'mongoose';

const packagingOptionSchema = new Schema(
    {
        label: { type: String, required: true, trim: true },
        value: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 }
    },
    { _id: false }
);

const categorySchema = new Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        abstract: { type: String, default: '' },
        parent: { type: String, default: '' },
        color: { type: String, default: 'bg-indigo-50 text-indigo-600' },
        coverImage: { type: String, default: '' },
        packagingOptions: { type: [packagingOptionSchema], default: [] }
    },
    { timestamps: true }
);

export type CategoryDoc = InferSchemaType<typeof categorySchema>;
export const Category = model('Category', categorySchema);
