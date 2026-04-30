import { useEffect, useMemo, useState } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { scaleLinear } from 'd3-scale'
import { statsApi } from '../../../api/client'

// GADM names use no spaces; our enum uses canonical spaces. This maps GADM → canonical.
const GADM_NAME_TO_STATE = {
    AkwaIbom: 'Akwa Ibom',
    CrossRiver: 'Cross River',
    FederalCapitalTerritory: 'FCT'
}

const fmtNgn = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`

const NigeriaHeatmap = () => {
    const [data, setData] = useState([])
    const [totals, setTotals] = useState({ orders: 0, revenue: 0 })
    const [hovered, setHovered] = useState(null)
    const [metric, setMetric] = useState('orderCount') // 'orderCount' | 'revenue'
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        statsApi.getGeography()
            .then(res => {
                if (cancelled) return
                if (res.data?.success) {
                    setData(res.data.data || [])
                    setTotals(res.data.totals || { orders: 0, revenue: 0 })
                }
            })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [])

    const byState = useMemo(() => {
        const m = new Map()
        data.forEach(d => m.set(d.state, d))
        return m
    }, [data])

    const max = useMemo(() => {
        const v = data.map(d => Number(d[metric] || 0))
        return Math.max(1, ...v)
    }, [data, metric])

    const colorScale = useMemo(
        () => scaleLinear().domain([0, max]).range(['#fff5f5', '#ed0000']),
        [max]
    )

    const resolveState = (gadmName) => GADM_NAME_TO_STATE[gadmName] || gadmName

    const totalShown = useMemo(() => {
        if (metric === 'revenue') return fmtNgn(totals.revenue)
        return totals.orders.toLocaleString('en-NG') + ' order' + (totals.orders === 1 ? '' : 's')
    }, [metric, totals])

    return (
        <div className="bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--divider)] shadow-sm p-6">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">Geography</h3>
                    <p className="text-[12px] text-[var(--text-muted)] font-medium mt-0.5">Where your customers are buying from.</p>
                </div>
                <div className="flex bg-[var(--bg-secondary)] rounded-xl p-1">
                    {[{ k: 'orderCount', l: 'Orders' }, { k: 'revenue', l: 'Revenue' }].map(t => (
                        <button
                            key={t.k}
                            onClick={() => setMetric(t.k)}
                            className={`px-4 py-2 rounded-lg text-[11px] font-bold transition-all ${metric === t.k ? 'bg-[var(--bg-tertiary)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}
                        >
                            {t.l}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative">
                <div className="absolute top-0 left-0 z-10 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                    Total · <span className="text-[var(--text-primary)] tracking-tight">{totalShown}</span>
                </div>
                {loading ? (
                    <div className="h-[420px] flex items-center justify-center text-[12px] text-[var(--text-muted)] font-bold">Loading map…</div>
                ) : (
                    <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{ center: [9, 9.5], scale: 1850 }}
                        width={600}
                        height={420}
                        style={{ width: '100%', height: 'auto' }}
                    >
                        <Geographies geography="/data/nigeria-states.json">
                            {({ geographies }) =>
                                geographies.map(geo => {
                                    const gadmName = geo.properties.NAME_1
                                    const state = resolveState(gadmName)
                                    const row = byState.get(state)
                                    const value = Number(row?.[metric] || 0)
                                    const fill = value > 0 ? colorScale(value) : 'var(--bg-secondary)'
                                    return (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            fill={fill}
                                            stroke="var(--divider)"
                                            strokeWidth={0.5}
                                            onMouseEnter={() => setHovered({ state, ...row, gadmName })}
                                            onMouseLeave={() => setHovered(null)}
                                            style={{
                                                default: { outline: 'none' },
                                                hover: { fill: '#0f2e53', outline: 'none', cursor: 'pointer' },
                                                pressed: { outline: 'none' }
                                            }}
                                        />
                                    )
                                })
                            }
                        </Geographies>
                    </ComposableMap>
                )}
            </div>

            {hovered ? (
                <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--divider)]">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">State</p>
                        <p className="text-[14px] font-bold text-[var(--text-primary)] mt-0.5">{hovered.state}</p>
                    </div>
                    <div className="px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--divider)]">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Orders</p>
                        <p className="text-[14px] font-bold text-[var(--text-primary)] mt-0.5">{(hovered.orderCount || 0).toLocaleString()}</p>
                    </div>
                    <div className="px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--divider)]">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Revenue</p>
                        <p className="text-[14px] font-bold text-[#ed0000] mt-0.5">{fmtNgn(hovered.revenue)}</p>
                    </div>
                </div>
            ) : (
                <p className="text-[11px] text-[var(--text-muted)] font-medium text-center mt-4">Hover any state for a breakdown.</p>
            )}
        </div>
    )
}

export default NigeriaHeatmap
