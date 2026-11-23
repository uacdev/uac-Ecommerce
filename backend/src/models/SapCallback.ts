import { Schema, model } from 'mongoose';

// Raw log of every payment confirmation SAP sends back to us, kept for audit
// and for matching confirmations that arrive with an unexpected reference.
const sapCallbackSchema = new Schema(
    {
        paymentRef: { type: String, default: '', index: true },
        documentNo: { type: String, default: '' },
        companyCode: { type: String, default: '' },
        status: { type: String, default: '' },
        note: { type: String, default: '' },
        orderReference: { type: String, default: '' },
        matched: { type: Boolean, default: false },
        raw: { type: Schema.Types.Mixed, default: null }
    },
    { timestamps: { createdAt: 'created_at', updatedAt: false }, versionKey: false }
);

export const SapCallback = model('SapCallback', sapCallbackSchema);
