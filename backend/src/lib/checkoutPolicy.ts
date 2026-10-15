import { Setting } from '../models/Setting';

export const CHECKOUT_POLICY_KEY = 'checkout_policy';
export const CHECKOUT_WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

export type CheckoutPolicy = {
    weekdays: string[];
    opensAt: string;
    closesAt: string;
    pickupWindowMinutes: number;
    selfPickupEnabled: boolean;
    dispatchEnabled: boolean;
    platformDeliveryEnabled: boolean;
};

export const DEFAULT_CHECKOUT_POLICY: CheckoutPolicy = {
    weekdays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    opensAt: '08:00',
    closesAt: '17:00',
    pickupWindowMinutes: 60,
    selfPickupEnabled: true,
    dispatchEnabled: true,
    platformDeliveryEnabled: true
};

const isTime = (value: unknown): value is string =>
    typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

export const validateCheckoutPolicy = (value: any): string | null => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return 'Checkout policy must be an object.';
    if (!Array.isArray(value.weekdays) || !value.weekdays.length || value.weekdays.some((day: unknown) => !CHECKOUT_WEEKDAYS.includes(day as any))) {
        return 'Select at least one valid ordering day.';
    }
    if (!isTime(value.opensAt) || !isTime(value.closesAt)) return 'Enter valid opening and closing times.';
    if (value.opensAt >= value.closesAt) return 'Closing time must be later than opening time.';
    if (!Number.isInteger(value.pickupWindowMinutes) || value.pickupWindowMinutes < 1 || value.pickupWindowMinutes > 1440) {
        return 'Pickup window must be between 1 and 1,440 minutes.';
    }
    if (typeof value.selfPickupEnabled !== 'boolean'
        || typeof value.dispatchEnabled !== 'boolean'
        || typeof value.platformDeliveryEnabled !== 'boolean') {
        return 'Fulfillment options must be enabled or disabled.';
    }
    if (!value.selfPickupEnabled && !value.dispatchEnabled && !value.platformDeliveryEnabled) {
        return 'At least one fulfillment option must remain enabled.';
    }
    return null;
};

export const normalizeCheckoutPolicy = (value: any): CheckoutPolicy => {
    if (validateCheckoutPolicy(value)) return { ...DEFAULT_CHECKOUT_POLICY };
    return {
        weekdays: [...new Set(value.weekdays)],
        opensAt: value.opensAt,
        closesAt: value.closesAt,
        pickupWindowMinutes: value.pickupWindowMinutes,
        selfPickupEnabled: value.selfPickupEnabled,
        dispatchEnabled: value.dispatchEnabled,
        platformDeliveryEnabled: value.platformDeliveryEnabled
    };
};

export const loadCheckoutPolicy = async (): Promise<CheckoutPolicy> => {
    const setting = await Setting.findOne({ key: CHECKOUT_POLICY_KEY }).lean();
    if (!setting?.value) return { ...DEFAULT_CHECKOUT_POLICY };
    try {
        return normalizeCheckoutPolicy(JSON.parse(setting.value));
    } catch {
        return { ...DEFAULT_CHECKOUT_POLICY };
    }
};