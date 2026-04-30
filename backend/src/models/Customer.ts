import { Schema, model, InferSchemaType } from 'mongoose';

const customerSchema = new Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true, select: false },
        passwordChangedAt: { type: Date, default: () => new Date() },
        fullName: { type: String, default: '' },
        phone: { type: String, default: '' },
        defaultAddress: { type: String, default: '' },
        defaultState: { type: String, default: '' }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: (_doc, ret: any) => { delete ret.passwordHash; return ret; }
        },
        toObject: { virtuals: true, versionKey: false }
    }
);

customerSchema.virtual('id').get(function () {
    return this._id.toString();
});

export type CustomerDoc = InferSchemaType<typeof customerSchema>;
export const Customer = model('Customer', customerSchema);
