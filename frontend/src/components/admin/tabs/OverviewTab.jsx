import React from 'react'
import { Plus, Users, TrendingUp, Download } from 'lucide-react'
import KpiCard from '../KpiCard'
import SalesChart from '../ui/SalesChart'
import { InsightRow, CustomerRow, CustomDatePicker } from '../ui/shared_ui'
import { statsApi } from '../../../api/client'
import { useStore } from '../../../context/StoreContext'

const OverviewTab = ({ orders, products, onAddProduct, dateRange, setDateRange, onExport }) => {
    const { stats } = useStore()

    const handleExport = () => {
        if (!onExport) return
        // Snapshot of headline KPIs as a single-row CSV
        const trends = stats.trends || {}
        onExport([{
            generatedAt: new Date().toISOString(),
            totalRevenue: stats.totalRevenue || 0,
            totalOrders: stats.totalOrders || 0,
            avgOrderValue: stats.avgOrderValue || 0,
            totalCustomers: stats.totalCustomers || 0,
            totalProducts: stats.totalProducts || 0,
            pendingOrders: stats.pendingOrders || 0,
            revenueTrend: trends.revenue?.label || '',
            ordersTrend: trends.orders?.label || '',
            aovTrend: trends.aov?.label || '',
            customersTrend: trends.customers?.label || ''
        }], 'dashboard_snapshot')
    }
    const trends = stats.trends || {}
    const [bestSellers, setBestSellers] = React.useState([])
    const [loadingBestSellers, setLoadingBestSellers] = React.useState(true)
    const [customers, setCustomers] = React.useState([])

    React.useEffect(() => {
        let cancelled = false
        setLoadingBestSellers(true)
        Promise.allSettled([statsApi.getBestSellers(), statsApi.getCustomers()]).then(([bsRes, cuRes]) => {
            if (cancelled) return
            if (bsRes.status === 'fulfilled' && bsRes.value.data?.success) setBestSellers(bsRes.value.data.data || [])
            if (cuRes.status === 'fulfilled' && cuRes.value.data?.success) setCustomers(cuRes.value.data.data || [])
            setLoadingBestSellers(false)
        })
        return () => { cancelled = true }
    }, [])

    const displayProducts = bestSellers.length > 0 ? bestSellers : products.slice(0, 5)

    // Derived from server-aggregated customer data so it stays correct with paginated orders.
    const topContributors = React.useMemo(
        () => [...customers]
            .sort((a, b) => (b.totalSpend || 0) - (a.totalSpend || 0))
            .slice(0, 2)
            .map(c => ({ name: c.name, spend: c.totalSpend || 0 })),
        [customers]
    )

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Dashboard overview</h2>
                    <p className="text-[14px] text-[var(--text-muted)] mt-1.5 font-medium">Welcome back! Here is what is happening today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <CustomDatePicker dateRange={dateRange} setDateRange={setDateRange} />
                    <button
                        onClick={handleExport}
                        className="px-4 py-3 rounded-xl border border-[var(--divider)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-all bg-[var(--bg-tertiary)] shadow-sm flex items-center gap-2 text-[12px] font-bold"
                        title="Export dashboard snapshot as CSV"
                    >
                        <Download size={16} /> Export
                    </button>
                    <button
                        onClick={onAddProduct}
                        className="bg-black text-white px-8 py-3.5 rounded-2xl text-[13px] font-bold flex items-center gap-2.5 shadow-2xl hover:bg-[#ed0000] transition-all"
                    >
                        <Plus size={18} />
                        <span>New product</span>
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* LEFT SIDE: KPI CARDS & SALES CHART */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <KpiCard title="Total sales" value={`₦${(stats.totalRevenue || 0).toLocaleString()}`} trend={trends.revenue?.label || '—'} isPositive={trends.revenue?.positive ?? true} />
                        <KpiCard title="Orders placed" value={stats.totalOrders} trend={trends.orders?.label || '—'} isPositive={trends.orders?.positive ?? true} />
                        <KpiCard title="Average order value" value={`₦${Math.floor(stats.avgOrderValue || 0).toLocaleString()}`} trend={trends.aov?.label || '—'} isPositive={trends.aov?.positive ?? true} />
                        <KpiCard title="Returning rate" value={`${(stats.returningRate || 0).toFixed(1)}%`} trend={trends.returning?.label || '—'} isPositive={trends.returning?.positive ?? true} />
                        <KpiCard title="Abandonment rate" value={`${(stats.abandonmentRate || 0).toFixed(1)}%`} trend={trends.abandonment?.label || '—'} isPositive={trends.abandonment?.positive ?? true} />
                        <KpiCard title="Daily visitors" value={(stats.dailyVisitors || 0).toLocaleString()} trend={trends.visitors?.label || '—'} isPositive={trends.visitors?.positive ?? true} />
                        <KpiCard title="Total customers" value={(stats.totalCustomers || 0).toLocaleString()} trend={trends.customers?.label || '—'} isPositive={trends.customers?.positive ?? true} />
                        <KpiCard title="Pending orders" value={stats.pendingOrders} trend={`${stats.pendingOrders} awaiting`} isPositive={stats.pendingOrders === 0} />
                        <KpiCard title="Active products" value={`${stats.availableProducts} / ${stats.totalProducts}`} trend="In catalogue" isPositive />
                    </div>

                    <SalesChart />
                </div>

                {/* RIGHT SIDE: BEST SELLING & INSIGHTS */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-8">
                    <div className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--divider)] shadow-sm p-6">
                        <h3 className="text-lg font-bold mb-6 text-[var(--text-primary)]">Best selling products</h3>
                        <div className="space-y-5">
                            {loadingBestSellers ? (
                                <div className="space-y-5">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="w-20 h-20 rounded-2xl bg-[var(--bg-secondary)] animate-pulse" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 w-3/4 bg-[var(--bg-secondary)] rounded animate-pulse" />
                                                <div className="h-2 w-16 bg-[var(--bg-secondary)] rounded animate-pulse opacity-60" />
                                            </div>
                                            <div className="h-3 w-12 bg-[var(--bg-secondary)] rounded animate-pulse" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                displayProducts.map(p => (
                                    <div key={p.id} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border border-[var(--divider)] shrink-0 shadow-sm group-hover:shadow-md transition-all duration-500">
                                                <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                            </div>
                                            <div>
                                                <p className="text-[12px] font-bold tracking-tight text-[var(--text-primary)] line-clamp-1">{p.name}</p>
                                                <p className="text-[10px] text-[var(--text-muted)] font-bold mt-0.5">₦{(p.price || 0).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-emerald-600 whitespace-nowrap">
                                            {p.unitsSold > 0 ? `${p.unitsSold} sold` : 'No sales yet'}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--divider)] shadow-sm p-6">
                        <h3 className="text-lg font-bold mb-6 text-[var(--text-primary)]">Customer insights</h3>
                        <div className="space-y-5">
                            <InsightRow label="Total customers" value={stats.totalCustomers.toLocaleString()} icon={<Users size={14} />} color="bg-red-50 text-[#ed0000]" />
                            <InsightRow label="Repeat buyers" value={(() => {
                                const counts = new Map();
                                orders.forEach(o => o.buyerEmail && counts.set(o.buyerEmail, (counts.get(o.buyerEmail) || 0) + 1));
                                return Array.from(counts.values()).filter(n => n > 1).length;
                            })()} icon={<Users size={14} />} color="bg-[var(--bg-secondary)] text-[var(--text-muted)]" />
                            <InsightRow label="Repeat rate" value={stats.totalCustomers > 0 ? `${(() => {
                                const counts = new Map();
                                orders.forEach(o => o.buyerEmail && counts.set(o.buyerEmail, (counts.get(o.buyerEmail) || 0) + 1));
                                const repeats = Array.from(counts.values()).filter(n => n > 1).length;
                                return ((repeats / stats.totalCustomers) * 100).toFixed(0);
                            })()}%` : '0%'} icon={<TrendingUp size={14} />} color="bg-emerald-50 text-emerald-600" />
                        </div>
                        <div className="mt-8 pt-8 border-t border-[var(--divider)]">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-[12px] font-bold tracking-tight text-[var(--text-primary)]">Top contributors</h4>
                                <button className="text-[10px] font-bold text-[#ed0000] uppercase tracking-widest hover:underline">See all</button>
                            </div>
                            <div className="space-y-3">
                                {topContributors.length > 0 ? topContributors.map((c, i) => (
                                    <CustomerRow key={i} name={c.name} img={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=${i===0?'ed0000':'000'}&color=fff`} spend={`₦${c.spend.toLocaleString()}`} />
                                )) : (
                                    <p className="text-[12px] text-[var(--text-muted)] text-center w-full py-4">No contributors yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OverviewTab
