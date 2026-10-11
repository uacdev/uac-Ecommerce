import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { LogOut, Package, ShoppingBag, CheckCircle2, Clock, Settings, Repeat2, Star, Send, CreditCard, Loader2, ArrowUpRight, UserRound } from 'lucide-react'
import { format } from 'date-fns'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { customerApi, paymentApi } from '../api/client'
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
const fmtCompact = (n) => `₦${new Intl.NumberFormat('en-NG', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(n || 0))}`
const formatOrderStatus = (status) => status === 'pending'
    ? 'Awaiting payment'
    : (status || 'pending').replace(/^./, firstLetter => firstLetter.toUpperCase())

const OrderReviewControl = ({ order, item, reviewOpen, setReviewOpen, reviewDrafts, setReviewDrafts, submittedReviews, reviewSubmitting, handleSubmitReview }) => {
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
    const [paymentRetrying, setPaymentRetrying] = useState(null)

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

    const handleContinuePayment = async (order) => {
        setPaymentRetrying(order.reference)
        try {
            const items = order.items || []
            const { data: payment } = await paymentApi.initiate({
                reference: order.reference,
                amount: order.amount,
                buyerName: order.buyerName,
                buyerEmail: order.buyerEmail,
                buyerPhone: order.buyerPhone,
                productName: items.length === 1 ? items[0].name : `Cart (${items.length} items)`
            })
            if (!payment?.cashierUrl) throw new Error('No payment link returned')
            window.location.href = payment.cashierUrl
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not continue payment. Please try again.')
            setPaymentRetrying(null)
        }
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
        <div className="pt-28 pb-28 md:pt-40 md:pb-24 container max-w-5xl font-['Sen',sans-serif]">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <header className="flex flex-col gap-5 border-b border-[var(--divider)] pb-6 sm:flex-row sm:items-center sm:justify-between md:pb-8">
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-red)] text-white sm:h-14 sm:w-14">
                            <UserRound size={24} />
                        </div>
                        <div className="min-w-0">
                            <span className="block text-[9px] font-black uppercase tracking-[0.24em] text-[var(--brand-red)] sm:text-[10px] sm:tracking-[0.35em]">Customer dashboard</span>
                            <h1 className="mt-1 truncate text-2xl font-black tracking-tight text-[var(--text-primary)] sm:text-3xl md:text-4xl">
                                Welcome, {customer.fullName?.split(' ')[0] || 'there'}
                            </h1>
                            <p className="mt-0.5 truncate text-xs text-[var(--text-muted)] sm:text-sm">{customer.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:shrink-0">
                        <button onClick={() => setEditOpen(true)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[var(--divider)] px-3 text-xs font-bold text-[var(--text-primary)] transition-colors hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] sm:px-4">
                            <Settings size={15} /> Edit profile
                        </button>
                        <button onClick={handleSignOut} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] sm:px-4">
                            <LogOut size={15} /> Sign out
                        </button>
                    </div>
                </header>

                <section aria-label="Account overview" className="mt-5 grid grid-cols-4 gap-2 sm:mt-7 sm:gap-3">
                    <Stat icon={<ShoppingBag size={18} />} label="Total orders" mobileLabel="Orders" value={summary.totalOrders} />
                    <Stat icon={<Clock size={18} />} label="Ongoing" mobileLabel="Active" value={summary.ongoingOrders} highlight={summary.ongoingOrders > 0} />
                    <Stat icon={<CheckCircle2 size={18} />} label="Completed" mobileLabel="Done" value={summary.completedOrders} />
                    <Stat icon={<Package size={18} />} label="Total spent" mobileLabel="Spent" value={fmt(summary.totalSpend)} mobileValue={fmtCompact(summary.totalSpend)} />
                </section>

                <section className="mt-10 md:mt-14">
                    <div className="mb-4 flex items-end justify-between gap-3 sm:mb-5">
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)]">Your account</span>
                            <h2 className="mt-1 text-xl font-black tracking-tight text-[var(--text-primary)] sm:text-2xl">Order history</h2>
                        </div>
                        <Link to="/shop" className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-[var(--brand-red)] hover:underline sm:text-xs">
                            Shop products <ArrowUpRight size={14} />
                        </Link>
                    </div>

                    {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] font-bold text-[#ed0000] dark:border-red-900 dark:bg-red-950/30">{error}</div>}

                    {ordersLoading ? (
                        <div className="space-y-3" aria-label="Loading orders">
                            {[1, 2].map(index => <div key={index} className="h-32 animate-pulse rounded-2xl border border-[var(--divider)] bg-[var(--bg-secondary)]" />)}
                        </div>
                    ) : data.orders.length === 0 ? (
                        <div className="flex flex-col items-center rounded-2xl border border-dashed border-[var(--divider)] bg-[var(--bg-secondary)] px-5 py-10 text-center sm:py-14">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
                                <Package size={22} />
                            </div>
                            <h3 className="text-base font-bold text-[var(--text-primary)]">No orders yet</h3>
                            <p className="mt-1 max-w-xs text-xs leading-relaxed text-[var(--text-muted)] sm:text-sm">Your purchases and payment updates will appear here.</p>
                            <Link to="/shop" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--brand-red)] px-5 text-xs font-bold text-white transition-opacity hover:opacity-90">
                                Browse products <ArrowUpRight size={15} />
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            {data.orders.map(order => {
                                const itemCount = (order.items || []).reduce((count, item) => count + (item.quantity || 1), 0)
                                return (
                                    <article key={order.id || order._id} className="overflow-hidden rounded-2xl border border-[var(--divider)] bg-[var(--bg-secondary)]">
                                        <div className="flex items-start justify-between gap-3 border-b border-[var(--divider)] p-4 sm:px-5 sm:py-4">
                                            <div className="min-w-0">
                                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] sm:text-[9px]">Order reference</span>
                                                <h3 className="mt-0.5 truncate text-xs font-black tracking-wide text-[var(--text-primary)] sm:text-sm">{order.reference}</h3>
                                                <p className="mt-1 text-[10px] text-[var(--text-muted)] sm:text-[11px]">
                                                    {format(new Date(order.date), 'MMM dd, yyyy')} <span aria-hidden="true">·</span> {itemCount} {itemCount === 1 ? 'item' : 'items'}
                                                </p>
                                            </div>
                                            <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold sm:text-[10px] ${STATUS_COLOR[order.status] || STATUS_COLOR.pending}`}>
                                                {formatOrderStatus(order.status)}
                                            </span>
                                        </div>

                                        <div className="grid lg:grid-cols-[minmax(0,1fr)_13rem]">
                                            <div className="divide-y divide-[var(--divider)] px-4 sm:px-5">
                                                {(order.items || []).map(item => {
                                                    const key = reviewKey(order, item)
                                                    return (
                                                        <div key={key} className="flex items-start justify-between gap-3 py-3 sm:py-4">
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-bold leading-snug text-[var(--text-primary)] sm:text-sm">{item.name}</p>
                                                                <p className="mt-1 text-[10px] text-[var(--text-muted)] sm:text-[11px]">Qty {item.quantity || 1} <span aria-hidden="true">·</span> {fmt(item.price)} each</p>
                                                                {['delivered', 'completed'].includes(order.status) && (
                                                                    <div className="mt-2">
                                                                        <OrderReviewControl order={order} item={item} reviewOpen={reviewOpen} setReviewOpen={setReviewOpen} reviewDrafts={reviewDrafts} setReviewDrafts={setReviewDrafts} submittedReviews={submittedReviews} reviewSubmitting={reviewSubmitting} handleSubmitReview={handleSubmitReview} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="shrink-0 text-xs font-bold text-[var(--text-primary)] sm:text-sm">{fmt(item.price * (item.quantity || 1))}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>

                                            <div className="flex items-center justify-between gap-3 border-t border-[var(--divider)] bg-[var(--bg-tertiary)]/50 p-4 sm:px-5 lg:flex-col lg:items-stretch lg:justify-center lg:border-l lg:border-t-0">
                                                <div className="shrink-0">
                                                    <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Order total</p>
                                                    <p className="mt-0.5 text-lg font-black text-[var(--text-primary)] sm:text-xl">{fmt(order.amount)}</p>
                                                </div>
                                                {order.status === 'pending' ? (
                                                    <button onClick={() => handleContinuePayment(order)} disabled={paymentRetrying === order.reference} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-[var(--brand-red)] px-3 text-[10px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 sm:px-4 sm:text-[11px] lg:mt-3">
                                                        {paymentRetrying === order.reference ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                                                        {paymentRetrying === order.reference ? 'Opening…' : 'Continue payment'}
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleRepeatOrder(order)} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--divider)] px-3 text-[10px] font-bold text-[var(--text-primary)] transition-colors hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] sm:px-4 sm:text-[11px] lg:mt-3">
                                                        <Repeat2 size={14} /> Repeat order
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    )}
                </section>
            </motion.div>

            <EditProfilePanel open={editOpen} onClose={() => setEditOpen(false)} />
        </div>
    )
}

const Stat = ({ icon, label, mobileLabel, value, mobileValue, highlight }) => (
    <div className={`min-w-0 p-2 sm:p-5 rounded-xl sm:rounded-2xl border ${highlight ? 'bg-[#ed0000]/5 border-[#ed0000]/20' : 'bg-[var(--bg-secondary)] border-[var(--divider)]'}`}>
        <div className={`mb-1 sm:mb-3 [&>svg]:h-3.5 [&>svg]:w-3.5 sm:[&>svg]:h-[18px] sm:[&>svg]:w-[18px] ${highlight ? 'text-[#ed0000]' : 'text-[var(--text-muted)]'}`}>{icon}</div>
        <p className="text-[8px] leading-tight sm:text-[10px] font-bold uppercase tracking-tight sm:tracking-widest text-[var(--text-muted)]">
            <span className="sm:hidden">{mobileLabel || label}</span>
            <span className="hidden sm:inline">{label}</span>
        </p>
        <p className="text-xs sm:text-2xl font-bold tracking-tight mt-1 text-[var(--text-primary)] truncate">
            {mobileValue ? <><span className="sm:hidden">{mobileValue}</span><span className="hidden sm:inline">{value}</span></> : value}
        </p>
    </div>
)

export default Account
