import { motion } from 'framer-motion'
import { useSearchParams, Link } from 'react-router-dom'
import { XCircle } from 'lucide-react'

const OrderFailed = () => {
    const [searchParams] = useSearchParams()
    const ref = searchParams.get('ref')

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pt-48 pb-20 container max-w-2xl text-center"
        >
            <div className="flex justify-center mb-8">
                <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: 'var(--badge-bg)', border: '1px solid rgba(192,57,43,0.3)' }}>
                    <XCircle size={48} className="text-[var(--brand-red)]" />
                </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading" style={{ color: 'var(--text-primary)' }}>
                Payment Failed
            </h1>
            <p className="text-lg mb-10 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                Your payment could not be completed. No charge was made. You can try again or choose bank deposit at checkout.
            </p>

            {ref && (
                <div className="glass p-6 mb-10">
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Reference</p>
                    <span className="text-xl font-black tracking-tight text-[var(--brand-red)]">{ref}</span>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                    to="/shop"
                    className="px-10 py-4 rounded-[24px] font-black uppercase tracking-widest text-sm transition-all bg-[var(--brand-red)] text-white hover:opacity-90"
                >
                    Try Again
                </Link>
                <Link
                    to="/"
                    className="px-10 py-4 rounded-[24px] font-black uppercase tracking-widest text-sm transition-all border-2 border-[var(--divider)] hover:border-[var(--text-muted)]"
                    style={{ color: 'var(--text-muted)' }}
                >
                    Go Home
                </Link>
            </div>
        </motion.div>
    )
}

export default OrderFailed
