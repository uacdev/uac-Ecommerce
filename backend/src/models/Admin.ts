import { Schema, model, InferSchemaType } from 'mongoose';

const adminSchema = new Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true, select: false },
        passwordChangedAt: { type: Date, default: () => new Date() },
        fullName: { type: String, default: '' },
        photo: { type: String, default: '' },
        role: { type: String, default: 'System admin' }
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

adminSchema.virtual('id').get(function () {
    return this._id.toString();
});

export type AdminDoc = InferSchemaType<typeof adminSchema>;
export const Admin = model('Admin', adminSchema);
