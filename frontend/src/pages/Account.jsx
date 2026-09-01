import { Fragment, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { LogOut, Package, ShoppingBag, CheckCircle2, Clock, Settings, Repeat2, Star, Send } from 'lucide-react'
import { format } from 'date-fns'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { customerApi } from '../api/client'
import { useStore } from '../context/StoreContext'
import toast from 'react-hot-toast'
import EditProfilePanel from '../components/EditProfilePanel'

const STATUS_COLOR = {
    pending: 'bg-amber-50 text-amber-600 border-amber-200',
    paid: 'bg-blue-50 text-blue-600 border-blue-200',
    confirmed: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    shipped: 'bg-violet-50 text-violet-600 border-violet-200',
    delivered: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-50 text-red-600 border-red-200'
}

const fmt = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`

const MobileReviewControl = ({ order, item, reviewOpen, setReviewOpen, reviewDrafts, setReviewDrafts, submittedReviews, reviewSubmitting, handleSubmitReview }) => {
    const key = `${order.reference}:${item.productId}`
    const draft = reviewDrafts[key] || { rating: 0, comment: '' }

    if (submittedReviews[key]) {
        return <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Review submitted</span>
    }

    if (reviewOpen !== key) {
        return (
            <button type="button" onClick={() => setReviewOpen(key)} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#ed0000]">
                <Star size={14} /> Rate and review
            </button>
        )
    }

    return (
        <div className="w-full space-y-3 pt-3 mt-1 border-t border-[var(--divider)]">
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[var(--text-primary)]">Rate {item.name}</span>
                <button type="button" onClick={() => setReviewOpen(null)} className="text-[10px] font-bold text-[var(--text-muted)]">Cancel</button>
            </div>
            <div className="flex items-center gap-1" aria-label="Choose a rating">
                {[1, 2, 3, 4, 5].map(rating => (
                    <button key={rating} type="button" onClick={() => setReviewDrafts(prev => ({ ...prev, [key]: { ...draft, rating } }))} aria-label={`${rating} star${rating > 1 ? 's' : ''}`}>
                        <Star size={22} className={rating <= draft.rating ? 'text-amber-500 fill-amber-500' : 'text-[var(--text-muted)]'} />
                    </button>
                ))}
            </div>
            <textarea
                value={draft.comment}
                onChange={e => setReviewDrafts(prev => ({ ...prev, [key]: { ...draft, comment: e.target.value } }))}
                placeholder="Share your experience"
                rows="3"
                className="w-full resize-none px-3 py-2.5 rounded-xl border border-[var(--divider)] bg-[var(--bg-primary)] text-[12px] text-[var(--text-primary)] outline-none focus:border-[#ed0000]"
            />
            <button type="button" onClick={() => handleSubmitReview(order, item)} disabled={reviewSubmitting === key} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-[11px] font-bold disabled:opacity-50">
                <Send size={14} /> {reviewSubmitting === key ? 'Sending...' : 'Send review'}
            </button>
        </div>
    )
}

const Account = () => {
    const { customer, loading, signOut } = useCustomerAuth()
    const { addToCart, products } = useStore()
    const navigate = useNavigate()
    const [data, setData] = useState({ summary: null, orders: [] })
    const [ordersLoading, setOrdersLoading] = useState(true)
    const [error, setError] = useState('')
    const [editOpen, setEditOpen] = useState(false)
    const [reviewOpen, setReviewOpen] = useState(null)
    const [reviewDrafts, setReviewDrafts] = useState({})
    const [submittedReviews, setSubmittedReviews] = useState({})
    const [reviewSubmitting, setReviewSubmitting] = useState(null)

    useEffect(() => {
        if (!customer) return
        let cancelled = false
        setOrdersLoading(true)
        customerApi.myOrders()
            .then(res => { if (!cancelled && res.data?.success) setData({ summary: res.data.summary, orders: res.data.orders }) })
            .catch(err => { if (!cancelled) setError(err.response?.data?.message || 'Could not load your orders') })
            .finally(() => { if (!cancelled) setOrdersLoading(false) })
        return () => { cancelled = true }
    }, [customer])

    if (loading) return <div className="pt-48 pb-32 container max-w-3xl text-center text-[var(--text-muted)]">Loading…</div>
    if (!customer) return <Navigate to="/account/login" replace />

    const handleSignOut = () => { signOut(); navigate('/') }
    const handleRepeatOrder = (order) => {
        let added = 0
        let unavailable = 0
        ;(order.items || []).forEach(item => {
            const product = products.find(p => String(p.id || p._id) === String(item.productId))
            const stock = Number(product?.stockCount ?? 0)
            if (!product || product.status === 'out_of_stock' || stock === 0) {
                unavailable += 1
                return
            }
            addToCart(product, Math.min(Number(item.quantity) || 1, stock))
            added += 1
        })
        if (added) toast.success(`${added} ${added === 1 ? 'product' : 'products'} added to cart`)
        if (unavailable) toast.error(`${unavailable} product${unavailable === 1 ? '' : 's'} no longer available`)
    }

    const reviewKey = (order, item) => `${order.reference}:${item.productId}`
    const handleSubmitReview = async (order, item) => {
        const key = reviewKey(order, item)
        const draft = reviewDrafts[key] || {}
        if (!draft.rating) return toast.error('Please choose a rating first')
        setReviewSubmitting(key)
        try {
            await customerApi.createReview({
                productId: item.productId,
                orderReference: order.reference,
                rating: draft.rating,
                comment: draft.comment || ''
            })
            setSubmittedReviews(prev => ({ ...prev, [key]: true }))
            setReviewOpen(null)
            toast.success('Thank you for your review')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not submit your review')
        } finally {
            setReviewSubmitting(null)
        }
    }
    const summary = data.summary || { totalOrders: 0, ongoingOrders: 0, completedOrders: 0, totalSpend: 0 }

    return (
        <div className="pt-40 pb-24 container max-w-5xl font-['Sen',sans-serif]">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 pb-8 border-b border-[var(--divider)]">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ed0000]">My Account</span>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-3 text-[var(--text-primary)]">Hi, {customer.fullName?.split(' ')[0] || 'there'}</h1>
                    </div>
                    <div className="flex items-center gap-3 self-start md:self-auto">
                        <button onClick={() => setEditOpen(true)} className="inline-flex items-center gap-2 text-[12px] font-bold text-[var(--text-primary)] border border-[var(--divider)] hover:border-[#ed0000] hover:text-[#ed0000] px-4 py-2 rounded-xl transition-all">
                            <Settings size={14} /> Edit profile
                        </button>
                        <button onClick={handleSignOut} className="inline-flex items-center gap-2 text-[12px] font-bold text-[var(--text-muted)] hover:text-[#ed0000]">
                            <LogOut size={14} /> Sign out
                        </button>
                    </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <Stat icon={<ShoppingBag size={18} />} label="Total orders" value={summary.totalOrders} />
                    <Stat icon={<Clock size={18} />} label="Ongoing" value={summary.ongoingOrders} highlight={summary.ongoingOrders > 0} />
                    <Stat icon={<CheckCircle2 size={18} />} label="Completed" value={summary.completedOrders} />
                    <Stat icon={<Package size={18} />} label="Total spent" value={fmt(summary.totalSpend)} />
                </div>

                {/* Orders */}
                <div className="mb-6 flex items-end justify-between">
                    <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Your orders</h2>
                    <Link to="/shop" className="text-[12px] font-bold text-[#ed0000] hover:underline">Continue shopping →</Link>
                </div>

                {error && <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-[#ed0000] text-[13px] font-bold mb-4">{error}</div>}

                {ordersLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-2xl animate-pulse" />)}
                    </div>
                ) : data.orders.length === 0 ? (
                    <div className="bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-2xl p-12 text-center">
                        <Package size={32} className="mx-auto mb-4 text-[var(--text-muted)] opacity-50" />
                        <p className="text-[14px] font-bold text-[var(--text-primary)]">No orders yet</p>
                        <p className="text-[12px] text-[var(--text-muted)] mt-1 mb-6">When you place your first order it'll show up here.</p>
                        <Link to="/shop" className="inline-block px-6 py-3 rounded-xl bg-[#ed0000] text-white font-bold text-[12px] hover:bg-[#c80000]">Browse products</Link>
                    </div>
                ) : (
                    <div>
                        <div className="md:hidden space-y-4">
                            {data.orders.map(order => (
                                <article key={order.id || order._id} className="bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-2xl p-4 shadow-sm">
                                    <div className="flex items-start justify-between gap-3 pb-4 border-b border-[var(--divider)]">
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-black uppercase tracking-wider text-[var(--text-primary)] truncate">{order.reference}</p>
                                            <p className="text-[11px] text-[var(--text-muted)] mt-1">{format(new Date(order.date), 'MMM dd, yyyy')} · {(order.items || []).reduce((n, item) => n + (item.quantity || 1), 0)} units</p>
                                        </div>
                                        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[9px] font-bold border ${STATUS_COLOR[order.status] || STATUS_COLOR.pending}`}>
                                            {(order.status || 'pending').toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex items-end justify-between gap-3 py-4">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-muted)]">Order total</p>
                                            <p className="text-xl font-black text-[var(--text-primary)] mt-1">{fmt(order.amount)}</p>
                                        </div>
                                        <button onClick={() => handleRepeatOrder(order)} className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#ed0000] text-white text-[10px] font-bold">
                                            <Repeat2 size={14} /> Repeat order
                                        </button>
                                    </div>
                                    <div className="space-y-3 pt-3 border-t border-[var(--divider)]">
                                        {(order.items || []).map(item => (
                                            <div key={`${order.reference}:${item.productId}`} className="rounded-xl bg-[var(--bg-tertiary)] p-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-[11px] font-bold leading-snug text-[var(--text-primary)]">{item.name}</span>
                                                    <span className="shrink-0 text-[10px] font-bold text-[var(--text-muted)]">x{item.quantity || 1}</span>
                                                </div>
                                                {['delivered', 'completed'].includes(order.status) && (
                                                    <div className="mt-2">
                                                        <MobileReviewControl order={order} item={item} reviewOpen={reviewOpen} setReviewOpen={setReviewOpen} reviewDrafts={reviewDrafts} setReviewDrafts={setReviewDrafts} submittedReviews={submittedReviews} reviewSubmitting={reviewSubmitting} handleSubmitReview={handleSubmitReview} />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </article>
                            ))}
                        </div>
                        <div className="hidden md:block bg-[var(--bg-secondary)] border border-[var(--divider)] rounded-2xl overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left">
                            <thead className="bg-[var(--bg-tertiary)] border-b border-[var(--divider)]">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Reference</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Items</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] text-right">Amount</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] text-right">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--divider)]">
                                {data.orders.map(o => (<Fragment key={o.id || o._id}>
                                    <tr className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                                        <td className="px-6 py-4 text-[12px] font-bold text-[var(--text-primary)]">{o.reference}</td>
                                        <td className="px-6 py-4 text-[12px] font-medium text-[var(--text-muted)]">{(o.items || []).reduce((n, it) => n + (it.quantity || 1), 0)} units</td>
                                        <td className="px-6 py-4 text-[12px] font-medium text-[var(--text-muted)]">{format(new Date(o.date), 'MMM dd, yyyy')}</td>
                                        <td className="px-6 py-4 text-[13px] font-bold text-right text-[var(--text-primary)]">{fmt(o.amount)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${STATUS_COLOR[o.status] || STATUS_COLOR.pending}`}>
                                                {(o.status || 'pending').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleRepeatOrder(o)}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#ed0000] text-white text-[10px] font-bold hover:bg-[#c80000] transition-colors whitespace-nowrap"
                                            >
                                                <Repeat2 size={13} /> Repeat order
                                            </button>
                                        </td>
                                    </tr>
                                    {['delivered', 'completed'].includes(o.status) && (o.items || []).map(item => {
                                        const key = reviewKey(o, item)
                                        const draft = reviewDrafts[key] || { rating: 0, comment: '' }
                                        return (
                                            <tr key={key} className="bg-[var(--bg-tertiary)]/40">
                                                <td colSpan="6" className="px-6 py-3">
                                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                                        <span className="text-[11px] font-bold text-[var(--text-primary)]">{item.name}</span>
                                                        {submittedReviews[key] ? (
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Review submitted</span>
                                                        ) : reviewOpen === key ? (
                                                            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                                                                <div className="flex items-center gap-0.5" aria-label="Choose a rating">
                                                                    {[1, 2, 3, 4, 5].map(rating => (
                                                                        <button key={rating} type="button" onClick={() => setReviewDrafts(prev => ({ ...prev, [key]: { ...draft, rating } }))} aria-label={`${rating} star${rating > 1 ? 's' : ''}`}>
                                                                            <Star size={18} className={rating <= draft.rating ? 'text-amber-500 fill-amber-500' : 'text-[var(--text-muted)]'} />
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                                <input
                                                                    value={draft.comment}
                                                                    onChange={e => setReviewDrafts(prev => ({ ...prev, [key]: { ...draft, comment: e.target.value } }))}
                                                                    placeholder="Share your experience"
                                                                    className="flex-1 min-w-[180px] px-3 py-2 rounded-lg border border-[var(--divider)] bg-[var(--bg-primary)] text-[11px] text-[var(--text-primary)] outline-none focus:border-[#ed0000]"
                                                                />
                                                                <button type="button" onClick={() => handleSubmitReview(o, item)} disabled={reviewSubmitting === key} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--text-primary)] text-[var(--bg-primary)] text-[10px] font-bold disabled:opacity-50">
                                                                    <Send size={13} /> {reviewSubmitting === key ? 'Sending...' : 'Send review'}
                                                                </button>
                                                                <button type="button" onClick={() => setReviewOpen(null)} className="text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)]">Cancel</button>
                                                            </div>
                                                        ) : (
                                                            <button type="button" onClick={() => setReviewOpen(key)} className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#ed0000] hover:underline">
                                                                <Star size={13} /> Rate and review
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </Fragment>))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                )}
            </motion.div>

            <EditProfilePanel open={editOpen} onClose={() => setEditOpen(false)} />
        </div>
    )
}

const Stat = ({ icon, label, value, highlight }) => (
    <div className={`p-5 rounded-2xl border ${highlight ? 'bg-[#ed0000]/5 border-[#ed0000]/20' : 'bg-[var(--bg-secondary)] border-[var(--divider)]'}`}>
        <div className={`mb-3 ${highlight ? 'text-[#ed0000]' : 'text-[var(--text-muted)]'}`}>{icon}</div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{label}</p>
        <p className="text-2xl font-bold tracking-tight mt-1 text-[var(--text-primary)]">{value}</p>
    </div>
)

export default Account
