import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, Mail } from 'lucide-react'
import { productApi } from '../api/client'
import { useCustomerAuth } from '../context/CustomerAuthContext'

const NotifyWhenInStock = ({ productId, productName, className = '' }) => {
    const { customer } = useCustomerAuth() || {}
    const [open, setOpen] = useState(false)
    const [email, setEmail] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [done, setDone] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (customer?.email && !email) setEmail(customer.email)
    }, [customer?.email])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email) return
        setSubmitting(true); setError('')
        try {
            const res = await productApi.subscribeRestock(productId, email)
            setDone(res.data?.message || "We'll email you the moment it's back.")
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Could not save subscription.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className={className}>
            {!open ? (
                <button
                    onClick={() => setOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 border-[var(--brand-red)]/40 text-[var(--brand-red)] font-bold text-sm uppercase tracking-widest hover:bg-[var(--brand-red)] hover:text-white transition-all"
                >
                    <Bell size={16} /> Notify me when back in stock
                </button>
            ) : (
                <AnimatePresence mode="wait">
                    {done ? (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-start gap-3"
                        >
                            <Check size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[13px] font-bold text-emerald-700 dark:text-emerald-400">{done}</p>
                                <p className="text-[11px] text-emerald-700/70 dark:text-emerald-400/70 mt-1">We'll send a one-off email when {productName} is available.</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.form
                            key="form"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            onSubmit={handleSubmit}
                            className="space-y-3"
                        >
                            <p className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Drop your email — we'll let you know</p>
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                    <input
                                        autoFocus
                                        required
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-xl pl-10 pr-4 py-3 text-[13px] outline-none text-[var(--text-primary)] focus:border-[var(--brand-red)]"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-3 rounded-xl bg-[var(--brand-red)] text-white font-bold text-[12px] uppercase tracking-widest hover:bg-[#c80000] transition-all disabled:opacity-50"
                                >
                                    {submitting ? 'Saving…' : 'Notify me'}
                                </button>
                            </div>
                            {error && <p className="text-[11px] font-bold text-[var(--brand-red)]">{error}</p>}
                            <p className="text-[10px] text-[var(--text-muted)] font-medium">One email when it's back. No marketing spam.</p>
                        </motion.form>
                    )}
                </AnimatePresence>
            )}
        </div>
    )
}

export default NotifyWhenInStock
