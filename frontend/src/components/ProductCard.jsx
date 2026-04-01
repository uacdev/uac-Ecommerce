import { motion } from 'framer-motion'
import { Plus, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import toast from 'react-hot-toast'

const ProductCard = ({ product }) => {
    const { addToCart, isFavorite } = useStore()
    const isOutOfStock = product.status === 'out_of_stock'

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
            <Link to={`/product/${product.id}`} className="block relative aspect-[3/4] rounded-[48px] overflow-hidden bg-[var(--bg-secondary)] border border-[var(--divider)] mb-8">
                <img 
                    src={product.image} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                    alt={product.name}
                />
                
                {/* Minimal Overlay for Desktop */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Speed Ordering Button */}
                {!isOutOfStock && (
                    <button 
                        onClick={handleAddToCart}
                        className="absolute bottom-8 right-8 w-14 h-14 rounded-full bg-white shadow-2xl flex items-center justify-center translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 hover:bg-[var(--brand-red)] hover:text-white"
                    >
                        <Plus size={24} />
                    </button>
                )}

                {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white border border-white/20 px-4 py-2 rounded-full">Sold Out</span>
                    </div>
                )}
            </Link>

            <div className="flex flex-col items-center text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--brand-red)] mb-2">{product.category}</span>
                <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2 tracking-tight uppercase leading-tight max-w-[80%] mx-auto">{product.name}</h3>
                <p className="text-sm font-bold text-[var(--text-muted)]">₦{product.price.toLocaleString()}</p>
            </div>
        </motion.div>
    )
}

export default ProductCard
