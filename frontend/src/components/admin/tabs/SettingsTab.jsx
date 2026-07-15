import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SettingInput } from '../ui/shared_ui'
import { useStore } from '../../../context/StoreContext'
import { useAuth } from '../../../context/AuthContext'
import { authApi, uploadApi, deliveryApi } from '../../../api/client'

const SettingsTab = () => {
    const { adminProfile, setAdminProfile, whatsappNumber, updateWhatsAppNumber, deleteWhatsAppNumber } = useStore()
    const { user } = useAuth()
    const [subTab, setSubTab] = useState('profile')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    const [profile, setProfile] = useState({ fullName: '', email: '', photo: '' })
    const [security, setSecurity] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
    const [whatsappDraft, setWhatsAppDraft] = useState('')
    const [zones, setZones] = useState([])
    const [zonesLoading, setZonesLoading] = useState(true)
    const [zoneName, setZoneName] = useState('')
    const [zoneFee, setZoneFee] = useState('')
    const [zoneEditId, setZoneEditId] = useState('')
    const [zoneMessage, setZoneMessage] = useState('')
    const [zoneError, setZoneError] = useState('')
    const [zoneActionLoading, setZoneActionLoading] = useState(false)
    const [showZoneDeleteConfirm, setShowZoneDeleteConfirm] = useState(false)
    const [zoneToDeleteId, setZoneToDeleteId] = useState('')
    const [showZoneEditModal, setShowZoneEditModal] = useState(false)
    const [showZoneSuccess, setShowZoneSuccess] = useState(false)
    const [zoneSuccessMessage, setZoneSuccessMessage] = useState('')

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

    useEffect(() => {
        if (whatsappNumber || whatsappNumber === '') {
            setWhatsAppDraft(whatsappNumber || '')
        }
    }, [whatsappNumber])

    useEffect(() => {
        let cancelled = false
        const loadZones = async () => {
            setZonesLoading(true)
            try {
                const res = await deliveryApi.getZones()
                if (!cancelled) setZones(res.data?.data || [])
            } catch (err) {
                console.error('Error loading delivery zones:', err)
            } finally {
                if (!cancelled) setZonesLoading(false)
            }
        }
        loadZones()
        return () => { cancelled = true }
    }, [])

    const handleProfileChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value })
    const handleSecurityChange = (e) => setSecurity({ ...security, [e.target.name]: e.target.value })

    const clearZoneForm = () => {
        setZoneEditId('')
        setZoneName('')
        setZoneFee('')
    }

    const refreshZones = async () => {
        setZonesLoading(true)
        try {
            const res = await deliveryApi.getZones()
            setZones(res.data?.data || [])
        } catch (err) {
            console.error('Error refreshing delivery zones:', err)
        } finally {
            setZonesLoading(false)
        }
    }

    const saveWhatsApp = async () => {
        if (!whatsappDraft.trim()) {
            flash('WhatsApp number cannot be empty.', true)
            return { success: false }
        }

        setLoading(true)
        try {
            const res = await updateWhatsAppNumber(whatsappDraft.trim())
            if (res?.success) {
                flash('WhatsApp number saved.')
                return { success: true }
            }
            flash(res?.message || 'Could not save WhatsApp number.', true)
            return { success: false }
        } finally {
            setLoading(false)
        }
    }

    const removeWhatsApp = async () => {
        if (!window.confirm('Remove the saved WhatsApp contact number?')) return
        setLoading(true)
        try {
            const res = await deleteWhatsAppNumber()
            if (res?.success) {
                setWhatsAppDraft('')
                flash('WhatsApp number removed.')
                return { success: true }
            }
            flash(res?.message || 'Could not delete WhatsApp number.', true)
            return { success: false }
        } finally {
            setLoading(false)
        }
    }

    const handleZoneEdit = (zone) => {
        setZoneEditId(zone._id || zone.id)
        setZoneName(zone.name)
        setZoneFee(String(zone.fee))
        setZoneMessage('')
        setZoneError('')
        setShowZoneEditModal(true)
    }

    const handleZoneSubmit = async (e) => {
        e.preventDefault()
        setZoneError('')
        setZoneMessage('')

        const trimmedName = String(zoneName || '').trim()
        const feeValue = Number(zoneFee)
        if (!trimmedName || Number.isNaN(feeValue) || feeValue < 0) {
            setZoneError('Zone name and fee are required. Fee must be a valid number.')
            return
        }

        setZoneActionLoading(true)
        try {
            if (zoneEditId) {
                await deliveryApi.updateZone(zoneEditId, { name: trimmedName, fee: feeValue })
                setZoneMessage('Delivery zone updated.')
                setZoneSuccessMessage('Delivery zone updated.')
                setShowZoneSuccess(true)
                setShowZoneEditModal(false)
            } else {
                await deliveryApi.createZone({ name: trimmedName, fee: feeValue })
                setZoneMessage('Delivery zone added.')
            }
            clearZoneForm()
            await refreshZones()
        } catch (err) {
            console.error('Error saving delivery zone:', err)
            setZoneError(err.response?.data?.message || err.message || 'Could not save delivery zone.')
        } finally {
            setZoneActionLoading(false)
        }
    }

    const handleZoneDelete = async (id) => {
        setZoneToDeleteId(id)
        setShowZoneDeleteConfirm(true)
    }

    const confirmZoneDelete = async () => {
        setShowZoneDeleteConfirm(false)
        setZoneActionLoading(true)
        try {
            await deliveryApi.deleteZone(zoneToDeleteId)
            setZoneSuccessMessage('Delivery zone deleted.')
            setShowZoneSuccess(true)
            await refreshZones()
        } catch (err) {
            console.error('Error deleting delivery zone:', err)
            setZoneError(err.response?.data?.message || err.message || 'Could not delete delivery zone.')
        } finally {
            setZoneActionLoading(false)
            setZoneToDeleteId('')
        }
    }

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

        if (subTab === 'whatsapp') {
            const res = await saveWhatsApp()
            setLoading(false)
            if (res?.success) return
            return
        }

        if (subTab === 'delivery-zones') {
            setLoading(false)
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
                {['profile', 'whatsapp', 'delivery-zones', 'security'].map(s => (
                    <button
                        key={s}
                        onClick={() => { setSubTab(s); setSuccess(''); setError('') }}
                        className={`pb-5 text-[13px] font-bold transition-all relative ${subTab === s ? 'text-[#ed0000]' : 'text-[var(--text-muted)]'} ${s === 'delivery-zones' ? 'capitalize' : 'tracking-tight'}`}
                    >
                        {s === 'delivery-zones' ? 'delivery zones' : s} {s !== 'delivery-zones' ? 'details' : ''}
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
                ) : subTab === 'whatsapp' ? (
                    <div className="space-y-8">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">WhatsApp Number</label>
                            <input
                                type="tel"
                                value={whatsappDraft}
                                onChange={(e) => setWhatsAppDraft(e.target.value)}
                                className="w-full bg-transparent border-b-2 border-[var(--divider)] py-4 text-xl font-bold transition-all focus:border-[var(--brand-red)] text-[var(--text-primary)] outline-none"
                                placeholder="+234 909 805 0402"
                            />
                        </div>
                        <div className="flex gap-4 flex-wrap">
                            <button type="button" onClick={saveWhatsApp} disabled={loading} className="px-8 py-4 bg-[#0f2e53] text-white rounded-2xl font-bold text-[13px] shadow-2xl hover:bg-[#0a1f38] transition-all disabled:opacity-50">
                                {loading ? 'Saving…' : 'Save WhatsApp'}
                            </button>
                            <button type="button" onClick={removeWhatsApp} disabled={loading || !whatsappNumber} className="px-8 py-4 border border-[var(--divider)] rounded-2xl font-bold text-[13px] hover:border-[#ed0000] hover:text-[#ed0000] transition-all disabled:opacity-50">
                                Remove saved number
                            </button>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] font-medium">This number is used by the website WhatsApp contact links and customer communications.</p>
                    </div>
                ) : subTab === 'security' ? (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <SettingInput label="Current Password" name="currentPassword" type="password" value={security.currentPassword} onChange={handleSecurityChange} />
                            <SettingInput label="New Password" name="newPassword" type="password" value={security.newPassword} onChange={handleSecurityChange} />
                            <SettingInput label="Confirm Password" name="confirmPassword" type="password" value={security.confirmPassword} onChange={handleSecurityChange} />
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] font-medium">Minimum 8 characters. Current password is recommended for verification.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <p className="text-[13px] text-[var(--text-muted)]">Use the delivery zones section below to manage zones for Lagos delivery.</p>
                    </div>
                )}
                {['profile', 'whatsapp', 'security'].includes(subTab) && (
                    <div className="mt-14 pt-8 border-t border-[var(--divider)] flex justify-end">
                        <button type="submit" disabled={loading} className="px-12 py-4 bg-[#0f2e53] text-white rounded-2xl font-bold text-[13px] shadow-2xl hover:bg-[#0a1f38] transition-all active:scale-[0.98] disabled:opacity-50">
                            {loading ? 'Saving…' : subTab === 'whatsapp' ? 'Save WhatsApp' : 'Save changes'}
                        </button>
                    </div>
                )}
            </form>
            {subTab === 'delivery-zones' && (
                <div className="mt-12 bg-[var(--bg-secondary)] p-10 rounded-3xl border border-[var(--divider)] shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h3 className="text-xl font-bold">Delivery Zones</h3>
                            <p className="text-[13px] text-[var(--text-muted)]">Add, edit, or remove area-based delivery zones. Only Lagos state delivery is supported.</p>
                        </div>
                        <button type="button" onClick={() => { clearZoneForm(); setZoneMessage(''); setZoneError('') }} className="px-6 py-3 bg-[#ed0000] text-white rounded-2xl font-bold text-[13px] hover:bg-[#c60000] transition-all">
                            New delivery zone
                        </button>
                    </div>
                    <form onSubmit={handleZoneSubmit} className="grid grid-cols-1 md:grid-cols-[1.3fr_0.7fr_0.7fr] gap-6 mb-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Zone name</label>
                            <input value={zoneName} onChange={(e) => setZoneName(e.target.value)} className="w-full bg-transparent border-b-2 border-[var(--divider)] py-4 text-xl font-bold transition-all focus:border-[var(--brand-red)] text-[var(--text-primary)] outline-none" placeholder="e.g. Ikeja" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Delivery fee</label>
                            <input value={zoneFee} onChange={(e) => setZoneFee(e.target.value)} type="number" min="0" step="0.01" className="w-full bg-transparent border-b-2 border-[var(--divider)] py-4 text-xl font-bold transition-all focus:border-[var(--brand-red)] text-[var(--text-primary)] outline-none" placeholder="0" />
                        </div>
                        <div className="flex items-end gap-4">
                            <button type="submit" disabled={zoneActionLoading} className="w-full px-6 py-4 bg-[#0f2e53] text-white rounded-2xl font-bold text-[13px] hover:bg-[#0a1f38] transition-all disabled:opacity-50">
                                {zoneEditId ? 'Update zone' : 'Add zone'}
                            </button>
                            {zoneEditId && (
                                <button type="button" onClick={clearZoneForm} className="w-full px-6 py-4 border border-[var(--divider)] rounded-2xl font-bold text-[13px] hover:border-[#ed0000] hover:text-[#ed0000] transition-all">Cancel</button>
                            )}
                        </div>
                    </form>
                    {(zoneMessage || zoneError) && (
                        <div className={`p-4 rounded-2xl ${zoneError ? 'bg-red-50 text-[#ed0000]' : 'bg-emerald-50 text-emerald-700'}`}>
                            {zoneError || zoneMessage}
                        </div>
                    )}
                    <div className="overflow-hidden rounded-3xl border border-[var(--divider)]">
                        <div className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr] gap-0 bg-[var(--bg-primary)] px-6 py-4 text-[12px] uppercase tracking-[0.25em] text-[var(--text-muted)] font-black">
                            <span>Zone</span>
                            <span>Fee</span>
                            <span>Actions</span>
                            <span className="text-right">Delete</span>
                        </div>
                        <div className="divide-y divide-[var(--divider)]">
                            {zonesLoading ? (
                                <div className="p-6 text-center text-[13px] text-[var(--text-muted)]">Loading delivery zones…</div>
                            ) : zones.length === 0 ? (
                                <div className="p-6 text-center text-[13px] text-[var(--text-muted)]">No delivery zones configured.</div>
                            ) : zones.map((zone) => (
                                <div key={zone._id || zone.id} className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr] gap-0 items-center px-6 py-5 text-[14px] text-[var(--text-primary)]">
                                    <span className="font-bold">{zone.name}</span>
                                    <span>₦{Number(zone.fee).toLocaleString()}</span>
                                    <button type="button" onClick={() => handleZoneEdit(zone)} className="text-[#0f2e53] font-bold hover:text-[#ed0000] transition-colors">Edit</button>
                                    <button type="button" onClick={() => handleZoneDelete(zone._id || zone.id)} className="text-[#ed0000] font-bold hover:opacity-80 transition-opacity">Delete</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <AnimatePresence>
                {showZoneDeleteConfirm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] flex items-center justify-center p-6 backdrop-blur-sm bg-black/40 font-['Sen',sans-serif]">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-[var(--bg-tertiary)] rounded-2xl p-8 max-w-sm w-full shadow-2xl relative border border-[var(--divider)]">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-14 h-14 bg-red-50 text-[#ed0000] rounded-full flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#ed0000"><path d="M3 6h18v2H3V6zm2 3h14l-1.2 10.4A2 2 0 0 1 15.8 21H8.2a2 2 0 0 1-1.999-1.6L5 9zM9 11v7h2v-7H9zm4 0v7h2v-7h-2z"/></svg>
                                </div>
                                <h3 className="text-lg font-medium text-[var(--text-primary)]">Delete delivery zone</h3>
                                <p className="text-[13px] text-[var(--text-muted)] font-medium mt-2">Delete this delivery zone? This action cannot be undone.</p>
                                <div className="grid grid-cols-2 gap-3 w-full mt-8">
                                    <button onClick={() => setShowZoneDeleteConfirm(false)} className="py-3 rounded-xl border border-[var(--divider)] text-[var(--text-secondary)] font-medium text-[13px] hover:bg-slate-50 transition-all">Cancel</button>
                                    <button onClick={confirmZoneDelete} className="py-3 rounded-xl bg-[#ed0000] text-white font-medium text-[13px] shadow-lg shadow-red-200 hover:bg-red-700 transition-all">Delete</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {showZoneEditModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] flex items-center justify-center p-6 backdrop-blur-sm bg-black/40 font-['Sen',sans-serif]">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-[var(--bg-tertiary)] rounded-2xl p-8 max-w-md w-full shadow-2xl relative border border-[var(--divider)]">
                            <div className="flex flex-col text-center">
                                <h3 className="text-lg font-medium text-[var(--text-primary)]">Edit delivery zone</h3>
                                <p className="text-[13px] text-[var(--text-muted)] font-medium mt-2">Update the zone name and delivery fee.</p>
                                <div className="grid grid-cols-1 gap-4 mt-6">
                                    <input value={zoneName} onChange={(e) => setZoneName(e.target.value)} placeholder="Zone name" className="w-full bg-transparent border border-[var(--divider)] py-3 px-4 rounded-lg" />
                                    <input value={zoneFee} onChange={(e) => setZoneFee(e.target.value)} placeholder="Fee" type="number" min="0" step="0.01" className="w-full bg-transparent border border-[var(--divider)] py-3 px-4 rounded-lg" />
                                </div>
                                <div className="grid grid-cols-2 gap-3 w-full mt-6">
                                    <button onClick={() => { setShowZoneEditModal(false); clearZoneForm(); }} className="py-3 rounded-xl border border-[var(--divider)] text-[var(--text-secondary)] font-medium text-[13px] hover:bg-slate-50 transition-all">Cancel</button>
                                    <button onClick={handleZoneSubmit} className="py-3 rounded-xl bg-[#0f2e53] text-white font-medium text-[13px] shadow-lg hover:bg-[#0a1f38] transition-all">Save changes</button>
                                </div>
                                {zoneError && <div className="mt-4 text-sm text-[#ed0000]">{zoneError}</div>}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {showZoneSuccess && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] flex items-center justify-center p-6 backdrop-blur-sm bg-black/40 font-['Sen',sans-serif]">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-emerald-50 rounded-2xl p-8 max-w-sm w-full shadow-2xl relative border border-emerald-100 text-emerald-700">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#059669"><path d="M20.285 6.709l-11.025 11.025-5.545-5.546 1.414-1.414 4.131 4.132 9.611-9.611z"/></svg>
                                </div>
                                <h3 className="text-lg font-medium">Success</h3>
                                <p className="text-[13px] text-[var(--text-muted)] font-medium mt-2">{zoneSuccessMessage}</p>
                                <div className="mt-6">
                                    <button onClick={() => setShowZoneSuccess(false)} className="px-6 py-3 bg-[#0f2e53] text-white rounded-2xl">OK</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default SettingsTab
