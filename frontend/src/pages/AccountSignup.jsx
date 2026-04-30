import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react'
import { useCustomerAuth } from '../context/CustomerAuthContext'

const AccountSignup = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { signUp } = useCustomerAuth()
    const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' })
    const [show, setShow] = useState(false)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const after = location.state?.after || '/account'

    const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
        setLoading(true); setError(null)
        const res = await signUp({ ...form, email: form.email.trim() })
        if (res.success) navigate(after, { replace: true })
        else { setError(res.message || 'Could not create account.'); setLoading(false) }
    }

    return (
        <div className="pt-40 pb-32 container max-w-md font-['Sen',sans-serif]">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold tracking-tight mb-2 text-[var(--text-primary)]">Create your account</h1>
                <p className="text-[14px] text-[var(--text-muted)] mb-10">Track your orders, save your details, and reorder in one click.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-[#ed0000] text-[13px] font-bold flex items-center gap-3">
                            <ShieldCheck size={18} /> {error}
                        </div>
                    )}

                    <div>
                        <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Full name</label>
                        <div className="relative mt-2">
                            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input required value={form.fullName} onChange={update('fullName')}
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-xl pl-12 pr-4 py-4 text-[14px] outline-none text-[var(--text-primary)] focus:border-[#ed0000]"
                                placeholder="Your name" />
                        </div>
                    </div>

                    <div>
                        <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Email</label>
                        <div className="relative mt-2">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input required type="email" value={form.email} onChange={update('email')}
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-xl pl-12 pr-4 py-4 text-[14px] outline-none text-[var(--text-primary)] focus:border-[#ed0000]"
                                placeholder="you@example.com" />
                        </div>
                    </div>

                    <div>
                        <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Phone <span className="text-[var(--text-muted)] opacity-70 normal-case font-medium">(optional)</span></label>
                        <div className="relative mt-2">
                            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input type="tel" value={form.phone} onChange={update('phone')}
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-xl pl-12 pr-4 py-4 text-[14px] outline-none text-[var(--text-primary)] focus:border-[#ed0000]"
                                placeholder="08000000000" />
                        </div>
                    </div>

                    <div>
                        <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Password</label>
                        <div className="relative mt-2">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input required type={show ? 'text' : 'password'} value={form.password} onChange={update('password')}
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-xl pl-12 pr-12 py-4 text-[14px] outline-none text-[var(--text-primary)] focus:border-[#ed0000]"
                                placeholder="At least 8 characters" />
                            <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] p-2">
                                {show ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full py-4 rounded-xl bg-black text-white font-bold text-[14px] hover:bg-[#ed0000] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        {loading ? 'Creating account…' : (<>Create account <ArrowRight size={16} /></>)}
                    </button>
                </form>

                <div className="mt-8 text-center text-[13px] text-[var(--text-muted)]">
                    Already have an account?{' '}
                    <Link to="/account/login" state={{ after }} className="font-bold text-[#ed0000] hover:underline">Sign in</Link>
                </div>
            </motion.div>
        </div>
    )
}

export default AccountSignup
