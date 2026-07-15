import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Phone, MapPin, Lock, CheckCircle2, ShieldAlert } from 'lucide-react'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { customerApi, deliveryApi } from '../api/client'

const EditProfilePanel = ({ open, onClose }) => {
    const { customer, updateProfile } = useCustomerAuth() || {}
    const [tab, setTab] = useState('profile') // 'profile' | 'security'
    const [states, setStates] = useState([])

    const [form, setForm] = useState({ fullName: '', phone: '', defaultAddress: '', defaultState: '' })
    const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
    const [savingProfile, setSavingProfile] = useState(false)
    const [savingPwd, setSavingPwd] = useState(false)
    const [profileMsg, setProfileMsg] = useState('')
    const [profileErr, setProfileErr] = useState('')
    const [pwdMsg, setPwdMsg] = useState('')
    const [pwdErr, setPwdErr] = useState('')

    useEffect(() => {
        if (open) {
            deliveryApi.getStates()
                .then(res => {
                    const fetched = res.data?.data || []
                    setStates(Array.isArray(fetched)
                        ? fetched.filter(s => String(s).trim().toLowerCase() === 'lagos')
                        : ['Lagos'])
                })
                .catch(() => setStates(['Lagos']))
            setProfileMsg(''); setProfileErr(''); setPwdMsg(''); setPwdErr('')
        }
    }, [open])

    useEffect(() => {
        if (customer) {
            setForm({
                fullName: customer.fullName || '',
                phone: customer.phone || '',
                defaultAddress: customer.defaultAddress || '',
                defaultState: customer.defaultState || ''
            })
        }
    }, [customer, open])

    const handleSaveProfile = async (e) => {
        e.preventDefault()
        setSavingProfile(true); setProfileErr(''); setProfileMsg('')
        const res = await updateProfile(form)
        setSavingProfile(false)
        if (res?.success) setProfileMsg('Profile updated.')
        else setProfileErr(res?.message || 'Could not save profile.')
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        setPwdErr(''); setPwdMsg('')
        if (pwd.newPassword.length < 8) return setPwdErr('New password must be at least 8 characters.')
        if (pwd.newPassword !== pwd.confirmPassword) return setPwdErr('Passwords do not match.')
        setSavingPwd(true)
        try {
            await customerApi.changePassword(pwd.currentPassword, pwd.newPassword)
            setPwdMsg('Password updated.')
            setPwd({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (err) {
            setPwdErr(err.response?.data?.message || err.message || 'Could not change password.')
        } finally {
            setSavingPwd(false)
        }
    }

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 240 }}
                        className="fixed top-0 right-0 h-full w-full max-w-lg bg-[var(--bg-primary)] z-[110] shadow-2xl overflow-y-auto font-['Sen',sans-serif]"
                    >
                        <div className="sticky top-0 z-10 bg-[var(--bg-primary)] border-b border-[var(--divider)] px-8 py-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Account settings</h2>
                            <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                                <X size={22} />
                            </button>
                        </div>

                        <div className="px-8 pt-6 pb-12">
                            {/* Tabs */}
                            <div className="flex gap-8 border-b border-[var(--divider)] mb-8">
                                {[
                                    { k: 'profile', l: 'Profile' },
                                    { k: 'security', l: 'Security' }
                                ].map(t => (
                                    <button
                                        key={t.k}
                                        onClick={() => setTab(t.k)}
                                        className={`pb-4 text-[13px] font-bold tracking-tight relative ${tab === t.k ? 'text-[#ed0000]' : 'text-[var(--text-muted)]'}`}
                                    >
                                        {t.l}
                                        {tab === t.k && <motion.div layoutId="customerSetTab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#ed0000] rounded-full" />}
                                    </button>
                                ))}
                            </div>

                            {tab === 'profile' ? (
                                <form onSubmit={handleSaveProfile} className="space-y-6">
                                    {profileMsg && <Banner type="success" text={profileMsg} />}
                                    {profileErr && <Banner type="error" text={profileErr} />}

                                    <Field label="Full name" icon={<User size={14} />}>
                                        <input required value={form.fullName} onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
                                            className="w-full bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-xl pl-11 pr-4 py-3.5 text-[14px] outline-none text-[var(--text-primary)] focus:border-[#ed0000]" />
                                    </Field>

                                    <Field label="Email">
                                        <input value={customer?.email || ''} disabled
                                            className="w-full bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-xl px-4 py-3.5 text-[14px] text-[var(--text-muted)] outline-none cursor-not-allowed" />
                                        <p className="text-[10px] text-[var(--text-muted)] font-medium mt-1.5">Email is your account identifier. Contact support to change it.</p>
                                    </Field>

                                    <Field label="Phone" icon={<Phone size={14} />}>
                                        <input type="tel" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                                            placeholder="08000000000"
                                            className="w-full bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-xl pl-11 pr-4 py-3.5 text-[14px] outline-none text-[var(--text-primary)] focus:border-[#ed0000]" />
                                    </Field>

                                    <Field label="Default delivery address" icon={<MapPin size={14} />}>
                                        <input value={form.defaultAddress} onChange={(e) => setForm(f => ({ ...f, defaultAddress: e.target.value }))}
                                            placeholder="Street, area, city"
                                            className="w-full bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-xl pl-11 pr-4 py-3.5 text-[14px] outline-none text-[var(--text-primary)] focus:border-[#ed0000]" />
                                    </Field>

                                    <Field label="Default state">
                                        <select value={form.defaultState} onChange={(e) => setForm(f => ({ ...f, defaultState: e.target.value }))}
                                            className="w-full bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-xl px-4 py-3.5 text-[14px] outline-none text-[var(--text-primary)] focus:border-[#ed0000] cursor-pointer">
                                            <option value="">Pick a state</option>
                                            {states.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <p className="text-[10px] text-[var(--text-muted)] font-medium mt-1.5">We'll pre-fill this at checkout to save you time.</p>
                                    </Field>

                                    <div className="pt-2">
                                        <button type="submit" disabled={savingProfile}
                                            className="w-full py-4 rounded-xl bg-black text-white font-bold text-[13px] hover:bg-[#ed0000] transition-all disabled:opacity-50">
                                            {savingProfile ? 'Saving…' : 'Save changes'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleChangePassword} className="space-y-6">
                                    {pwdMsg && <Banner type="success" text={pwdMsg} />}
                                    {pwdErr && <Banner type="error" text={pwdErr} />}

                                    <Field label="Current password" icon={<Lock size={14} />}>
                                        <input required type="password" value={pwd.currentPassword} onChange={(e) => setPwd(p => ({ ...p, currentPassword: e.target.value }))}
                                            className="w-full bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-xl pl-11 pr-4 py-3.5 text-[14px] outline-none text-[var(--text-primary)] focus:border-[#ed0000]" />
                                    </Field>

                                    <Field label="New password" icon={<Lock size={14} />}>
                                        <input required type="password" value={pwd.newPassword} onChange={(e) => setPwd(p => ({ ...p, newPassword: e.target.value }))}
                                            placeholder="At least 8 characters"
                                            className="w-full bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-xl pl-11 pr-4 py-3.5 text-[14px] outline-none text-[var(--text-primary)] focus:border-[#ed0000]" />
                                    </Field>

                                    <Field label="Confirm new password" icon={<Lock size={14} />}>
                                        <input required type="password" value={pwd.confirmPassword} onChange={(e) => setPwd(p => ({ ...p, confirmPassword: e.target.value }))}
                                            className="w-full bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-xl pl-11 pr-4 py-3.5 text-[14px] outline-none text-[var(--text-primary)] focus:border-[#ed0000]" />
                                    </Field>

                                    <button type="submit" disabled={savingPwd}
                                        className="w-full py-4 rounded-xl bg-black text-white font-bold text-[13px] hover:bg-[#ed0000] transition-all disabled:opacity-50">
                                        {savingPwd ? 'Updating…' : 'Update password'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

const Field = ({ label, icon, children }) => (
    <div>
        <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{label}</label>
        <div className="relative mt-2">
            {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">{icon}</span>}
            {children}
        </div>
    </div>
)

const Banner = ({ type, text }) => (
    <div className={`p-3.5 rounded-xl text-[12px] font-bold flex items-center gap-3 ${
        type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
            : 'bg-red-50 dark:bg-red-950/30 text-[#ed0000]'
    }`}>
        {type === 'success' ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
        {text}
    </div>
)

export default EditProfilePanel
