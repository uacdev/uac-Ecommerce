import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Lock, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, ChevronLeft } from 'lucide-react'
import { authApi } from '../api/client'

const ResetPassword = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token') || ''

    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [showPassword, setShowPassword] = useState(false)
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
            await authApi.resetPassword(token, password)
            setDone(true)
            setTimeout(() => navigate('/admin/login', { replace: true }), 2200)
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Could not reset password.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white font-['Sen',sans-serif] text-slate-800 px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <Link to="/" className="inline-flex items-center gap-2 text-[12px] font-bold text-slate-400 hover:text-black mb-10">
                    <ChevronLeft size={16} /> Back to home
                </Link>

                <img src="/images/uac_foods_full.png" alt="UAC Logo" className="h-14 mb-10" />

                <h1 className="text-2xl font-medium tracking-tight text-slate-900 leading-tight">Set a new password</h1>
                <p className="text-slate-400 font-medium mt-2.5 text-[15px]">Enter your new password below. You'll be signed in to confirm.</p>

                <form onSubmit={handleSubmit} className="space-y-7 mt-12">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 rounded-xl bg-red-50 text-[#ed0000] text-[13px] font-bold border border-red-100 flex items-center gap-3 shadow-sm"
                        >
                            <ShieldCheck size={18} />
                            {error}
                        </motion.div>
                    )}
                    {done && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-[13px] font-bold border border-emerald-100 flex items-center gap-3 shadow-sm"
                        >
                            <CheckCircle2 size={18} />
                            Password updated. Redirecting you to sign in…
                        </motion.div>
                    )}

                    <div className="space-y-3">
                        <label className="text-[13px] font-bold text-slate-600 tracking-tight ml-1">New password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ed0000]" size={18} />
                            <input
                                required type={showPassword ? 'text' : 'password'}
                                value={password} onChange={(e) => setPassword(e.target.value)}
                                placeholder="At least 8 characters"
                                disabled={!token || done}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-12 text-slate-700 text-sm font-medium outline-none focus:bg-white focus:border-[#ed0000] shadow-sm transition-all disabled:opacity-50"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#ed0000] p-2">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[13px] font-bold text-slate-600 tracking-tight ml-1">Confirm new password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ed0000]" size={18} />
                            <input
                                required type={showPassword ? 'text' : 'password'}
                                value={confirm} onChange={(e) => setConfirm(e.target.value)}
                                placeholder="Re-enter the new password"
                                disabled={!token || done}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-4 text-slate-700 text-sm font-medium outline-none focus:bg-white focus:border-[#ed0000] shadow-sm transition-all disabled:opacity-50"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !token || done}
                        className="w-full py-4.5 rounded-xl bg-black text-white text-[15px] font-bold shadow-xl shadow-slate-100 hover:bg-[#ed0000] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>Update password <ArrowRight size={18} /></>
                        )}
                    </button>

                    <div className="text-center pt-2">
                        <Link to="/admin/login" className="text-[12px] font-medium text-slate-400 hover:text-[#ed0000]">
                            Back to sign in
                        </Link>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

export default ResetPassword
