import { motion } from 'framer-motion'
import { ShoppingCart, Heart, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

const ProductCard = ({ product }) => {
    const isSold = product.status === 'sold'
    const isReserved = product.is_reserved || product.status === 'reserved'

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
                className="block aspect-[4/5] w-full rounded-2xl mb-4 overflow-hidden relative shadow-sm"
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
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {isSold ? (
                        <span className="bg-red-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
                            Sold Out
                        </span>
                    ) : isReserved ? (
                        <span className="bg-[#F18B24] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
                            Reserved
                        </span>
                    ) : null}
                </div>

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
                    <p className={`text-sm font-black ${isSold ? 'text-gray-300' : 'text-[#F18B24]'}`}>
                        ₦{(product.price / 1000).toFixed(0)}k
                    </p>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                        {product.category}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] italic">
                        {product.location.split(',')[0]}
                    </span>
                </div>
            </div>
        </motion.div>
    )
}

export default ProductCard
