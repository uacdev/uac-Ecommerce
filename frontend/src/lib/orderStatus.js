export const isPaymentFailedCancellation = (order) => {
    if (String(order?.status || '').toLowerCase() !== 'cancelled') return false

    const reason = String(order?.cancellationReason || '').toLowerCase()
    if (reason) return reason === 'payment_failed'

    return String(order?.paymentMethod || '').toLowerCase() === 'opay'
}

export const getOrderStatusLabel = (order) => {
    if (isPaymentFailedCancellation(order)) return 'Payment failed'

    const status = String(order?.status || 'pending')
    return status === 'pending'
        ? 'Awaiting payment'
        : status.replace(/^./, firstLetter => firstLetter.toUpperCase())
}
