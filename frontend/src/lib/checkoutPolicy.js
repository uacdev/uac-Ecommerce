export const CHECKOUT_WEEKDAYS = [
    { id: 'mon', label: 'Monday', short: 'Mon' },
    { id: 'tue', label: 'Tuesday', short: 'Tue' },
    { id: 'wed', label: 'Wednesday', short: 'Wed' },
    { id: 'thu', label: 'Thursday', short: 'Thu' },
    { id: 'fri', label: 'Friday', short: 'Fri' },
    { id: 'sat', label: 'Saturday', short: 'Sat' },
    { id: 'sun', label: 'Sunday', short: 'Sun' }
]

export const DEFAULT_CHECKOUT_POLICY = {
    weekdays: CHECKOUT_WEEKDAYS.map(day => day.id),
    opensAt: '08:00',
    closesAt: '17:00',
    pickupWindowMinutes: 60,
    selfPickupEnabled: true,
    dispatchEnabled: true,
    platformDeliveryEnabled: true
}

export const normalizeCheckoutPolicy = (value) => ({
    ...DEFAULT_CHECKOUT_POLICY,
    ...(value && typeof value === 'object' && !Array.isArray(value) ? value : {}),
    weekdays: CHECKOUT_WEEKDAYS.map(day => day.id)
})

export const formatPolicyTime = (value) => {
    const [rawHour, minute] = value.split(':').map(Number)
    const period = rawHour >= 12 ? 'PM' : 'AM'
    const hour = rawHour % 12 || 12
    return `${hour}:${String(minute).padStart(2, '0')} ${period}`
}

export const getOrderWindowStatus = (date = new Date(), policy = DEFAULT_CHECKOUT_POLICY) => {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Lagos',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
    }).formatToParts(date)
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]))
    const minuteOfDay = Number(values.hour) * 60 + Number(values.minute)
    const [openHour, openMinute] = policy.opensAt.split(':').map(Number)
    const [closeHour, closeMinute] = policy.closesAt.split(':').map(Number)
    const opensAt = openHour * 60 + openMinute
    const closesAt = closeHour * 60 + closeMinute
    const hours = `${formatPolicyTime(policy.opensAt)} to ${formatPolicyTime(policy.closesAt)} WAT`
    const isOpen = minuteOfDay >= opensAt
        && minuteOfDay < closesAt

    return {
        isOpen,
        message: isOpen
            ? `We’re currently accepting orders every day, ${hours}.`
            : `We’ll be accepting orders every day, ${hours}.`
    }
}