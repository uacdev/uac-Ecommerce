import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

const CheckoutAuthSuccessModal = ({ onReturn }) => (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
        <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-auth-success-title"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-[var(--divider)] bg-[var(--bg-primary)] p-6 shadow-2xl sm:p-8"
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">
                <CheckCircle2 size={25} />
            </div>
            <h2 id="checkout-auth-success-title" className="mt-5 text-xl font-black text-[var(--text-primary)]">You are signed in</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                Your account is ready. Return to checkout to review your order and complete payment.
            </p>
            <button
                type="button"
                onClick={onReturn}
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-red)] px-5 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
                Return to checkout <ArrowRight size={17} />
            </button>
        </motion.section>
    </div>
)

export default CheckoutAuthSuccessModal
