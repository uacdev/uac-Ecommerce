import React from 'react'
import { Plus, Users, TrendingUp } from 'lucide-react'
import KpiCard from '../KpiCard'
import SalesChart from '../ui/SalesChart'
import { InsightRow, CustomerRow, CustomDatePicker } from '../ui/shared_ui'
import { statsApi } from '../../../api/client'
import { useStore } from '../../../context/StoreContext'

const OverviewTab = ({ orders, products, onAddProduct, dateRange, setDateRange }) => {
    const { stats } = useStore()
    const revenue = orders.reduce((sum, o) => sum + o.amount, 0)
    const [bestSellers, setBestSellers] = React.useState([])
    const [loadingBestSellers, setLoadingBestSellers] = React.useState(true)

    React.useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                setLoadingBestSellers(true)
                const res = await statsApi.getBestSellers()
                if (res.data.success) {
                    setBestSellers(res.data.data)
                }
            } catch (err) {
                console.error("Failed to fetch best sellers", err)
            } finally {
                setLoadingBestSellers(false)
            }
        }
        fetchBestSellers()
    }, [])
    
    const displayProducts = bestSellers.length > 0 ? bestSellers : products.slice(0, 5)

    const topContributors = React.useMemo(() => {
        const map = new Map();
        orders.forEach(o => {
            if (!o.buyerEmail) return;
            const existing = map.get(o.buyerEmail) || { name: o.buyerName, spend: 0 };
            existing.spend += o.amount;
            map.set(o.buyerEmail, existing);
        });
        return Array.from(map.values()).sort((a, b) => b.spend - a.spend).slice(0, 2);
    }, [orders])

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
                        <KpiCard title="Total sales" value={`₦${revenue.toLocaleString()}`} trend={"+12.5%"} isPositive />
                        <KpiCard title="Orders placed" value={orders.length} trend="+8.2%" isPositive />
                        <KpiCard title="Average order value" value={`₦${Math.floor(revenue / (orders.length || 1)).toLocaleString()}`} trend="+3.1%" isPositive />
                        <KpiCard title="Returning rate" value={stats.totalCustomers > 0 ? `${((orders.length - stats.totalCustomers) / orders.length * 100).toFixed(1)}%` : '0%'} trend="+2.4%" isPositive />
                        <KpiCard title="Abandonment rate" value="12.4%" trend="-1.8%" isPositive={true} />
                        <KpiCard title="Daily visitors" value={(stats.totalCustomers * 15 || 53).toLocaleString()} trend="+15.3%" isPositive />
                    </div>

                    <SalesChart />
                </div>

                {/* RIGHT SIDE: BEST SELLING & INSIGHTS */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-8">
                    <div className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--divider)] shadow-sm p-6">
                        <h3 className="text-lg font-bold mb-6 text-[var(--text-primary)]">Best selling products</h3>
                        <div className="space-y-5">
                            {loadingBestSellers ? (
                                <div className="animate-pulse space-y-4">
                                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-[var(--bg-secondary)] rounded-xl" />)}
                                </div>
                            ) : (
                                displayProducts.map(p => (
                                    <div key={p.id} className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <img src={p.image} className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" alt="" />
                                            <div>
                                                <p className="text-[12px] font-bold tracking-tight text-[var(--text-primary)] line-clamp-1">{p.name}</p>
                                                <p className="text-[10px] text-[var(--text-muted)] font-bold mt-0.5">₦{(p.price || 0).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-emerald-600 whitespace-nowrap">
                                            +{Math.floor(Math.random() * 50) + 10} sold
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--divider)] shadow-sm p-6">
                        <h3 className="text-lg font-bold mb-6 text-[var(--text-primary)]">Customer insights</h3>
                        <div className="space-y-5">
                            <InsightRow label="New users" value={stats.totalCustomers.toLocaleString()} icon={<Users size={14} />} color="bg-red-50 text-[#ed0000]" />
                            <InsightRow label="Active users" value={Math.floor(stats.totalCustomers * 1.5) || 5} icon={<Users size={14} />} color="bg-[var(--bg-secondary)] text-[var(--text-muted)]" />
                            <InsightRow label="Retention" value={stats.totalCustomers > 0 ? "68%" : "0%"} icon={<TrendingUp size={14} />} color="bg-emerald-50 text-emerald-600" />
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
