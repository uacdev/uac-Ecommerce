import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { X, Mail, Phone, MapPin, Package, Truck, CreditCard, CheckCircle2, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { useStore } from '../../../context/StoreContext'
import { deliveryApi } from '../../../api/client'

const STATUSES = ['pending', 'paid', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled']
const STATUS_COLOR = {
    pending: 'bg-amber-50 text-amber-600 border-amber-200',
    paid: 'bg-blue-50 text-blue-600 border-blue-200',
    confirmed: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    shipped: 'bg-violet-50 text-violet-600 border-violet-200',
    delivered: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-50 text-red-600 border-red-200'
}

const DELIVERY_METHODS = [
    { value: 'pending', label: 'Pending — not yet assigned' },
    { value: 'assisted', label: 'Assisted — platform handles logistics' },
    { value: 'self', label: 'Self-arranged — buyer pickup or own rider' }
]

const fmt = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`

const OrderInfoModal = ({ order: incomingOrder, onClose }) => {
    const { updateOrderStatus, updateOrderDelivery, removeOrder } = useStore()
    // Local copy so save responses can refresh the displayed order without waiting on parent re-render.
    const [order, setOrder] = useState(incomingOrder)
    const [zones, setZones] = useState([])
    const [savingStatus, setSavingStatus] = useState(false)
    const [savingDelivery, setSavingDelivery] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [error, setError] = useState('')
    const [toast, setToast] = useState('')

    const [statusDraft, setStatusDraft] = useState(incomingOrder.status || 'pending')
    const [methodDraft, setMethodDraft] = useState(incomingOrder.deliveryMethod || 'pending')
    const [zoneDraft, setZoneDraft] = useState(incomingOrder.deliveryZone || '')
    const [partnerDraft, setPartnerDraft] = useState(incomingOrder.logisticsPartner || '')

    useEffect(() => {
        deliveryApi.getZones().then(res => setZones(res.data?.data || [])).catch(() => {})
    }, [])

    // Resync when parent passes a different order in (e.g. global search → goOrder)
    useEffect(() => {
        setOrder(incomingOrder)
        setStatusDraft(incomingOrder.status || 'pending')
        setMethodDraft(incomingOrder.deliveryMethod || 'pending')
        setZoneDraft(incomingOrder.deliveryZone || '')
        setPartnerDraft(incomingOrder.logisticsPartner || '')
    }, [incomingOrder])

    const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200) }

    const handleSaveStatus = async () => {
        if (statusDraft === order.status) return
        setSavingStatus(true); setError('')
        const res = await updateOrderStatus(order.id || order._id, statusDraft)
        setSavingStatus(false)
        if (res?.success) {
            if (res.data) setOrder(res.data)
            flash('Status updated')
        } else {
            setError(res?.message || 'Could not update status')
        }
    }

    const handleSaveDelivery = async () => {
        setSavingDelivery(true); setError('')
        const res = await updateOrderDelivery(order.id || order._id, methodDraft, zoneDraft, partnerDraft)
        setSavingDelivery(false)
        if (res?.success) {
            if (res.data) setOrder(res.data)
            flash('Delivery updated')
        } else {
            setError(res?.message || 'Could not update delivery')
        }
    }

    const handleDelete = async () => {
        if (!confirmDelete) { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 4000); return }
        setDeleting(true); setError('')
        const res = await removeOrder(order.id || order._id)
        setDeleting(false)
        if (res?.success) onClose()
        else { setError(res?.message || 'Could not delete order'); setConfirmDelete(false) }
    }

    const items = order.items || []
    const itemsCount = items.reduce((n, it) => n + (it.quantity || 1), 0)

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 backdrop-blur-md bg-black/50 font-['Sen',sans-serif]"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.96, y: 20 }} animate={{ scale: 1, y: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[var(--bg-tertiary)] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-[var(--divider)] no-scrollbar"
            >
                <div className="sticky top-0 z-10 flex items-start justify-between p-8 pb-6 border-b border-[var(--divider)] bg-[var(--bg-tertiary)]">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">Order reference</p>
                        <h3 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight mt-1">{order.reference || `#${(order.id || '').slice(-8)}`}</h3>
                        {order.date && <p className="text-[11px] text-[var(--text-muted)] font-medium mt-1">{format(new Date(order.date), 'MMM dd, yyyy · HH:mm')}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold border ${STATUS_COLOR[order.status] || STATUS_COLOR.pending}`}>
                            {(order.status || 'pending').toUpperCase()}
                        </span>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] transition-all">
                            <X size={22} />
                        </button>
                    </div>
                </div>

                {toast && (
                    <div className="mx-8 mt-6 -mb-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[12px] font-bold flex items-center gap-2">
                        <CheckCircle2 size={14} /> {toast}
                    </div>
                )}
                {error && (
                    <div className="mx-8 mt-6 -mb-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-[#ed0000] text-[12px] font-bold">
                        {error}
                    </div>
                )}

                <div className="p-8 space-y-10">
                    {/* CUSTOMER + DELIVERY ADDRESS */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--text-muted)]">Customer</p>
                            <p className="text-[15px] font-bold text-[var(--text-primary)]">{order.buyerName}</p>
                            <a href={`mailto:${order.buyerEmail}`} className="flex items-center gap-2 text-[12px] text-[var(--text-muted)] hover:text-[#ed0000]"><Mail size={13} /> {order.buyerEmail}</a>
                            <a href={`tel:${order.buyerPhone}`} className="flex items-center gap-2 text-[12px] text-[var(--text-muted)] hover:text-[#ed0000]"><Phone size={13} /> {order.buyerPhone}</a>
                        </div>
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--text-muted)]">Delivery</p>
                            <p className="flex items-start gap-2 text-[13px] text-[var(--text-primary)] font-medium leading-relaxed">
                                <MapPin size={14} className="mt-0.5 shrink-0 text-[var(--text-muted)]" />
                                <span>{order.buyerAddress}</span>
                            </p>
                            {order.deliveryZone && (
                                <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                                    Zone · {order.deliveryZone}
                                </p>
                            )}
                            {order.fulfillmentType === 'pickup' && order.pickupCode && (
                                <p className="text-[11px] font-bold text-[#ed0000]">Pickup code · {order.pickupCode}</p>
                            )}
                        </div>
                    </section>

                    {/* ITEMS */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--text-muted)] flex items-center gap-2">
                                <Package size={12} /> Items
                            </p>
                            <span className="text-[11px] font-bold text-[var(--text-muted)]">{itemsCount} {itemsCount === 1 ? 'unit' : 'units'}</span>
                        </div>
                        <div className="border border-[var(--divider)] rounded-2xl divide-y divide-[var(--divider)] overflow-hidden">
                            {items.length === 0 && (
                                <div className="p-5 text-[12px] text-[var(--text-muted)] text-center">No items recorded.</div>
                            )}
                            {items.map((it, i) => (
                                <div key={i} className="flex items-center gap-4 p-4">
                                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-[var(--divider)] shrink-0">
                                        {it.image && <img src={it.image} alt={it.name} className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-bold text-[var(--text-primary)] truncate">{it.name}</p>
                                        <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">{fmt(it.price)} × {it.quantity}</p>
                                    </div>
                                    <p className="text-[13px] font-bold text-[var(--text-primary)]">{fmt((it.price || 0) * (it.quantity || 1))}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* FINANCIAL BREAKDOWN */}
                    <section>
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--text-muted)] mb-4 flex items-center gap-2">
                            <CreditCard size={12} /> Breakdown
                        </p>
                        <div className="bg-[var(--bg-secondary)] rounded-2xl p-5 space-y-2.5 text-[13px]">
                            <div className="flex justify-between"><span className="text-[var(--text-muted)] font-medium">Items subtotal</span><span className="font-bold text-[var(--text-primary)]">{fmt(order.productAmount)}</span></div>
                            <div className="flex justify-between"><span className="text-[var(--text-muted)] font-medium">Delivery {order.deliveryZone && <span className="opacity-60">· {order.deliveryZone}</span>}</span><span className="font-bold text-[var(--text-primary)]">{fmt(order.deliveryFee)}</span></div>
                            {order.commission ? <div className="flex justify-between text-[11px] opacity-70"><span className="text-[var(--text-muted)]">Platform commission (10%)</span><span className="text-[var(--text-muted)]">{fmt(order.commission)}</span></div> : null}
                            <div className="flex justify-between pt-3 mt-2 border-t border-[var(--divider)]">
                                <span className="font-bold text-[var(--text-primary)]">Total paid</span>
                                <span className="text-2xl font-bold text-[#ed0000] tracking-tight">{fmt(order.amount)}</span>
                            </div>
                            {order.paymentMethod && <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] pt-2">via {order.paymentMethod}</p>}
                        </div>
                    </section>

                    {/* ADMIN CONTROLS */}
                    <section className="space-y-6 pt-4 border-t border-[var(--divider)]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--text-muted)]">Admin actions</p>

                        {/* STATUS */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Order status</label>
                                <select
                                    value={statusDraft}
                                    onChange={(e) => setStatusDraft(e.target.value)}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-xl px-4 py-3 text-[13px] font-bold text-[var(--text-primary)] outline-none focus:border-[#ed0000]/50"
                                >
                                    {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                </select>
                            </div>
                            <button
                                onClick={handleSaveStatus}
                                disabled={savingStatus || statusDraft === order.status}
                                className="px-5 py-3 bg-black text-white rounded-xl font-bold text-[12px] hover:bg-[#ed0000] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {savingStatus ? 'Saving…' : 'Update status'}
                            </button>
                        </div>

                        {/* DELIVERY */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2"><Truck size={12} /> Delivery</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <select
                                    value={methodDraft}
                                    onChange={(e) => setMethodDraft(e.target.value)}
                                    className="bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-xl px-4 py-3 text-[13px] font-bold text-[var(--text-primary)] outline-none focus:border-[#ed0000]/50"
                                >
                                    {DELIVERY_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </select>
                                <select
                                    value={zoneDraft}
                                    onChange={(e) => setZoneDraft(e.target.value)}
                                    className="bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-xl px-4 py-3 text-[13px] font-bold text-[var(--text-primary)] outline-none focus:border-[#ed0000]/50"
                                >
                                    <option value="">— No zone —</option>
                                    {zones.map(z => <option key={z.name} value={z.name}>{z.name} · {fmt(z.fee)}</option>)}
                                </select>
                                <input
                                    type="text"
                                    value={partnerDraft}
                                    onChange={(e) => setPartnerDraft(e.target.value)}
                                    placeholder="Logistics partner (optional)"
                                    className="bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-xl px-4 py-3 text-[13px] font-medium text-[var(--text-primary)] outline-none focus:border-[#ed0000]/50"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={handleSaveDelivery}
                                    disabled={savingDelivery}
                                    className="px-5 py-3 bg-black text-white rounded-xl font-bold text-[12px] hover:bg-[#ed0000] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {savingDelivery ? 'Saving…' : 'Update delivery'}
                                </button>
                            </div>
                            <p className="text-[10px] text-[var(--text-muted)] font-medium leading-relaxed">
                                Changing the zone recomputes the delivery fee + total automatically.
                            </p>
                        </div>

                        {/* DANGER ZONE */}
                        <div className="pt-6 border-t border-[var(--divider)] flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Danger zone</p>
                                <p className="text-[11px] text-[var(--text-muted)] font-medium mt-1">
                                    Deleting an order is permanent and removes it from KPIs and customer history.
                                </p>
                            </div>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[12px] transition-all disabled:opacity-50 ${
                                    confirmDelete
                                        ? 'bg-[#ed0000] text-white hover:bg-[#c90000]'
                                        : 'border border-red-200 dark:border-red-900/40 text-[#ed0000] hover:bg-red-50 dark:hover:bg-red-950/20'
                                }`}
                            >
                                <Trash2 size={14} />
                                {deleting ? 'Deleting…' : (confirmDelete ? 'Click again to confirm' : 'Delete order')}
                            </button>
                        </div>
                    </section>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default OrderInfoModal
