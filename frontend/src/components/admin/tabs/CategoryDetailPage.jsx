import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Package, ShoppingBag, Users, TrendingUp, Edit3, Trash2, Calendar, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { categoryApi } from '../../../api/client'
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

const CategoryDetailPage = ({ categoryId, onBack, onEdit, onDelete, onViewProducts, onSelectProduct }) => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let cancelled = false
        setLoading(true); setError('')
        categoryApi.getStats(categoryId)
            .then(res => { if (!cancelled && res.data?.success) setData(res.data.data) })
            .catch(err => { if (!cancelled) setError(err.response?.data?.message || 'Could not load category stats') })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [categoryId])

    if (loading) return (
        <div className="space-y-8">
            <SkeletonDetailHero />
            <SkeletonTwoCol />
            <SkeletonTableRows rows={4} cols={5} />
        </div>
    )
    if (error) return (
        <div className="space-y-4">
            <button onClick={onBack} className="flex items-center gap-2 text-[12px] font-bold text-[var(--text-muted)] hover:text-[#ed0000]"><ChevronLeft size={16} /> Back to categories</button>
            <div className="px-4 py-3 rounded-xl bg-red-50 text-[#ed0000] text-[12px] font-bold">{error}</div>
        </div>
    )
    if (!data) return null

    const { category, productCount, products, totals, topProducts, recentOrders, chart } = data

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <button onClick={onBack} className="flex items-center gap-2 text-[12px] font-bold text-[var(--text-muted)] hover:text-[#ed0000]">
                    <ChevronLeft size={16} /> Back to categories
                </button>
                <div className="flex items-center gap-2">
                    <button onClick={() => onViewProducts(category.name)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--divider)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[12px] font-bold transition-all">
                        View products in tab <ArrowRight size={13} />
                    </button>
                    <button onClick={() => onEdit(category)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-[12px] font-bold hover:bg-[#ed0000] transition-all">
                        <Edit3 size={14} /> Edit category
                    </button>
                    <button onClick={() => onDelete(category)} className="p-2.5 rounded-xl border border-red-200 text-[#ed0000] hover:bg-red-50 dark:hover:bg-red-950/20 transition-all">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Hero */}
            <div className="bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-3xl shadow-sm p-8">
                <div className="flex items-start gap-6">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-3xl shadow-sm shrink-0 ${category.color || 'bg-indigo-50 text-indigo-600'} overflow-hidden`}>
                        {category.coverImage ? <img src={category.coverImage} alt="" className="w-full h-full object-cover" /> : category.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">Category</span>
                        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] mt-1">{category.name}</h1>
                        {category.abstract && <p className="text-[13px] text-[var(--text-muted)] font-medium mt-3 leading-relaxed">{category.abstract}</p>}
                        {category.parent && (
                            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--divider)] text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                                Parent · {category.parent}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <StatCard icon={<Package size={18} />} label="Products" value={productCount} sub={productCount === 1 ? 'in this category' : 'in this category'} />
                <StatCard icon={<ShoppingBag size={18} />} label="Units sold" value={(totals.soldUnits || 0).toLocaleString()} sub="Paid orders only" />
                <StatCard icon={<TrendingUp size={18} />} label="Revenue" value={fmt(totals.revenue)} sub={`from ${totals.orderCount} order${totals.orderCount === 1 ? '' : 's'}`} />
                <StatCard icon={<Users size={18} />} label="Unique buyers" value={(totals.uniqueBuyers || 0).toLocaleString()} sub="Distinct emails" />
            </div>

            {/* Chart */}
            <div className="bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">Category sales trend</h3>
                    <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Last 12 months</p>
                </div>
                <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="catChartGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0f2e53" stopOpacity={0.85} />
                                    <stop offset="95%" stopColor="#0f2e53" stopOpacity={0.15} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--divider)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--text-muted)' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--text-muted)' }} />
                            <Tooltip
                                cursor={{ fill: 'rgba(15,46,83,0.05)' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--bg-tertiary)', fontSize: '11px', fontWeight: 700, boxShadow: '0 12px 32px rgba(0,0,0,0.18)' }}
                                formatter={(v, k) => k === 'units' ? [`${v} units`, 'Units sold'] : [fmt(v), 'Revenue']}
                            />
                            <Bar dataKey="units" fill="url(#catChartGrad)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top products + All products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Top sellers</h3>
                    {topProducts.length === 0 ? (
                        <p className="text-[12px] text-[var(--text-muted)] font-medium py-6 text-center">No paid orders yet in this category.</p>
                    ) : (
                        <div className="space-y-3">
                            {topProducts.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => onSelectProduct?.(p.id)}
                                    className="w-full flex items-center justify-between gap-3 p-2.5 -mx-2.5 rounded-xl hover:bg-[var(--bg-secondary)] transition-all text-left"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--divider)] shrink-0">
                                            {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[13px] font-bold text-[var(--text-primary)] truncate">{p.name}</p>
                                            <p className="text-[10px] text-[var(--text-muted)] font-medium">{fmt(p.price)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[12px] font-bold text-[var(--text-primary)]">{p.soldUnits} units</p>
                                        <p className="text-[10px] text-[var(--text-muted)] font-medium">{fmt(p.revenue)}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">All products in {category.name}</h3>
                    {products.length === 0 ? (
                        <p className="text-[12px] text-[var(--text-muted)] font-medium py-6 text-center">No products in this category yet.</p>
                    ) : (
                        <div className="space-y-2 max-h-[280px] overflow-y-auto no-scrollbar">
                            {products.map(p => (
                                <button
                                    key={p._id || p.id}
                                    onClick={() => onSelectProduct?.(p._id || p.id)}
                                    className="w-full flex items-center justify-between gap-3 p-2.5 -mx-2.5 rounded-xl hover:bg-[var(--bg-secondary)] transition-all text-left"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[var(--bg-secondary)] border border-[var(--divider)] shrink-0">
                                            {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[12px] font-bold text-[var(--text-primary)] truncate">{p.name}</p>
                                            <p className="text-[10px] text-[var(--text-muted)] font-medium">
                                                {p.status === 'out_of_stock' ? <span className="text-[#ed0000]">Out of stock</span> : 'In stock'}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-[12px] font-bold text-[#ed0000] shrink-0">{fmt(p.price)}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent orders */}
            <div className="bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-[var(--divider)]">
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">Recent orders</h3>
                    <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">Latest 10 orders that include any product from this category.</p>
                </div>
                {recentOrders.length === 0 ? (
                    <div className="p-10 text-center">
                        <Package size={28} className="mx-auto mb-3 text-[var(--text-muted)] opacity-50" />
                        <p className="text-[13px] font-bold text-[var(--text-primary)]">No orders yet.</p>
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
                                    <td className="px-6 py-4 text-[12px] font-medium text-[var(--text-primary)] font-bold">{o.buyerName}</td>
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

const StatCard = ({ icon, label, value, sub }) => (
    <div className="p-5 rounded-2xl border bg-[var(--bg-tertiary)] border-[var(--divider)] shadow-sm">
        <div className="mb-3 text-[var(--text-muted)]">{icon}</div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{label}</p>
        <p className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mt-1">{value}</p>
        <p className="text-[10px] font-medium text-[var(--text-muted)] mt-1">{sub}</p>
    </div>
)

export default CategoryDetailPage
