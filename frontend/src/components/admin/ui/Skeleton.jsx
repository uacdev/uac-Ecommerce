// Reusable skeleton primitives + ready-made layouts so every page on the dashboard
// loads with the same shimmer treatment. Tailwind only — no extra deps.

export const Skeleton = ({ className = '', ...props }) => (
    <div className={`bg-[var(--bg-secondary)] rounded animate-pulse ${className}`} {...props} />
)

export const SkeletonText = ({ width = 'w-full', className = '' }) => (
    <Skeleton className={`h-3 ${width} ${className}`} />
)

export const SkeletonHeading = ({ width = 'w-48' }) => (
    <Skeleton className={`h-6 ${width}`} />
)

// "Header bar" — page title + subtitle + action button on the right
export const SkeletonHeader = () => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
            <SkeletonHeading width="w-56" />
            <SkeletonText width="w-72" className="opacity-60" />
        </div>
        <Skeleton className="h-12 w-36 rounded-2xl" />
    </div>
)

// 4-card stats row
export const SkeletonStats = ({ count = 4 }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--divider)] shadow-sm">
                <Skeleton className="w-8 h-8 rounded-lg mb-3" />
                <SkeletonText width="w-20" className="opacity-60" />
                <Skeleton className="h-7 w-24 mt-2 rounded" />
                <SkeletonText width="w-16" className="mt-2 opacity-50" />
            </div>
        ))}
    </div>
)

// Table-row placeholders
export const SkeletonTableRows = ({ rows = 5, cols = 4 }) => (
    <div className="bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl overflow-hidden">
        <div className="bg-[var(--bg-secondary)] px-6 py-5 grid gap-6" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols }).map((_, i) => <SkeletonText key={i} width="w-24" className="opacity-60" />)}
        </div>
        <div className="divide-y divide-[var(--divider)]">
            {Array.from({ length: rows }).map((_, r) => (
                <div key={r} className="px-6 py-5 grid gap-6 items-center" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                    {Array.from({ length: cols }).map((_, c) => (
                        <SkeletonText key={c} width={c === 0 ? 'w-40' : c === cols - 1 ? 'w-16' : 'w-28'} />
                    ))}
                </div>
            ))}
        </div>
    </div>
)

// Card grid placeholders (e.g. Products grid, Reviews list)
export const SkeletonCardGrid = ({ count = 8 }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl shadow-sm overflow-hidden">
                <Skeleton className="aspect-square m-4 rounded-2xl" />
                <div className="px-5 pb-5 space-y-3">
                    <SkeletonText width="w-16" className="opacity-60" />
                    <SkeletonText width="w-3/4" />
                    <div className="flex justify-between items-center pt-3 border-t border-[var(--divider)]">
                        <SkeletonText width="w-20" />
                        <SkeletonText width="w-12" className="opacity-60" />
                    </div>
                </div>
            </div>
        ))}
    </div>
)

// Two-column block with a list of rows (e.g. Top buyers / Reviews)
export const SkeletonTwoCol = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map(i => (
            <div key={i} className="p-6 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--divider)] shadow-sm space-y-4">
                <SkeletonHeading width="w-32" />
                {Array.from({ length: 4 }).map((_, r) => (
                    <div key={r} className="flex items-center gap-3">
                        <Skeleton className="w-9 h-9 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <SkeletonText width="w-32" />
                            <SkeletonText width="w-24" className="opacity-60" />
                        </div>
                        <SkeletonText width="w-16" />
                    </div>
                ))}
            </div>
        ))}
    </div>
)

// Generic page skeleton: header + stats + table
export const SkeletonPage = ({ stats = true, rows = 5, cols = 4 }) => (
    <div className="space-y-8 animate-in fade-in duration-300">
        <SkeletonHeader />
        {stats && <SkeletonStats />}
        <SkeletonTableRows rows={rows} cols={cols} />
    </div>
)

// Hero detail page skeleton (for product/category detail pages)
export const SkeletonDetailHero = () => (
    <div className="space-y-8">
        <Skeleton className="h-5 w-40 rounded" />
        <div className="bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-3xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                <Skeleton className="aspect-square md:aspect-auto m-0 rounded-none" />
                <div className="md:col-span-2 p-8 space-y-4">
                    <SkeletonText width="w-20" className="opacity-60" />
                    <SkeletonHeading width="w-3/4" />
                    <SkeletonText width="w-full" className="opacity-60" />
                    <SkeletonText width="w-5/6" className="opacity-60" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-[var(--divider)]">
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} className="space-y-2">
                                <SkeletonText width="w-12" className="opacity-50" />
                                <SkeletonText width="w-20" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        <SkeletonStats />
        <Skeleton className="h-72 rounded-2xl" />
    </div>
)
