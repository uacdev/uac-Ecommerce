import { motion } from 'framer-motion'
import { useLocation, Link } from 'react-router-dom'
import { CheckCircle, Instagram, MessageCircle, Copy, Check } from 'lucide-react'
import { useState } from 'react'

const Success = () => {
    const location = useLocation()
    const orderId = location.state?.orderId || 'SR-2026-0000'
    const paymentMethod = location.state?.paymentMethod || 'paystack'
    const [copied, setCopied] = useState(false)

    const copyToClipboard = () => {
        navigator.clipboard.writeText(orderId)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pt-48 pb-20 container max-w-2xl text-center"
        >
            <div className="flex justify-center mb-8">
                <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: 'var(--badge-bg)', border: '1px solid rgba(241,139,36,0.3)' }}>
                    <CheckCircle size={48} className="text-[#F18B24]" />
                </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading" style={{ color: 'var(--text-primary)' }}>
                {paymentMethod === 'bank' ? 'Order Placed!' : 'Payment Successful!'}
            </h1>
            <p className="text-lg mb-10 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                {paymentMethod === 'bank'
                    ? "Your order has been reserved. Please ensure you've made the transfer to enable confirmation."
                    : "Thank you for your order. To confirm delivery, please contact us with your Order ID."
                }
            </p>

            <div className="glass p-8 mb-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#F18B24]" />
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Your Order ID</p>
                <div className="flex items-center justify-center gap-4">
                    <span className="text-4xl font-black font-heading tracking-tighter text-[#F18B24]">
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

            <div className="space-y-4">
                <p className="text-sm font-bold uppercase tracking-widest mb-6" style={{ color: 'var(--text-muted)' }}>Confirm Delivery Via:</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 py-4 glass transition-all font-bold group"
                    >
                        <Instagram size={24} className="group-hover:text-[#E1306C] transition-colors" />
                        <span style={{ color: 'var(--text-primary)' }}>Instagram Direct</span>
                    </a>
                    <a
                        href={`https://wa.me/?text=Hi, i just paid for Order ${orderId}. Please confirm.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 py-4 glass transition-all font-bold group"
                    >
                        <MessageCircle size={24} className="group-hover:text-[#25D366] transition-colors" />
                        <span style={{ color: 'var(--text-primary)' }}>WhatsApp Chat</span>
                    </a>
                </div>

                {/* Demo: Simulate Admin Confirmation */}
                <div className="pt-8 mt-8 mb-8" style={{ borderTop: '1px solid var(--divider)' }}>
                    <p className="text-xs text-center mb-4 uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>Demo Control</p>
                    <Link to="/deliver-selection" state={{ orderId }} className="block w-full py-3 text-center rounded-xl text-sm transition-colors" style={{ background: 'var(--glass-bg)', border: '1px dashed var(--glass-border)', color: 'var(--text-muted)' }}>
                        Simulate: Admin Confirms Payment →
                    </Link>
                </div>

                <Link to="/" className="inline-block mt-4 text-sm font-medium transition-colors hover:text-[#F18B24]" style={{ color: 'var(--text-muted)' }}>
                    Return to Homepage
                </Link>
            </div>
        </motion.div>
    )
}

export default Success
