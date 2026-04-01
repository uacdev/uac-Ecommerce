export let products: any[] = [
    {
        id: '1',
        name: 'Gala Sausage Roll',
        price: 1500,
        seller_price: 1350,
        seller_name: 'UAC Foods',
        description: 'Nutritious and delicious sausage roll',
        location: 'Lagos',
        category: 'Snacks',
        image: '/images/gala.jpg',
        images: ['/images/gala.jpg'],
        status: 'available',
        delivery_timeframe: '1-2 days',
        is_reserved: false,
        created_at: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Swan Natural Spring Water',
        price: 300,
        seller_price: 270,
        seller_name: 'UAC Foods',
        description: 'Pure natural spring water from the hills of Kerang.',
        location: 'Plateau',
        category: 'Beverages',
        image: '/images/swan_water.jpg',
        images: ['/images/swan_water.jpg'],
        status: 'available',
        delivery_timeframe: '1-2 days',
        is_reserved: false,
        created_at: new Date().toISOString()
    },
    {
        id: '3',
        name: 'Supreme Ice Cream',
        price: 4500,
        seller_price: 4050,
        seller_name: 'UAC Foods',
        description: 'Creamy and rich vanilla ice cream.',
        location: 'Lagos',
        category: 'Desserts',
        image: '/images/supreme_ice_cream.jpg',
        images: ['/images/supreme_ice_cream.jpg'],
        status: 'available',
        delivery_timeframe: 'Same day',
        is_reserved: false,
        created_at: new Date().toISOString()
    }
];

export let orders: any[] = [];
export let customers: any[] = [];

export const db = {
    products: {
        getAll: () => [...products].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        create: (p: any) => { const newP = { id: Date.now().toString(), created_at: new Date().toISOString(), ...p }; products.push(newP); return newP; },
        update: (id: string, curr: any) => { 
            const index = products.findIndex(p => p.id === id); 
            if (index > -1) { products[index] = { ...products[index], ...curr }; return products[index]; } 
            return null; 
        },
        delete: (id: string) => { products = products.filter(p => p.id !== id); return true; }
    },
    orders: {
        getAll: () => [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        create: (o: any) => { const newO = { id: `UFL-${Date.now()}`, date: new Date().toISOString(), ...o }; orders.unshift(newO); return newO; },
        updateStatus: (id: string, status: string) => {
            const index = orders.findIndex(o => o.id === id); 
            if (index > -1) { orders[index].status = status; return orders[index]; } 
            return null;
        },
        updateDelivery: (id: string, updates: any) => {
            const index = orders.findIndex(o => o.id === id); 
            if (index > -1) { orders[index] = { ...orders[index], ...updates }; return orders[index]; } 
            return null;
        }
    }
}
