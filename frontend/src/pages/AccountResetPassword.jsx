import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Lock, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, ChevronLeft } from 'lucide-react'
import { customerApi } from '../api/client'

const AccountResetPassword = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token') || ''

    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [show, setShow] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [done, setDone] = useState(false)

    useEffect(() => {
        if (!token) setError('No reset token in the link. Request a new password reset email.')
    }, [token])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        if (password.length < 8) return setError('Password must be at least 8 characters.')
        if (password !== confirm) return setError('Passwords do not match.')

        setLoading(true)
        try {
            await customerApi.resetPassword(token, password)
            setDone(true)
            setTimeout(() => navigate('/account/login', { replace: true }), 2200)
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Could not reset password.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="pt-40 pb-32 container max-w-md font-['Sen',sans-serif]">
            <Link to="/" className="inline-flex items-center gap-2 text-[12px] font-bold text-[var(--text-muted)] hover:text-[#ed0000] mb-10">
                <ChevronLeft size={16} /> Back to home
            </Link>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold tracking-tight mb-2 text-[var(--text-primary)]">Set a new password</h1>
                <p className="text-[14px] text-[var(--text-muted)] mb-10">Enter your new password below.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-[#ed0000] text-[13px] font-bold flex items-center gap-3">
                            <ShieldCheck size={18} /> {error}
                        </div>
                    )}
                    {done && (
                        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[13px] font-bold flex items-center gap-3">
                            <CheckCircle2 size={18} /> Password updated. Redirecting to sign in…
                        </div>
                    )}

                    <div>
                        <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">New password</label>
                        <div className="relative mt-2">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input required type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                                disabled={!token || done}
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-xl pl-12 pr-12 py-4 text-[14px] outline-none text-[var(--text-primary)] focus:border-[#ed0000] disabled:opacity-50"
                                placeholder="At least 8 characters" />
                            <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] p-2">
                                {show ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Confirm new password</label>
                        <div className="relative mt-2">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input required type={show ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)}
                                disabled={!token || done}
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-xl pl-12 pr-4 py-4 text-[14px] outline-none text-[var(--text-primary)] focus:border-[#ed0000] disabled:opacity-50"
                                placeholder="Re-enter the new password" />
                        </div>
                    </div>

                    <button type="submit" disabled={loading || !token || done}
                        className="w-full py-4 rounded-xl bg-black text-white font-bold text-[14px] hover:bg-[#ed0000] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        {loading ? 'Updating…' : (<>Update password <ArrowRight size={16} /></>)}
                    </button>

                    <div className="text-center pt-2">
                        <Link to="/account/login" className="text-[12px] font-medium text-[var(--text-muted)] hover:text-[#ed0000]">
                            Back to sign in
                        </Link>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

export default AccountResetPassword
