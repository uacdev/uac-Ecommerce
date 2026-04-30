import { useState } from 'react'
import { Download } from 'lucide-react'
import KpiCard from '../KpiCard'
import SalesChart from '../ui/SalesChart'
import NigeriaHeatmap from '../charts/NigeriaHeatmap'
import RevenueDonut from '../charts/RevenueDonut'
import HourHeatmap from '../charts/HourHeatmap'
import StatusFunnel from '../charts/StatusFunnel'
import { useStore } from '../../../context/StoreContext'
import { statsApi } from '../../../api/client'

const ActivityStatsTab = ({ onExport }) => {
    const { stats } = useStore()
    const trends = stats.trends || {}
    const [exporting, setExporting] = useState(false)

    const formatMetrics = (num) => {
        if (!num) return '₦0'
        if (num >= 1000000) return `₦${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `₦${(num / 1000).toFixed(1)}k`
        return `₦${num.toLocaleString()}`
    }

    const handleExport = async () => {
        if (!onExport) return
        setExporting(true)
        try {
            // Pull all four sub-datasets in parallel and emit one row per metric so the CSV stays flat.
            const [geoRes, catRes, funnelRes] = await Promise.allSettled([
                statsApi.getGeography(),
                statsApi.getRevenueByCategory(),
                statsApi.getStatusFunnel()
            ])
            const rows = []
            rows.push({ section: 'KPIs', key: 'totalRevenue', value: stats.totalRevenue || 0 })
            rows.push({ section: 'KPIs', key: 'totalOrders', value: stats.totalOrders || 0 })
            rows.push({ section: 'KPIs', key: 'avgOrderValue', value: stats.avgOrderValue || 0 })
            rows.push({ section: 'KPIs', key: 'totalCustomers', value: stats.totalCustomers || 0 })
            rows.push({ section: 'KPIs', key: 'totalProducts', value: stats.totalProducts || 0 })

            if (geoRes.status === 'fulfilled' && geoRes.value.data?.success) {
                geoRes.value.data.data.forEach(g => {
                    if (g.orderCount > 0) rows.push({ section: 'Geography', key: g.state, value: `${g.orderCount} orders / ₦${g.revenue}` })
                })
            }
            if (catRes.status === 'fulfilled' && catRes.value.data?.success) {
                catRes.value.data.data.forEach(c => rows.push({ section: 'Revenue by category', key: c.category, value: `${c.units} units / ₦${c.revenue}` }))
            }
            if (funnelRes.status === 'fulfilled' && funnelRes.value.data?.success) {
                funnelRes.value.data.data.forEach(s => rows.push({ section: 'Status funnel', key: s.status, value: `${s.count} orders / ₦${s.revenue}` }))
            }
            onExport(rows, 'activity_stats_export')
        } finally {
            setExporting(false)
        }
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Activity statistics</h2>
                    <p className="text-[13px] text-[var(--text-muted)] mt-1 font-medium">Operational metrics, geography, and order pipeline.</p>
                </div>
                <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="self-start md:self-auto px-4 py-3 rounded-xl border border-[var(--divider)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-all bg-[var(--bg-tertiary)] shadow-sm disabled:opacity-50 flex items-center gap-2 text-[12px] font-bold"
                    title="Export geography + categories + funnel as CSV"
                >
                    <Download size={16} /> {exporting ? 'Exporting…' : 'Export'}
                </button>
            </div>

            {/*
              TOP SECTION — nested columns. Each column stacks its own items (KPI+Sales on
              the left; Donut+Funnel on the right). Any leftover height falls at the BOTTOM
              of the shorter column rather than between KPIs and Sales (which looked broken).
            */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <KpiCard title="Total customers" value={stats.totalCustomers.toLocaleString()} trend={trends.customers?.label || '—'} isPositive={trends.customers?.positive ?? true} />
                        <KpiCard title="Gross sales" value={formatMetrics(stats.totalRevenue)} trend={trends.revenue?.label || '—'} isPositive={trends.revenue?.positive ?? true} />
                        <KpiCard title="Avg order value" value={formatMetrics(stats.avgOrderValue)} trend={trends.aov?.label || '—'} isPositive={trends.aov?.positive ?? true} />
                        <KpiCard title="Platform orders" value={stats.totalOrders.toLocaleString()} trend={trends.orders?.label || '—'} isPositive={trends.orders?.positive ?? true} />
                    </div>
                    {/* flex-1 lets the chart absorb the remaining vertical space in the left column,
                        so it grows to match the donut+funnel stack height instead of leaving a gap. */}
                    <div className="flex-1 min-h-[420px]">
                        <SalesChart />
                    </div>
                </div>
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <RevenueDonut />
                    <StatusFunnel />
                </div>
            </div>

            {/* GEOGRAPHY — full width so the map gets room to breathe */}
            <NigeriaHeatmap />

            {/* ORDER TIMING — full width so the day + hour bar charts get equal space */}
            <HourHeatmap />
        </div>
    )
}

export default ActivityStatsTab
