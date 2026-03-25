import { motion } from 'framer-motion'
import { Heart, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import toast from 'react-hot-toast'

const ProductCard = ({ product }) => {
    const isSold = product.status === 'sold' || product.status === 'out_of_stock'
    const isOutOfStock = product.status === 'out_of_stock'
    const isReserved = product.is_reserved || product.status === 'reserved'
    const { toggleFavorite, isFavorite } = useStore()
    const liked = isFavorite(product.id)

    const handleFavorite = (e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite(product)
        toast(liked ? `Removed from favourites` : `Added to favourites ❤️`, {
            icon: liked ? '💔' : '❤️',
            style: {
                background: 'var(--bg-primary, #fff)',
                color: 'var(--text-primary, #111)',
                border: '1px solid var(--brand-red)',
                fontWeight: 'bold',
                borderRadius: '16px',
                fontSize: '13px',
            },
        })
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`group flex flex-col items-start ${isSold ? 'opacity-70' : ''}`}
        >
            {/* Product Image Container */}
            <Link
                to={`/product/${product.id}`}
                className="block aspect-[4/5] w-full rounded-2xl mb-4 overflow-hidden relative shadow-sm cursor-pointer"
                style={{ background: 'var(--bg-tertiary)' }}
            >
                <motion.img
                    whileHover={{ scale: isSold ? 1 : 1.08 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    src={product.image || 'https://via.placeholder.com/400x500'}
                    alt={product.name}
                    className={`w-full h-full object-cover ${isSold ? 'grayscale' : ''}`}
                />

                {/* Status Overlays */}
                <div className="absolute top-4 left-4 z-20">
                    {isReserved && !isSold && (
                        <span className="bg-[var(--brand-red)] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
                            Reserved
                        </span>
                    )}
                </div>

                {/* Big Out of Stock / Sold Out Center Badge */}
                {isSold && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
                        <div className="bg-red-500/90 backdrop-blur-md px-6 py-3 rounded-xl border border-white/20 shadow-2xl transform -rotate-12">
                            <p className="text-white font-black uppercase tracking-[0.2em] text-xs">
                                {isOutOfStock ? 'Out of Stock' : 'Sold Out'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Heart / Like Button */}
                <button
                    onClick={handleFavorite}
                    className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer z-10 shadow-lg
                        ${liked
                            ? 'bg-red-500 scale-110'
                            : 'bg-white/20 backdrop-blur-md hover:bg-red-500 hover:scale-110 opacity-0 group-hover:opacity-100'
                        }`}
                >
                    <Heart
                        size={16}
                        className={`transition-all ${liked ? 'fill-white text-white' : 'text-white'}`}
                        fill={liked ? 'white' : 'none'}
                    />
                </button>

                {/* Modern Action Overlay */}
                {!isSold && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[2px]">
                        <motion.span
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            className="bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-full"
                        >
                            Quick View
                        </motion.span>
                    </div>
                )}
            </Link>

            {/* Product Details */}
            <div className="w-full px-1">
                <div className="flex justify-between items-start gap-3 mb-1">
                    <h3 className={`text-sm font-bold tracking-tight leading-tight ${isSold ? 'text-gray-400 line-through' : 'text-[var(--text-primary)]'}`}>
                        {product.name}
                    </h3>
                    <p className={`text-sm font-black ${isSold ? 'text-gray-300' : 'text-[var(--brand-red)]'}`}>
                        ₦{product.price.toLocaleString()}
                    </p>
                </div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                        {product.category}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] italic">
                        {product.location ? product.location.split(',')[0] : "Ikeja, Lagos"}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 py-2 px-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--divider)]">
                    <Clock size={10} className="text-[var(--brand-red)]" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-[var(--text-primary)]">
                        {product.delivery_timeframe || "24-48 Hours Tracking"}
                    </span>
                </div>
            </div>
        </motion.div>
    )
}

export default ProductCard
