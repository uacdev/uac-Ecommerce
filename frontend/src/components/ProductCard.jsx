import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { cdnCard } from '../lib/img'
import toast from 'react-hot-toast'

const ProductCard = ({ product }) => {
    const { addToCart } = useStore()
    const stock = Number(product.stockCount ?? 0)
    const isOutOfStock = product.status === 'out_of_stock' || stock === 0
    const isLowStock = !isOutOfStock && stock <= 5

    const handleAddToCart = (e) => {
        e.preventDefault()
        e.stopPropagation()
        addToCart(product)
        toast.success(`Added ${product.name} to cart`, {
            style: {
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--divider)',
                fontSize: '12px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                borderRadius: '24px',
                padding: '16px 24px'
            }
        })
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group cursor-pointer"
        >
            <Link to={`/product/${product.id}`} className="block relative aspect-[3/4] rounded-2xl md:rounded-[30px] overflow-hidden bg-[var(--bg-secondary)] border border-[var(--divider)] mb-3">
                <img
                    src={cdnCard(product.image)}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                    alt={product.name}
                />
                
                {/* Minimal Overlay for Desktop */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Speed Ordering Button (Always visible on mobile, hover on desktop) */}
                {!isOutOfStock && (
                    <button 
                        onClick={handleAddToCart}
                        className="absolute bottom-2.5 right-2.5 md:bottom-6 md:right-6 w-8 h-8 md:w-12 md:h-12 rounded-full bg-white text-gray-900 shadow-xl flex items-center justify-center transition-all duration-300 md:translate-y-12 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 hover:bg-[var(--brand-red)] hover:text-white z-10"
                    >
                        <Plus size={16} className="md:w-5 md:h-5" />
                    </button>
                )}

                {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3">
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white border border-white/20 px-3 py-1.5 rounded-full">Sold Out</span>
                    </div>
                )}

                {isLowStock && (
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1.5 rounded-full bg-[var(--brand-red)] text-white text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] shadow-lg">
                        Only {stock} left
                    </div>
                )}
            </Link>

            <div className="flex flex-col items-start text-left px-1">
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-[var(--brand-red)] mb-1">{product.category}</span>
                <h3 className="text-xs sm:text-sm md:text-base font-extrabold text-[var(--text-primary)] mb-1 tracking-tight uppercase leading-tight line-clamp-2 h-8 sm:h-10 hover:text-[var(--brand-red)] transition-colors w-full">{product.name}</h3>
                <p className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)]">₦{product.price.toLocaleString()}</p>
                {product.piecesPerPack != null && (
                    <p className="text-[8px] md:text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mt-1 truncate w-full">
                        {product.piecesPerPack} pcs/pack
                    </p>
                )}
                {!isOutOfStock && (
                    <p className={`text-[8px] md:text-[9px] font-bold uppercase tracking-wider mt-0.5 ${isLowStock ? 'text-[var(--brand-red)]' : 'text-emerald-600'}`}>
                        {isLowStock ? `Only ${stock} left` : 'In stock'}
                    </p>
                )}
            </div>
        </motion.div>
    )
}

export default ProductCard
