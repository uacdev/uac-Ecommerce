import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SettingInput } from '../ui/shared_ui'
import { useStore } from '../../../context/StoreContext'
import { useAuth } from '../../../context/AuthContext'
import { authApi, uploadApi } from '../../../api/client'

const SettingsTab = () => {
    const { adminProfile, setAdminProfile } = useStore()
    const { user } = useAuth()
    const [subTab, setSubTab] = useState('profile')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    const [profile, setProfile] = useState({ fullName: '', email: '', photo: '' })
    const [security, setSecurity] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

    useEffect(() => {
        if (adminProfile) {
            setProfile({
                fullName: adminProfile.fullName || '',
                email: adminProfile.email || user?.email || '',
                photo: adminProfile.photo || ''
            })
        } else if (user?.email) {
            setProfile(p => ({ ...p, email: user.email }))
        }
    }, [adminProfile, user?.email])

    const handleProfileChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value })
    const handleSecurityChange = (e) => setSecurity({ ...security, [e.target.name]: e.target.value })

    const [uploadingPhoto, setUploadingPhoto] = useState(false)

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        setUploadingPhoto(true); setError('')
        try {
            const res = await uploadApi.image(file)
            const url = res.data?.data?.url
            if (url) {
                setProfile(p => ({ ...p, photo: url }))
                // Persist immediately so the avatar is permanent
                await setAdminProfile({ photo: url })
            } else {
                flash('Upload returned no URL', true)
            }
        } catch (err) {
            flash(err.response?.data?.message || err.message || 'Photo upload failed', true)
        } finally {
            setUploadingPhoto(false)
        }
    }

    const flash = (msg, isError = false) => {
        if (isError) { setError(msg); setSuccess('') }
        else { setSuccess(msg); setError('') }
        setTimeout(() => { setSuccess(''); setError('') }, 3500)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true); setSuccess(''); setError('')

        if (subTab === 'profile') {
            const res = await setAdminProfile({ fullName: profile.fullName, photo: profile.photo })
            setLoading(false)
            if (res?.success) flash('Profile updated.')
            else flash(res?.message || 'Could not save profile.', true)
            return
        }

        // security
        if (security.newPassword.length < 8) {
            setLoading(false); flash('Password must be at least 8 characters.', true); return
        }
        if (security.newPassword !== security.confirmPassword) {
            setLoading(false); flash('Passwords do not match.', true); return
        }
        try {
            await authApi.changePassword(security.currentPassword, security.newPassword)
            setLoading(false)
            flash('Password updated.')
            setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (err) {
            setLoading(false)
            flash(err.response?.data?.message || err.message || 'Could not update password.', true)
        }
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500 max-w-4xl text-[var(--text-primary)]">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Account Settings</h2>
                <p className="text-[14px] text-[var(--text-muted)] mt-1 font-medium">General profile management and system security configurations.</p>
            </div>

            <div className="flex border-b border-[var(--divider)] gap-10">
                {['profile', 'security'].map(s => (
                    <button
                        key={s}
                        onClick={() => { setSubTab(s); setSuccess(''); setError('') }}
                        className={`pb-5 text-[13px] font-bold transition-all relative capitalize tracking-tight ${subTab === s ? 'text-[#ed0000]' : 'text-[var(--text-muted)]'}`}
                    >
                        {s} details
                        {subTab === s && <motion.div layoutId="setTab" className="absolute bottom-0 left-0 w-full h-1 bg-[#ed0000] rounded-full" />}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="bg-[var(--bg-tertiary)] p-12 rounded-3xl border border-[var(--divider)] shadow-sm relative overflow-hidden">
                <AnimatePresence>
                    {success && (
                        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="absolute top-0 left-0 right-0 py-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold text-[12px] text-center tracking-tight z-10">
                            {success}
                        </motion.div>
                    )}
                    {error && (
                        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="absolute top-0 left-0 right-0 py-3 bg-red-50 dark:bg-red-950/30 text-[#ed0000] font-bold text-[12px] text-center tracking-tight z-10">
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {subTab === 'profile' ? (
                    <div className="space-y-10">
                        <div className="flex items-center gap-8">
                            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-950/20 flex items-center justify-center text-[#ed0000] font-bold text-2xl shadow-xl ring-4 ring-white dark:ring-[#222] overflow-hidden">
                                {profile.photo ? <img src={profile.photo} className="w-full h-full object-cover" alt="" /> : (profile.fullName?.charAt(0) || 'U')}
                            </div>
                            <div className="relative">
                                <button type="button" disabled={uploadingPhoto} className="text-[12px] font-bold text-[#ed0000] border border-red-100 dark:border-red-900/40 px-6 py-3 rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-all pointer-events-none disabled:opacity-50">
                                    {uploadingPhoto ? 'Uploading…' : 'Update Photo'}
                                </button>
                                <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploadingPhoto} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <SettingInput label="Full Name" name="fullName" value={profile.fullName} onChange={handleProfileChange} />
                            <SettingInput label="Email address" name="email" value={profile.email} onChange={() => {}} />
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] font-medium">Email is managed by your auth provider and can't be changed here.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <SettingInput label="Current Password" name="currentPassword" type="password" value={security.currentPassword} onChange={handleSecurityChange} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <SettingInput label="New Password" name="newPassword" type="password" value={security.newPassword} onChange={handleSecurityChange} />
                            <SettingInput label="Confirm Password" name="confirmPassword" type="password" value={security.confirmPassword} onChange={handleSecurityChange} />
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] font-medium">Minimum 8 characters. Current password is recommended for verification.</p>
                    </div>
                )}
                <div className="mt-14 pt-8 border-t border-[var(--divider)] flex justify-end">
                    <button type="submit" disabled={loading} className="px-12 py-4 bg-[#0f2e53] text-white rounded-2xl font-bold text-[13px] shadow-2xl hover:bg-[#0a1f38] transition-all active:scale-[0.98] disabled:opacity-50">
                        {loading ? 'Saving…' : 'Save changes'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default SettingsTab
