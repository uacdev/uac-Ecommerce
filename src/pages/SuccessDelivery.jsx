import { motion } from 'framer-motion'
import { useLocation, Link } from 'react-router-dom'
import { Truck } from 'lucide-react'

const SuccessDelivery = () => {
    const location = useLocation()
    const selection = location.state?.selection || 'assisted'

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pt-48 pb-20 container max-w-2xl text-center"
        >
            <div className="flex justify-center mb-8">
                <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: 'var(--badge-bg)', border: '1px solid rgba(241,139,36,0.3)' }}>
                    <Truck size={48} className="text-[#F18B24]" />
                </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading" style={{ color: 'var(--text-primary)' }}>Delivery Method Confirmed!</h1>
            <p className="text-lg mb-10 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                We have received your preference for
                <span className="text-[#F18B24] font-bold mx-1">
                    {selection === 'assisted' ? 'Assisted Delivery' : 'Self-Arranged Delivery'}
                </span>.
            </p>

            <div className="glass p-8 mb-12 text-left">
                <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Next Steps:</h3>
                {selection === 'assisted' ? (
                    <ul className="space-y-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                        <li className="flex gap-2"><div className="w-1.5 h-1.5 mt-2 bg-[#F18B24] rounded-full shrink-0" /> Our team will contact you with a delivery quote within 2 hrs.</li>
                        <li className="flex gap-2"><div className="w-1.5 h-1.5 mt-2 bg-[#F18B24] rounded-full shrink-0" /> Once accepted, we dispatch the item immediately.</li>
                        <li className="flex gap-2"><div className="w-1.5 h-1.5 mt-2 bg-[#F18B24] rounded-full shrink-0" /> You will receive a tracking contact number.</li>
                    </ul>
                ) : (
                    <ul className="space-y-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                        <li className="flex gap-2"><div className="w-1.5 h-1.5 mt-2 bg-[#F18B24] rounded-full shrink-0" /> Check your WhatsApp/Email for the pickup address.</li>
                        <li className="flex gap-2"><div className="w-1.5 h-1.5 mt-2 bg-[#F18B24] rounded-full shrink-0" /> Share your rider/driver details with us for verification.</li>
                        <li className="flex gap-2"><div className="w-1.5 h-1.5 mt-2 bg-[#F18B24] rounded-full shrink-0" /> Release code will be sent to you upon arrival.</li>
                    </ul>
                )}
            </div>

            <Link to="/" className="btn-primary py-3 px-8">
                Back to Homepage
            </Link>
        </motion.div>
    )
}

export default SuccessDelivery
