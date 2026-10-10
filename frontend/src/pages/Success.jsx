import { motion } from 'framer-motion'
import { useLocation, useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, Clock, Copy, Check, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { paymentApi } from '../api/client'
import { useStore } from '../context/StoreContext'
import { consumePendingCartPurchase } from '../lib/visitor'

const Success = () => {
    const location = useLocation()
    const [searchParams] = useSearchParams()

    // OPay callback passes ?ref=orderId; direct navigation uses router state
    const opayRef = searchParams.get('ref')
    const stateOrderId = location.state?.orderId
    const statePaymentMethod = location.state?.paymentMethod

    const orderId = opayRef || stateOrderId || 'UFL-2026-0000'
    const isBankDeposit = statePaymentMethod === 'bank' && !opayRef

    const [copied, setCopied] = useState(false)
    const [verifyStatus, setVerifyStatus] = useState(isBankDeposit ? 'bank' : 'loading')
    const { removePurchasedCartItems } = useStore() || {}

    useEffect(() => {
        if (!opayRef) return

        let active = true
        let attempts = 0
        let retryTimer

        const verifyPayment = async () => {
            try {
                const { data } = await paymentApi.verify(opayRef)
                if (!active) return
                if (data.status === 'paid') {
                    const purchasedItems = data.purchasedItems?.length
                        ? data.purchasedItems
                        : consumePendingCartPurchase(opayRef)
                    if (purchasedItems.length) removePurchasedCartItems(purchasedItems)
                    consumePendingCartPurchase(opayRef)
                    setVerifyStatus('paid')
                    return
                }
            } catch {
                // Retry briefly while OPay updates the transaction status.
            }

            if (!active) return
            attempts += 1
            if (attempts >= 8) {
                setVerifyStatus('pending')
                return
            }

            retryTimer = setTimeout(verifyPayment, 5000)
        }

        verifyPayment()
        return () => {
            active = false
            clearTimeout(retryTimer)
        }
    }, [opayRef, removePurchasedCartItems])

    const copyToClipboard = () => {
        navigator.clipboard.writeText(orderId)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const isPaid = verifyStatus === 'paid'
    const isPending = verifyStatus === 'pending'
    const isBank = verifyStatus === 'bank'
    const isLoading = verifyStatus === 'loading'

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pt-48 pb-20 container max-w-2xl text-center"
        >
            <div className="flex justify-center mb-8">
                <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: 'var(--badge-bg)', border: '1px solid rgba(192,57,43,0.3)' }}>
                    {isLoading
                        ? <Loader2 size={48} className="text-[var(--brand-red)] animate-spin" />
                        : isPaid
                            ? <CheckCircle size={48} className="text-[var(--brand-red)]" />
                            : <Clock size={48} className="text-[var(--text-muted)]" />
                    }
                </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading" style={{ color: 'var(--text-primary)' }}>
                {isLoading ? 'Confirming Payment…'
                    : isPaid ? 'Payment Confirmed!'
                    : isPending ? 'Payment Pending'
                    : 'Order Placed!'}
            </h1>

            <p className="text-lg mb-10 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                {isLoading
                    ? 'Checking your payment status with OPay…'
                    : isPaid
                        ? 'Your payment was confirmed. Contact us with your Order ID to arrange delivery.'
                        : isPending
                            ? 'Your payment is being processed. You will receive a confirmation shortly.'
                            : 'Your order has been reserved. Please complete your bank transfer to confirm.'}
            </p>

            <div className="glass p-8 mb-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[var(--brand-red)]" />
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Your Order ID</p>
                <div className="flex items-center justify-center gap-4">
                    <span className="text-4xl font-black font-heading tracking-tighter text-[var(--brand-red)]">
                        {orderId}
                    </span>
                    <button
                        onClick={copyToClipboard}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                    </button>
                </div>
            </div>

            {!isLoading && (
                <div>
                    <Link to="/" className="inline-block mt-8 text-sm font-medium transition-colors hover:text-[var(--brand-red)]" style={{ color: 'var(--text-muted)' }}>
                        Return to Homepage
                    </Link>
                </div>
            )}
        </motion.div>
    )
}

export default Success
