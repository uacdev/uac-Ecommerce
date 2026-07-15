import { Schema, model, InferSchemaType } from 'mongoose';

const deliveryZoneSchema = new Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        fee: { type: Number, required: true, min: 0 }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        toJSON: { virtuals: true, versionKey: false },
        toObject: { virtuals: true, versionKey: false }
    }
);

deliveryZoneSchema.virtual('id').get(function () {
    return this._id.toString();
});

export type DeliveryZoneDoc = InferSchemaType<typeof deliveryZoneSchema>;
export const DeliveryZone = model('DeliveryZone', deliveryZoneSchema);
