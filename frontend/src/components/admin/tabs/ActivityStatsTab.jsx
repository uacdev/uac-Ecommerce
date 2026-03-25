import React, { useState } from 'react'
import KpiCard from '../KpiCard'
import SalesChart from '../ui/SalesChart'

const ActivityStatsTab = ({ orders, products }) => {
    const [timeframe, setTimeframe] = useState('Monthly')
    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-20">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Activity statistics</h2>
                <p className="text-[13px] text-[var(--text-muted)] mt-1 font-medium">Key performance indicators and operational metrics.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="Registered users" value="4,820" trend="+12%" isPositive />
                <KpiCard title="Gross Sales" value="₦5.2M" trend="+8%" isPositive />
                <KpiCard title="Session sales" value="₦42k" trend="+3%" isPositive />
                <KpiCard title="Portal visits" value="130" trend="+0%" isPositive />
            </div>
            <div className="max-w-4xl">
                 <SalesChart timeframe={timeframe} setTimeframe={setTimeframe} />
            </div>
        </div>
    )
}

export default ActivityStatsTab
