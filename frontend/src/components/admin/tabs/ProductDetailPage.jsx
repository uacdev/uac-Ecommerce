import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Package, ShoppingBag, Users, TrendingUp, Star, Bell, Edit3, Trash2, Mail, Calendar, Boxes } from 'lucide-react'
import { format } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { productApi } from '../../../api/client'
import { SkeletonDetailHero, SkeletonTwoCol, SkeletonTableRows } from '../ui/Skeleton'

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

const ProductDetailPage = ({ productId, onBack, onEdit, onDelete }) => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const refresh = () => {
        setLoading(true); setError('')
        productApi.getStats(productId)
            .then(res => { if (res.data?.success) setData(res.data.data) })
            .catch(err => setError(err.response?.data?.message || 'Could not load product stats'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { refresh() /* eslint-disable-next-line */ }, [productId])

    if (loading) return (
        <div className="space-y-8">
            <SkeletonDetailHero />
            <SkeletonTwoCol />
            <SkeletonTableRows rows={4} cols={5} />
        </div>
    )
    if (error) return (
        <div className="space-y-4">
            <button onClick={onBack} className="flex items-center gap-2 text-[12px] font-bold text-[var(--text-muted)] hover:text-[#ed0000]"><ChevronLeft size={16} /> Back to products</button>
            <div className="px-4 py-3 rounded-xl bg-red-50 text-[#ed0000] text-[12px] font-bold">{error}</div>
        </div>
    )
    if (!data) return null

    const { product, sales, chart, recentOrders, topBuyers, reviews, pendingRestockSubscribers } = data

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-20"
        >
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <button onClick={onBack} className="flex items-center gap-2 text-[12px] font-bold text-[var(--text-muted)] hover:text-[#ed0000]">
                    <ChevronLeft size={16} /> Back to products
                </button>
                <div className="flex items-center gap-2">
                    <button onClick={() => onEdit(product)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-[12px] font-bold hover:bg-[#ed0000] transition-all">
                        <Edit3 size={14} /> Edit (incl. stock)
                    </button>
                    <button onClick={() => onDelete(product)} className="p-2.5 rounded-xl border border-red-200 text-[#ed0000] hover:bg-red-50 dark:hover:bg-red-950/20 transition-all">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Product hero */}
            <div className="bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-3xl shadow-sm overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                    <div className="aspect-square md:aspect-auto bg-[var(--bg-secondary)] flex items-center justify-center p-8">
                        {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-contain" /> : <span className="text-[10px] font-bold text-[var(--text-muted)]">No image</span>}
                    </div>
                    <div className="md:col-span-2 p-8 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">{product.brand || product.category}</span>
                                {product.status === 'out_of_stock' ? (
                                    <span className="px-2 py-0.5 rounded-full bg-[#ed0000] text-white text-[9px] font-bold uppercase tracking-widest">Out of stock</span>
                                ) : (product.stockCount ?? 0) <= 5 && (product.stockCount ?? 0) > 0 ? (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold uppercase tracking-widest">Low stock · {product.stockCount} left</span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold uppercase tracking-widest">{product.stockCount} in stock</span>
                                )}
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">{product.name}</h1>
                            {product.description && <p className="text-[13px] text-[var(--text-muted)] font-medium mt-3 leading-relaxed">{product.description}</p>}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-6 pt-6 border-t border-[var(--divider)]">
                            <Detail label="Price" value={fmt(product.price)} accent />
                            <Detail label="Category" value={product.category} />
                            <Detail label="Location" value={product.location || '—'} />
                            <Detail label="Packaging" value={product.packaging || '—'} />
                            <Detail label="Pieces / pack" value={product.piecesPerPack != null ? String(product.piecesPerPack) : '—'} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
                <StatCard
                    icon={<Boxes size={18} />}
                    label="In stock"
                    value={(product.stockCount ?? 0).toLocaleString()}
                    sub={product.status === 'out_of_stock' ? 'Auto-marked out' : (product.stockCount ?? 0) <= 5 ? 'Running low' : 'Healthy'}
                    highlight={product.status === 'out_of_stock'}
                />
                <StatCard icon={<ShoppingBag size={18} />} label="Units sold" value={(sales.soldUnits || 0).toLocaleString()} sub="Paid orders only" />
                <StatCard icon={<TrendingUp size={18} />} label="Revenue" value={fmt(sales.revenue)} sub={`from ${sales.orderCount} order${sales.orderCount === 1 ? '' : 's'}`} />
                <StatCard icon={<Users size={18} />} label="Unique buyers" value={(sales.uniqueBuyers || 0).toLocaleString()} sub="Distinct emails" />
                <StatCard
                    icon={<Bell size={18} />}
                    label="Restock waitlist"
                    value={(pendingRestockSubscribers || 0).toLocaleString()}
                    sub={pendingRestockSubscribers > 0 ? 'Subscribers waiting' : 'No one waiting'}
                    highlight={product.status === 'out_of_stock' && pendingRestockSubscribers > 0}
                />
            </div>

            {/* Chart */}
            <div className="bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">Sales trend</h3>
                    <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Last 12 months</p>
                </div>
                <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="prodChartGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ed0000" stopOpacity={0.85} />
                                    <stop offset="95%" stopColor="#ed0000" stopOpacity={0.15} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--divider)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--text-muted)' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--text-muted)' }} />
                            <Tooltip
                                cursor={{ fill: 'rgba(237,0,0,0.05)' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--bg-tertiary)', fontSize: '11px', fontWeight: 700, boxShadow: '0 12px 32px rgba(0,0,0,0.18)' }}
                                formatter={(v, k) => k === 'units' ? [`${v} units`, 'Units sold'] : [fmt(v), 'Revenue']}
                            />
                            <Bar dataKey="units" fill="url(#prodChartGrad)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top buyers + Reviews */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Top buyers</h3>
                    {topBuyers.length === 0 ? (
                        <p className="text-[12px] text-[var(--text-muted)] font-medium py-6 text-center">No paid orders yet for this product.</p>
                    ) : (
                        <div className="space-y-3">
                            {topBuyers.map(b => (
                                <div key={b.email} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-full bg-[var(--bg-secondary)] border border-[var(--divider)] flex items-center justify-center text-[10px] font-bold text-[var(--text-muted)] shrink-0">
                                            {(b.name || '?').charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[13px] font-bold text-[var(--text-primary)] truncate">{b.name}</p>
                                            <p className="text-[10px] text-[var(--text-muted)] font-medium truncate">{b.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 ml-3">
                                        <p className="text-[12px] font-bold text-[var(--text-primary)]">{b.units} units</p>
                                        <p className="text-[10px] text-[var(--text-muted)] font-medium">{fmt(b.spend)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">Reviews</h3>
                        <div className="flex items-center gap-2 text-amber-500">
                            <Star size={14} fill="currentColor" />
                            <span className="text-[14px] font-bold">{reviews.avgRating || '—'}</span>
                            <span className="text-[11px] font-bold text-[var(--text-muted)]">/ 5 · {reviews.count} review{reviews.count === 1 ? '' : 's'}</span>
                        </div>
                    </div>
                    {reviews.recent.length === 0 ? (
                        <p className="text-[12px] text-[var(--text-muted)] font-medium py-6 text-center">No reviews yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {reviews.recent.map(r => (
                                <div key={r.id || r._id} className="border-b border-[var(--divider)] last:border-0 pb-3 last:pb-0">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[12px] font-bold text-[var(--text-primary)]">{r.customerName}</span>
                                        <div className="flex items-center gap-1 text-amber-500">
                                            {[...Array(5)].map((_, i) => <Star key={i} size={11} fill={i < r.rating ? 'currentColor' : 'none'} />)}
                                        </div>
                                    </div>
                                    {r.comment && <p className="text-[12px] text-[var(--text-muted)] font-medium leading-relaxed">"{r.comment}"</p>}
                                    <p className="text-[10px] font-bold text-[var(--text-muted)] mt-1">{format(new Date(r.date), 'MMM dd, yyyy')}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent orders */}
            <div className="bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-[var(--divider)]">
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">Recent orders</h3>
                    <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">Latest 10 orders containing this product, any status.</p>
                </div>
                {recentOrders.length === 0 ? (
                    <div className="p-10 text-center">
                        <Package size={28} className="mx-auto mb-3 text-[var(--text-muted)] opacity-50" />
                        <p className="text-[13px] font-bold text-[var(--text-primary)]">No orders yet for this product.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-[var(--bg-secondary)]">
                            <tr>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Reference</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Customer</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Date</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] text-right">Total</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--divider)]">
                            {recentOrders.map(o => (
                                <tr key={o._id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                                    <td className="px-6 py-4 text-[12px] font-bold text-[var(--text-primary)]">{o.reference}</td>
                                    <td className="px-6 py-4 text-[12px] font-medium">
                                        <p className="text-[var(--text-primary)] font-bold">{o.buyerName}</p>
                                        <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1.5"><Mail size={10} />{o.buyerEmail}</p>
                                    </td>
                                    <td className="px-6 py-4 text-[12px] font-medium text-[var(--text-muted)]">
                                        <div className="flex items-center gap-1.5"><Calendar size={11} /> {format(new Date(o.date), 'MMM dd, yyyy')}</div>
                                    </td>
                                    <td className="px-6 py-4 text-[13px] font-bold text-right text-[var(--text-primary)]">{fmt(o.amount)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${STATUS_COLOR[o.status] || STATUS_COLOR.pending}`}>
                                            {(o.status || 'pending').toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </motion.div>
    )
}

const Detail = ({ label, value, accent }) => (
    <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{label}</p>
        <p className={`text-[14px] font-bold mt-1 ${accent ? 'text-[#ed0000] text-xl tracking-tight' : 'text-[var(--text-primary)]'}`}>{value}</p>
    </div>
)

const StatCard = ({ icon, label, value, sub, highlight }) => (
    <div className={`p-5 rounded-2xl border ${highlight ? 'bg-[#ed0000]/5 border-[#ed0000]/30' : 'bg-[var(--bg-tertiary)] border-[var(--divider)]'} shadow-sm`}>
        <div className={`mb-3 ${highlight ? 'text-[#ed0000]' : 'text-[var(--text-muted)]'}`}>{icon}</div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{label}</p>
        <p className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mt-1">{value}</p>
        <p className="text-[10px] font-medium text-[var(--text-muted)] mt-1">{sub}</p>
    </div>
)

export default ProductDetailPage
