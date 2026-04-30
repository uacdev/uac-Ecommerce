import { Schema, model, InferSchemaType } from 'mongoose';

export const NOTIFICATION_TYPES = ['order', 'review', 'inventory', 'customer', 'system'] as const;

const notificationSchema = new Schema(
    {
        type: { type: String, enum: NOTIFICATION_TYPES, default: 'system' },
        title: { type: String, required: true },
        description: { type: String, default: '' },
        link: { type: String, default: '' },
        meta: { type: Schema.Types.Mixed, default: {} },
        isRead: { type: Boolean, default: false, index: true }
    },
    {
        timestamps: { createdAt: 'date', updatedAt: 'updated_at' },
        toJSON: { virtuals: true, versionKey: false },
        toObject: { virtuals: true, versionKey: false }
    }
);

notificationSchema.virtual('id').get(function () {
    return this._id.toString();
});

export type NotificationDoc = InferSchemaType<typeof notificationSchema>;
export const Notification = model('Notification', notificationSchema);
