import { motion } from 'framer-motion'

const EmptyState = ({ 
    icon: Icon, 
    title, 
    description, 
    actionLabel, 
    onAction, 
    className = "" 
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex flex-col items-center justify-center py-20 text-center ${className}`}
        >
            <div className="relative mb-10">
                {/* Visual Background Element */}
                <div className="absolute inset-0 bg-[#F18B2410] blur-3xl rounded-full scale-150" />
                
                <div className="relative w-28 h-28 rounded-[40px] bg-[var(--bg-secondary)] border border-[var(--divider)] flex items-center justify-center shadow-xl">
                    <Icon size={48} className="text-[#F18B24] opacity-40" />
                    
                    {/* Micro-sparkles or dots */}
                    <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-emerald-500/20 blur-sm" />
                    <div className="absolute -bottom-4 -left-2 w-6 h-6 rounded-full bg-blue-500/10 blur-sm" />
                </div>
            </div>

            <h3 className="text-2xl md:text-3xl font-black mb-4 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {title}
            </h3>
            
            <p className="text-base font-medium max-w-sm mx-auto mb-10 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {description}
            </p>

            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="btn-primary py-4 px-10 text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-orange-500/10 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    {actionLabel}
                </button>
            )}
        </motion.div>
    )
}

export default EmptyState
