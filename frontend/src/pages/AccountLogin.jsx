import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, ChevronLeft } from 'lucide-react'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { customerApi } from '../api/client'

const AccountLogin = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { signIn } = useCustomerAuth()
    const [mode, setMode] = useState('signin') // 'signin' | 'forgot'
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [show, setShow] = useState(false)
    const [error, setError] = useState(null)
    const [info, setInfo] = useState(null)
    const [loading, setLoading] = useState(false)

    const after = location.state?.after || '/account'

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true); setError(null); setInfo(null)
        const res = await signIn(email.trim(), password)
        if (res.success) navigate(after, { replace: true })
        else { setError(res.message || 'Sign-in failed.'); setLoading(false) }
    }

    const handleForgot = async (e) => {
        e.preventDefault()
        setLoading(true); setError(null); setInfo(null)
        try {
            const res = await customerApi.requestPasswordReset(email.trim())
            setInfo(res.data?.message || 'If that email is registered, a reset link has been sent.')
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Could not send reset email.')
        } finally {
            setLoading(false)
        }
    }

    const switchMode = (next) => { setMode(next); setError(null); setInfo(null); setPassword('') }

    return (
        <div className="pt-40 pb-32 container max-w-md font-['Sen',sans-serif]">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold tracking-tight mb-2 text-[var(--text-primary)]">
                    {mode === 'forgot' ? 'Reset your password' : 'Welcome back'}
                </h1>
                <p className="text-[14px] text-[var(--text-muted)] mb-10">
                    {mode === 'forgot'
                        ? "Enter your email and we'll send you a reset link."
                        : 'Sign in to track orders and check out faster.'}
                </p>

                <form onSubmit={mode === 'forgot' ? handleForgot : handleSubmit} className="space-y-6">
                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-[#ed0000] text-[13px] font-bold flex items-center gap-3">
                                <ShieldCheck size={18} /> {error}
                            </motion.div>
                        )}
                        {info && (
                            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[13px] font-bold flex items-center gap-3">
                                <CheckCircle2 size={18} /> {info}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div>
                        <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Email</label>
                        <div className="relative mt-2">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-xl pl-12 pr-4 py-4 text-[14px] outline-none text-[var(--text-primary)] focus:border-[#ed0000]"
                                placeholder="you@example.com" />
                        </div>
                    </div>

                    {mode === 'signin' && (
                        <div>
                            <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Password</label>
                            <div className="relative mt-2">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input required type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-xl pl-12 pr-12 py-4 text-[14px] outline-none text-[var(--text-primary)] focus:border-[#ed0000]"
                                    placeholder="At least 8 characters" />
                                <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] p-2">
                                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end">
                        {mode === 'signin' ? (
                            <button type="button" onClick={() => switchMode('forgot')} className="text-[12px] font-bold text-[#ed0000] hover:underline">Forgot password?</button>
                        ) : (
                            <button type="button" onClick={() => switchMode('signin')} className="text-[12px] font-bold text-[var(--text-muted)] hover:text-[#ed0000] flex items-center gap-1.5">
                                <ChevronLeft size={14} /> Back to sign in
                            </button>
                        )}
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full py-4 rounded-xl bg-black text-white font-bold text-[14px] hover:bg-[#ed0000] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        {loading ? (mode === 'forgot' ? 'Sending…' : 'Signing in…') : (<>{mode === 'forgot' ? 'Send reset link' : 'Sign in'} <ArrowRight size={16} /></>)}
                    </button>
                </form>

                <div className="mt-8 text-center text-[13px] text-[var(--text-muted)]">
                    No account yet?{' '}
                    <Link to="/account/signup" state={{ after }} className="font-bold text-[#ed0000] hover:underline">Create one</Link>
                </div>
            </motion.div>
        </div>
    )
}

export default AccountLogin
