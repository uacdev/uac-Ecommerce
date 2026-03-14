import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { PRODUCTS as INITIAL_PRODUCTS } from '../data/products'

const StoreContext = createContext()

export const useStore = () => useContext(StoreContext)

export const StoreProvider = ({ children }) => {
    const [products, setProducts] = useState([])
    const [orders, setOrders] = useState([])
    const [cart, setCart] = useState([])
    const [favorites, setFavorites] = useState([])
    const [loading, setLoading] = useState(true)

    // Persistence load for Cart & Favorites
    useEffect(() => {
        const savedCart = localStorage.getItem('sr_cart')
        if (savedCart) setCart(JSON.parse(savedCart))
        const savedFavs = localStorage.getItem('sr_favorites')
        if (savedFavs) setFavorites(JSON.parse(savedFavs))
    }, [])

    // Persistence save for Cart
    useEffect(() => {
        localStorage.setItem('sr_cart', JSON.stringify(cart))
    }, [cart])

    // Persistence save for Favorites
    useEffect(() => {
        localStorage.setItem('sr_favorites', JSON.stringify(favorites))
    }, [favorites])

    // Initial Fetch (existing logic)...
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            
            // Ensure Supabase is initialized
            if (!supabase.supabaseUrl) {
                console.warn('Supabase URL not found. Ensure VITE_SUPABASE_URL is set in .env');
                setProducts(INITIAL_PRODUCTS);
                setLoading(false);
                return;
            }

            try {
                // Fetch Products
                const { data: dbProducts, error: pError } = await supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (pError) throw pError
                
                if (dbProducts && dbProducts.length > 0) {
                    setProducts(dbProducts.map(p => ({
                        ...p,
                        sellerPrice: p.seller_price,
                        sellerName: p.seller_name,
                        isReserved: p.is_reserved || false
                    })))
                } else {
                    setProducts([]) // Start with empty if no DB products
                }

                // Fetch Orders
                const { data: dbOrders, error: oError } = await supabase
                    .from('orders')
                    .select('*')
                    .order('date', { ascending: false })

                if (oError) throw oError
                setOrders((dbOrders || []).map(o => ({
                    ...o,
                    productId: o.product_id,
                    productName: o.product_name,
                    productImage: o.product_image,
                    sellerName: o.seller_name,
                    buyerName: o.buyer_name,
                    buyerEmail: o.buyer_email,
                    buyerPhone: o.buyer_phone,
                    buyerAddress: o.buyer_address,
                    paymentMethod: o.payment_method,
                    deliveryMethod: o.delivery_method,
                    sellerAgreedPrice: o.seller_agreed_price
                })))

                // Setup Real-time Subscriptions
                const productSubscription = supabase
                    .channel('public:products')
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
                        console.log('Product change detected:', payload)
                        fetchData() // Refresh everything or specifically update products
                    })
                    .subscribe()

                const orderSubscription = supabase
                    .channel('public:orders')
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
                        console.log('Order change detected:', payload)
                        fetchData() // Refresh everything or specifically update orders
                    })
                    .subscribe()

                return () => {
                    supabase.removeChannel(productSubscription)
                    supabase.removeChannel(orderSubscription)
                }

            } catch (err) {
                console.error('Supabase fetch error:', err)
                // Fallback to localStorage if Supabase fails
                const savedProducts = localStorage.getItem('sr_products')
                const savedOrders = localStorage.getItem('sr_orders')
                if (savedProducts) {
                    const local = JSON.parse(savedProducts)
                    setProducts(local.map(p => {
                        const initial = INITIAL_PRODUCTS.find(i => i.id === p.id);
                        return (p.id === 'prod-002' || p.id === 'prod-006') ? { ...p, image: initial.image } : p;
                    }))
                }
                else setProducts(INITIAL_PRODUCTS)
                if (savedOrders) setOrders(JSON.parse(savedOrders))
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Persistence Fallback for Offline Mode (existing logic)...
    useEffect(() => {
        if (products.length > 0) localStorage.setItem('sr_products', JSON.stringify(products))
    }, [products])

    useEffect(() => {
        if (orders.length > 0) localStorage.setItem('sr_orders', JSON.stringify(orders))
    }, [orders])

    // ─── Cart Actions ───
    const addToCart = (product, quantity = 1) => {
        setCart(prev => {
            const existingItem = prev.find(item => item.id === product.id)
            if (existingItem) {
                return prev.map(item => 
                    item.id === product.id 
                    ? { ...item, quantity: item.quantity + quantity } 
                    : item
                )
            }
            return [...prev, { ...product, quantity }]
        })
    }

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId))
    }

    const updateCartQuantity = (productId, quantity) => {
        if (quantity < 1) return removeFromCart(productId)
        setCart(prev => prev.map(item => 
            item.id === productId ? { ...item, quantity } : item
        ))
    }

    const clearCart = () => setCart([])

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

    // ─── Favorites Actions ───
    const toggleFavorite = (product) => {
        setFavorites(prev => {
            const exists = prev.find(p => p.id === product.id)
            return exists ? prev.filter(p => p.id !== product.id) : [product, ...prev]
        })
    }
    const isFavorite = (productId) => favorites.some(p => p.id === productId)

    // ─── Product Actions ───
    const addProduct = async (product) => {
        const newProduct = { 
            name: product.name,
            price: product.price,
            seller_price: product.sellerPrice || null,
            seller_name: product.sellerName || null,
            description: product.description || '',
            location: product.location || '',
            category: product.category || 'Furniture',
            image: product.image,
            images: product.images || [],
            status: 'available',
            is_reserved: false
        }

        try {
            const { data, error } = await supabase.from('products').insert([newProduct]).select()
            if (error) throw error
            if (data) {
                const addedResponse = {
                    ...data[0],
                    sellerPrice: data[0].seller_price,
                    sellerName: data[0].seller_name,
                    isReserved: data[0].is_reserved
                }
                setProducts([addedResponse, ...products])
            }
        } catch (err) {
            console.error('Add product error:', err)
            const localProd = { ...newProduct, id: `prod-${Date.now()}`, sellerPrice: newProduct.seller_price, sellerName: newProduct.seller_name }
            setProducts([localProd, ...products])
        }
    }

    const updateProduct = async (id, updates) => {
        try {
            const { error } = await supabase.from('products').update(updates).eq('id', id)
            if (error) throw error
            setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p))
        } catch (err) {
            console.error('Update product error:', err)
            setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p))
        }
    }

    const removeProduct = async (id) => {
        try {
            const { error } = await supabase.from('products').delete().eq('id', id)
            if (error) throw error
            setProducts(products.filter(p => p.id !== id))
        } catch (err) {
            console.error('Remove product error:', err)
            setProducts(products.filter(p => p.id !== id))
        }
    }

    const markProductReserved = (id) => updateProduct(id, { is_reserved: true, status: 'reserved' })
    const markProductSold = (id) => updateProduct(id, { is_reserved: false, status: 'sold' })
    const markProductAvailable = (id) => updateProduct(id, { is_reserved: false, status: 'available' })

    // ─── Order Actions ───
    const addOrder = async (orderData) => {
        const orderId = `SR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`
        const newOrderDb = {
            id: orderId,
            product_id: orderData.productId,
            product_name: orderData.productName,
            product_image: orderData.productImage,
            seller_name: orderData.sellerName,
            amount: orderData.amount,
            buyer_name: orderData.buyerName,
            buyer_email: orderData.buyerEmail,
            buyer_phone: orderData.buyerPhone,
            buyer_address: orderData.buyerAddress,
            payment_method: orderData.paymentMethod,
            delivery_method: null,
            delivery_fee: 0,
            logistics_partner: '',
            pickup_location: '',
            status: 'pending',
            seller_agreed_price: orderData.amount * 0.9,
            commission: orderData.amount * 0.1,
            date: new Date().toISOString()
        }

        const uiOrder = {
            ...newOrderDb,
            productId: newOrderDb.product_id,
            productName: newOrderDb.product_name,
            productImage: newOrderDb.product_image,
            sellerName: newOrderDb.seller_name,
            buyerName: newOrderDb.buyer_name,
            buyerEmail: newOrderDb.buyer_email,
            buyerPhone: newOrderDb.buyer_phone,
            buyerAddress: newOrderDb.buyer_address,
            paymentMethod: newOrderDb.payment_method,
            deliveryMethod: newOrderDb.delivery_method,
            deliveryFee: newOrderDb.delivery_fee,
            logisticsPartner: newOrderDb.logistics_partner,
            pickupLocation: newOrderDb.pickup_location,
            sellerAgreedPrice: newOrderDb.seller_agreed_price
        }

        try {
            const { error } = await supabase.from('orders').insert([newOrderDb])
            if (error) throw error
            setOrders([uiOrder, ...orders])
            if (orderData.productId) markProductReserved(orderData.productId)
            return uiOrder
        } catch (err) {
            console.error('Add order error:', err)
            setOrders([uiOrder, ...orders])
            if (orderData.productId) markProductReserved(orderData.productId)
            return uiOrder
        }
    }

    const updateOrderStatus = async (id, status) => {
        try {
            const { error } = await supabase.from('orders').update({ status }).eq('id', id)
            if (error) throw error
            
            setOrders(orders.map(o => {
                if (o.id !== id) return o
                
                // Per PRD: When order is completed, mark product as sold
                if (status === 'completed' && o.productId) {
                    markProductSold(o.productId)
                }
                
                return { ...o, status }
            }))
        } catch (err) {
            console.error('Update status error:', err)
            setOrders(orders.map(o => o.id === id ? { ...o, status } : o))
        }
    }

    const updateOrderDelivery = async (orderId, delivery_method, delivery_fee = 0, logistics_partner = '') => {
        try {
            const updates = { 
                delivery_method, 
                delivery_fee: parseFloat(delivery_fee), 
                logistics_partner 
            }
            const { error } = await supabase.from('orders').update(updates).eq('id', orderId)
            if (error) throw error
            setOrders(orders.map(o => o.id === orderId ? { 
                ...o, 
                deliveryMethod: delivery_method, 
                deliveryFee: parseFloat(delivery_fee), 
                logisticsPartner: logistics_partner 
            } : o))
        } catch (err) {
            console.error('Update delivery error:', err)
            // Local fallback
            setOrders(orders.map(o => o.id === orderId ? { 
                ...o, 
                deliveryMethod: delivery_method,
                deliveryFee: parseFloat(delivery_fee),
                logisticsPartner: logistics_partner
            } : o))
        }
    }

    const getOrderById = (id) => orders.find(o => o.id === id)

    const categories = useMemo(() => {
        const unique = new Set(products.map(p => p.category))
        return ['All', ...Array.from(unique).sort()]
    }, [products])

    const stats = {
        totalProducts: products.length,
        availableProducts: products.filter(p => !p.is_reserved && p.status !== 'sold').length,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        totalRevenue: orders.reduce((sum, o) => sum + (o.amount || 0), 0),
        platformIncome: orders
            .filter(o => ['paid', 'confirmed', 'shipped', 'delivered', 'completed'].includes(o.status))
            .reduce((sum, o) => sum + (o.commission || Math.round((o.amount || 0) * 0.1)), 0),
    }

    return (
        <StoreContext.Provider value={{
            products,
            orders,
            cart,
            favorites,
            cartTotal,
            cartCount,
            loading,
            stats,
            categories,
            toggleFavorite,
            isFavorite,
            addProduct,
            updateProduct,
            removeProduct,
            addToCart,
            removeFromCart,
            updateCartQuantity,
            clearCart,
            markProductReserved,
            markProductSold,
            markProductAvailable,
            addOrder,
            updateOrderStatus,
            updateOrderDelivery,
            getOrderById,
        }}>
            {children}
        </StoreContext.Provider>
    )
}
