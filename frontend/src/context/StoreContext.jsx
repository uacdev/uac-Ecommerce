import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { PRODUCTS as INITIAL_PRODUCTS } from '../data/products'
import { productApi, orderApi, statsApi } from '../api/client'

const StoreContext = createContext()

export const useStore = () => useContext(StoreContext)

export const StoreProvider = ({ children }) => {
    const [products, setProducts] = useState([])
    const [orders, setOrders] = useState([])
    const [cart, setCart] = useState([])
    const [favorites, setFavorites] = useState([])
    const [loading, setLoading] = useState(true)
    const [apiStats, setApiStats] = useState(null)

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

    // Initial Fetch - Now using Unified API
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            
            try {
                // Parallel fetch for speed
                const [pRes, oRes, sRes] = await Promise.allSettled([
                    productApi.getAll(),
                    orderApi.getAll(),
                    statsApi.getKpis()
                ]);

                // Handle Products
                if (pRes.status === 'fulfilled') {
                    const fetchedProducts = pRes.value.data.data;
                    // Merge with INITIAL_PRODUCTS for branding if DB is empty, or just use DB
                    setProducts(fetchedProducts.length > 0 ? fetchedProducts : INITIAL_PRODUCTS);
                } else {
                    setProducts(INITIAL_PRODUCTS);
                }

                // Handle Orders
                if (oRes.status === 'fulfilled') {
                    const dbOrders = oRes.value.data.data || [];
                    setOrders(dbOrders.map(o => ({
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
                    })));
                }

                // Handle Stats
                if (sRes.status === 'fulfilled') {
                    setApiStats(sRes.value.data.data);
                }

            } catch (err) {
                console.error('API fetch error:', err)
                setProducts(INITIAL_PRODUCTS); // Fallback
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
        const productPayload = { 
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
            const res = await productApi.create(productPayload);
            const added = res.data.data;
            setProducts([{
                ...added,
                sellerPrice: added.seller_price,
                sellerName: added.seller_name
            }, ...products]);
        } catch (err) {
            console.error('Add product error:', err)
            // Local fallback for demo
            setProducts([{ ...productPayload, id: `local-${Date.now()}` }, ...products])
        }
    }

    const updateProduct = async (id, updates) => {
        try {
            // Note: API updates expect snake_case but we'll handle mapping in controller or here
            await productApi.update(id, updates);
            setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p))
        } catch (err) {
            console.error('Update product error:', err)
            setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p))
        }
    }

    const removeProduct = async (id) => {
        try {
            await productApi.delete(id);
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
        const orderId = `UAC-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`
        
        // Financial Split for SAP Reconciliation
        const deliveryFee = orderData.deliveryFee || 0
        const productAmount = orderData.amount - deliveryFee 
        const commission = productAmount * 0.1

        // Fulfillment Logic (PRD Section 4.1/4.2/4.3)
        const fulfillmentType = orderData.fulfillmentType || 'delivery'
        const pickupCode = fulfillmentType === 'pickup' ? `UAC-${Math.random().toString(36).substring(2, 7).toUpperCase()}` : null

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
            await orderApi.create(newOrderDb)
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
            await orderApi.updateStatus(id, status);
            setOrders(orders.map(o => {
                if (o.id !== id) return o
                if (status === 'completed' && o.productId) markProductSold(o.productId)
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
            await orderApi.updateDelivery(orderId, updates)
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

    const [businessSegments, setBusinessSegments] = useState([
        { name: 'Gala', desc: 'Sausage rolls', abstract: 'Snacks' }, 
        { name: 'Supreme', desc: 'Ice cream variants', abstract: 'Desserts' }, 
        { name: 'Swan', desc: 'Natural spring water', abstract: 'Beverages' }, 
        { name: 'Funtime', desc: 'Cupcakes', abstract: 'Snacks' }
    ])

    const [adminProfile, setAdminProfile] = useState({ fullName: 'Sarah Johnson', email: 's.johnson@uacfoods.com', photo: '' })
    const getOrderById = (id) => orders.find(o => o.id === id)

    const addCategory = (newCat) => setBusinessSegments(prev => [...prev, newCat])

    const categories = useMemo(() => {
        const unique = new Set([...businessSegments.map(c => c.name), ...products.map(p => p.category)])
        return ['All', ...Array.from(unique).sort()]
    }, [products, businessSegments])

    const stats = useMemo(() => ({
        totalProducts: apiStats?.totalProducts || products.length,
        availableProducts: products.filter(p => !p.is_reserved && p.status !== 'sold').length,
        totalOrders: apiStats?.totalOrders || orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        totalRevenue: apiStats?.totalRevenue || orders.reduce((sum, o) => sum + (o.amount || 0), 0),
        totalCustomers: apiStats?.totalCustomers || 0,
        platformIncome: orders
            .filter(o => ['paid', 'confirmed', 'shipped', 'delivered', 'completed'].includes(o.status))
            .reduce((sum, o) => sum + (o.commission || Math.round((o.amount || 0) * 0.1)), 0),
    }), [products, orders, apiStats])

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
            adminProfile, setAdminProfile,
            categories,
            businessSegments,
            addCategory,
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
