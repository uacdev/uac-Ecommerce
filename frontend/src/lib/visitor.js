// Anonymous per-browser visitor ID. Stored in localStorage and reused across
// sessions so unique-visitor counts on the backend are stable.

const KEY = 'uac_visitor_id'

const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
    // Lightweight fallback for older browsers — collision risk is acceptable for analytics.
    return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

export const getVisitorId = () => {
    if (typeof window === 'undefined') return ''
    let id = localStorage.getItem(KEY)
    if (!id) {
        id = generateId()
        localStorage.setItem(KEY, id)
    }
    return id
}

const SESSION_KEY = 'uac_checkout_session_id'

export const getCheckoutSessionId = () => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem(SESSION_KEY) || ''
}

export const setCheckoutSessionId = (id) => {
    if (typeof window === 'undefined') return
    if (id) localStorage.setItem(SESSION_KEY, id)
    else localStorage.removeItem(SESSION_KEY)
}

export const clearCheckoutSessionId = () => setCheckoutSessionId('')

const PENDING_CART_PURCHASE_PREFIX = 'uac_pending_cart_purchase:'

export const setPendingCartPurchase = (reference, items) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(`${PENDING_CART_PURCHASE_PREFIX}${reference}`, JSON.stringify(
        items.map(item => ({
            productId: String(item.id || item._id),
            quantity: Number(item.quantity) || 1
        }))
    ))
}

export const consumePendingCartPurchase = (reference) => {
    if (typeof window === 'undefined') return []
    const key = `${PENDING_CART_PURCHASE_PREFIX}${reference}`
    const saved = localStorage.getItem(key)
    if (!saved) return []
    localStorage.removeItem(key)
    try {
        return JSON.parse(saved)
    } catch {
        return []
    }
}
