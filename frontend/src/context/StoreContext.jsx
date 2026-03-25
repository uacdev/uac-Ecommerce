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
        const savedCart = localStorage.getItem('ufl_cart')
        if (savedCart) setCart(JSON.parse(savedCart))
        const savedFavs = localStorage.getItem('ufl_favorites')
        if (savedFavs) setFavorites(JSON.parse(savedFavs))
    }, [])

    // Persistence save for Cart
    useEffect(() => {
        localStorage.setItem('ufl_cart', JSON.stringify(cart))
    }, [cart])

    // Persistence save for Favorites
    useEffect(() => {
        localStorage.setItem('ufl_favorites', JSON.stringify(favorites))
    }, [favorites])

    // Initial Fetch (existing logic)...
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            
            // NOTE: For UAC Demo, we use INITIAL_PRODUCTS to ensure official branding
            setProducts(INITIAL_PRODUCTS);

            if (!supabase.supabaseUrl) {
                setLoading(false);
                return;
            }

            try {
                // We still fetch orders to keep the admin functionality working
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

            } catch (err) {
                console.error('Supabase fetch error:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Persistence Fallback for Offline Mode (existing logic)...
    useEffect(() => {
        if (products.length > 0) localStorage.setItem('ufl_products', JSON.stringify(products))
    }, [products])

    useEffect(() => {
        if (orders.length > 0) localStorage.setItem('ufl_orders', JSON.stringify(orders))
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
            category: product.category || 'General',
            image: product.image,
            images: product.images || [],
            status: product.status || 'available',
            delivery_timeframe: product.delivery_timeframe || '',
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
        // Map camelCase to snake_case for DB
        const dbUpdates = { ...updates }
        if (updates.sellerPrice !== undefined) {
            dbUpdates.seller_price = updates.sellerPrice
            delete dbUpdates.sellerPrice
        }
        if (updates.sellerName !== undefined) {
            dbUpdates.seller_name = updates.sellerName
            delete dbUpdates.sellerName
        }
        if (updates.delivery_timeframe !== undefined) {
            dbUpdates.delivery_timeframe = updates.delivery_timeframe
        }
        
        try {
            const { error } = await supabase.from('products').update(dbUpdates).eq('id', id)
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
        const orderId = `UFL-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`
        
        // Financial Split for SAP Reconciliation
        const deliveryFee = orderData.deliveryFee || 0
        const productAmount = orderData.amount - deliveryFee 
        const commission = productAmount * 0.1

        // Fulfillment Logic (PRD Section 4.1/4.2/4.3)
        const fulfillmentType = orderData.fulfillmentType || 'delivery'
        const pickupCode = fulfillmentType === 'pickup' ? `UFL-${Math.random().toString(36).substring(2, 7).toUpperCase()}` : null

        const newOrderDb = {
            id: orderId,
            product_id: orderData.productId,
            product_name: orderData.productName,
            product_image: orderData.productImage,
            seller_name: orderData.sellerName,
            amount: orderData.amount, // Total
            product_amount: productAmount,
            delivery_fee: deliveryFee,
            buyer_name: orderData.buyerName,
            buyer_email: orderData.buyerEmail,
            buyer_phone: orderData.buyerPhone,
            buyer_address: orderData.buyerAddress,
            payment_method: orderData.paymentMethod,
            fulfillment_type: fulfillmentType,
            pickup_location: orderData.pickupLocation || '',
            pickup_code: pickupCode,
            pickup_time: orderData.pickupTime || '',
            delivery_method: orderData.deliveryMethod || 'pending',
            logistics_partner: '',
            pickup_location: '',
            status: 'pending',
            seller_agreed_price: productAmount - commission,
            commission: commission,
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
            fulfillmentType: newOrderDb.fulfillment_type,
            pickupLocation: newOrderDb.pickup_location,
            pickupCode: newOrderDb.pickup_code,
            pickupTime: newOrderDb.pickup_time,
            deliveryMethod: newOrderDb.delivery_method,
            deliveryFee: newOrderDb.delivery_fee,
            productAmount: newOrderDb.product_amount,
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
