import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { statsApi } from '../../../api/client'

const BRAND_RED = "#ed0000"

const SalesChart = () => {
    const [timeframe, setTimeframe] = useState('Monthly')
    const [chartData, setChartData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchChartData = async () => {
            setLoading(true)
            try {
                const res = await statsApi.getSalesChart(timeframe)
                if (res.data.success) {
                    setChartData(res.data.data)
                }
            } catch (err) {
                console.error("Failed to fetch sales chart data", err)
            } finally {
                setLoading(false)
            }
        }
        fetchChartData()
    }, [timeframe])

    return (
        <div className="bg-[var(--bg-tertiary)] p-6 rounded-2xl border border-[var(--divider)] shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Sales analytics</h3>
                <div className="flex bg-[var(--bg-secondary)] rounded-xl p-1">
                    {['Daily', 'Weekly', 'Monthly'].map(t => (
                        <button 
                            key={t} 
                            onClick={() => setTimeframe(t)} 
                            className={`px-4 py-2 rounded-lg text-[11px] font-bold transition-all ${timeframe === t ? 'bg-[var(--bg-tertiary)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-[320px] w-full relative">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-tertiary)]/50 z-10">
                        <span className="text-[12px] font-bold text-[var(--text-muted)] mt-2">Loading...</span>
                    </div>
                )}
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={BRAND_RED} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={BRAND_RED} stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--divider)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--text-muted)' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--text-muted)' }} />
                        <Tooltip 
                            cursor={{ fill: 'rgba(237,0,0,0.05)' }} 
                            contentStyle={{ borderRadius: '16px', border: 'none', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 700, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} 
                        />
                        <Bar dataKey="value" fill="url(#barGrad)" radius={[6, 6, 0, 0]} barSize={timeframe === 'Daily' ? 40 : 60} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default SalesChart
