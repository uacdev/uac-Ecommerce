import { Schema, model, InferSchemaType } from 'mongoose';

const settingSchema = new Schema(
    {
        key: { type: String, required: true, unique: true, lowercase: true, trim: true },
        value: { type: String, required: true, trim: true }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        toJSON: { virtuals: true, versionKey: false },
        toObject: { virtuals: true, versionKey: false }
    }
);

settingSchema.virtual('id').get(function () {
    return this._id.toString();
});

export type SettingDoc = InferSchemaType<typeof settingSchema>;
export const Setting = model('Setting', settingSchema);
