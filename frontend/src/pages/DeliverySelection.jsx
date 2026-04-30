import { motion } from 'framer-motion'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Truck, Package, ArrowRight, Shield, Clock, MapPin } from 'lucide-react'
import { useState } from 'react'
import { orderApi } from '../api/client'

const DeliverySelection = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [selected, setSelected] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const { orderId, reference, amount, deliveryZone } = location.state || {}

    // No order context = user landed here directly. Bounce them to the shop.
    if (!orderId) return <Navigate to="/shop" replace />

    const handleContinue = async () => {
        if (!selected) return
        setSubmitting(true); setError('')
        try {
            await orderApi.selectDeliveryMethod(orderId, selected)
            navigate('/success-delivery', { state: { selection: selected, orderId, reference, amount, deliveryZone } })
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Could not save your choice')
            setSubmitting(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-48 pb-20 container max-w-3xl"
        >
            <div className="text-center mb-12">
                <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'var(--badge-bg)', border: '1px solid rgba(192,57,43,0.3)' }}>
                    <Truck size={32} className="text-[var(--brand-red)]" />
                </div>
                <h1 className="text-4xl font-bold mb-4 font-heading" style={{ color: 'var(--text-primary)' }}>Choose delivery method</h1>
                <p style={{ color: 'var(--text-muted)' }}>How would you like to receive your order?</p>

                <div className="inline-flex flex-wrap items-center gap-x-4 gap-y-1 mt-6 px-5 py-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--divider)] text-[12px] font-medium">
                    <span className="text-[var(--brand-red)] font-bold font-mono">{reference}</span>
                    {deliveryZone && <span className="text-[var(--text-muted)]">·</span>}
                    {deliveryZone && <span className="text-[var(--text-muted)]">{deliveryZone}</span>}
                    {amount && <span className="text-[var(--text-muted)]">·</span>}
                    {amount && <span className="text-[var(--text-primary)] font-bold">₦{Number(amount).toLocaleString('en-NG')}</span>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <motion.button
                    whileHover={{ y: -5 }}
                    onClick={() => setSelected('assisted')}
                    className="p-8 rounded-2xl text-left transition-all"
                    style={{
                        background: selected === 'assisted' ? 'var(--badge-bg)' : 'var(--glass-bg)',
                        border: selected === 'assisted' ? '2px solid var(--brand-red)' : '2px solid var(--glass-border)',
                    }}
                >
                    <div className="w-12 h-12 rounded-full mb-4 flex items-center justify-center" style={{ background: 'var(--badge-bg)' }}>
                        <Package size={24} className="text-[var(--brand-red)]" />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Assisted delivery</h3>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>We handle the logistics end-to-end. Your delivery fee is already included.</p>
                    <ul className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <li className="flex items-center gap-2"><Shield size={14} className="text-[var(--brand-red)]" /> Platform-managed logistics</li>
                        <li className="flex items-center gap-2"><Clock size={14} className="text-[var(--brand-red)]" /> 1–3 day delivery window</li>
                        <li className="flex items-center gap-2"><MapPin size={14} className="text-[var(--brand-red)]" /> Doorstep delivery</li>
                    </ul>
                </motion.button>

                <motion.button
                    whileHover={{ y: -5 }}
                    onClick={() => setSelected('self')}
                    className="p-8 rounded-2xl text-left transition-all"
                    style={{
                        background: selected === 'self' ? 'var(--badge-bg)' : 'var(--glass-bg)',
                        border: selected === 'self' ? '2px solid var(--brand-red)' : '2px solid var(--glass-border)',
                    }}
                >
                    <div className="w-12 h-12 rounded-full mb-4 flex items-center justify-center" style={{ background: 'var(--badge-bg)' }}>
                        <Truck size={24} className="text-[var(--brand-red)]" />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Self-arranged</h3>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Send your own rider or pick up from our location. Our team will contact you to coordinate.</p>
                    <ul className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <li className="flex items-center gap-2"><Shield size={14} className="text-[var(--brand-red)]" /> Verified pickup address</li>
                        <li className="flex items-center gap-2"><Clock size={14} className="text-[var(--brand-red)]" /> Flexible scheduling</li>
                        <li className="flex items-center gap-2"><MapPin size={14} className="text-[var(--brand-red)]" /> Release code on arrival</li>
                    </ul>
                </motion.button>
            </div>

            {error && (
                <div className="mb-6 px-5 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-[#ed0000] text-sm font-bold text-center">{error}</div>
            )}

            <button
                onClick={handleContinue}
                disabled={!selected || submitting}
                className={`btn-primary w-full py-5 text-lg ${(!selected || submitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {submitting ? 'Saving…' : <>Continue <ArrowRight size={20} /></>}
            </button>
        </motion.div>
    )
}

export default DeliverySelection
