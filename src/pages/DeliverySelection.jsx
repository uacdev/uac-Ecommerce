import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { Truck, Package, ArrowRight, Shield, Clock, MapPin } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../context/StoreContext'

const DeliverySelection = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [selected, setSelected] = useState(null)
    const { orders, updateOrderDelivery } = useStore()

    // Get the most recent order (or specific one from state)
    const orderId = location.state?.orderId || (orders.length > 0 ? orders[0].id : null)

    const handleContinue = () => {
        if (selected && orderId) {
            updateOrderDelivery(orderId, selected)
            navigate('/success-delivery', { state: { selection: selected, orderId } })
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-48 pb-20 container max-w-3xl"
        >
            <div className="text-center mb-12">
                <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'var(--badge-bg)', border: '1px solid rgba(241,139,36,0.3)' }}>
                    <Truck size={32} className="text-[#F18B24]" />
                </div>
                <h1 className="text-4xl font-bold mb-4 font-heading" style={{ color: 'var(--text-primary)' }}>Choose Delivery Method</h1>
                <p style={{ color: 'var(--text-muted)' }}>Select how you'd like to receive your item.</p>
                {orderId && <p className="text-[#F18B24] text-sm font-mono mt-2">Order: {orderId}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {/* Assisted Delivery */}
                <motion.button
                    whileHover={{ y: -5 }}
                    onClick={() => setSelected('assisted')}
                    className="p-8 rounded-2xl text-left transition-all"
                    style={{
                        background: selected === 'assisted' ? 'var(--badge-bg)' : 'var(--glass-bg)',
                        border: selected === 'assisted' ? '2px solid #F18B24' : '2px solid var(--glass-border)',
                    }}
                >
                    <div className="w-12 h-12 rounded-full mb-4 flex items-center justify-center" style={{ background: 'var(--badge-bg)' }}>
                        <Package size={24} className="text-[#F18B24]" />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Assisted Delivery</h3>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>We handle the logistics end-to-end. You sit back and receive your item.</p>
                    <ul className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <li className="flex items-center gap-2"><Shield size={14} className="text-[#F18B24]" /> Platform-managed logistics</li>
                        <li className="flex items-center gap-2"><Clock size={14} className="text-[#F18B24]" /> 2-3 day delivery window</li>
                        <li className="flex items-center gap-2"><MapPin size={14} className="text-[#F18B24]" /> Doorstep delivery</li>
                    </ul>
                </motion.button>

                {/* Self-Arranged */}
                <motion.button
                    whileHover={{ y: -5 }}
                    onClick={() => setSelected('self')}
                    className="p-8 rounded-2xl text-left transition-all"
                    style={{
                        background: selected === 'self' ? 'var(--badge-bg)' : 'var(--glass-bg)',
                        border: selected === 'self' ? '2px solid #F18B24' : '2px solid var(--glass-border)',
                    }}
                >
                    <div className="w-12 h-12 rounded-full mb-4 flex items-center justify-center" style={{ background: 'var(--badge-bg)' }}>
                        <Truck size={24} className="text-[#F18B24]" />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Self-Arranged</h3>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Use your own rider or come pick it up yourself.</p>
                    <ul className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <li className="flex items-center gap-2"><Shield size={14} className="text-[#F18B24]" /> Verified pickup address</li>
                        <li className="flex items-center gap-2"><Clock size={14} className="text-[#F18B24]" /> Flexible scheduling</li>
                        <li className="flex items-center gap-2"><MapPin size={14} className="text-[#F18B24]" /> Release code on arrival</li>
                    </ul>
                </motion.button>
            </div>

            <button
                onClick={handleContinue}
                disabled={!selected}
                className={`btn-primary w-full py-5 text-lg ${!selected ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                Continue <ArrowRight size={20} />
            </button>
        </motion.div>
    )
}

export default DeliverySelection
