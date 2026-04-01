import React, { useState } from 'react'
import KpiCard from '../KpiCard'
import SalesChart from '../ui/SalesChart'
import { useStore } from '../../../context/StoreContext'

const ActivityStatsTab = ({ orders, products }) => {
    const { stats } = useStore()

    const formatMetrics = (num) => {
        if (!num) return '0'
        if (num >= 1000000) return `₦${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `₦${(num / 1000).toFixed(1)}k`
        return `₦${num.toLocaleString()}`
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-20">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Activity statistics</h2>
                <p className="text-[13px] text-[var(--text-muted)] mt-1 font-medium">Key performance indicators and operational metrics.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="Registered users" value={stats.totalCustomers.toLocaleString()} trend="+12%" isPositive />
                <KpiCard title="Gross Sales" value={formatMetrics(stats.totalRevenue)} trend="+8%" isPositive />
                <KpiCard title="Session sales" value={formatMetrics(stats.totalRevenue * 0.1)} trend="+3%" isPositive />
                <KpiCard title="Platform Orders" value={stats.totalOrders.toLocaleString()} trend="+0%" isPositive />
            </div>
            <div className="max-w-4xl">
                 <SalesChart />
            </div>
        </div>
    )
}

export default ActivityStatsTab
