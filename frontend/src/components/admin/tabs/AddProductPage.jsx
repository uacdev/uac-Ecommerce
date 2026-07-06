import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, UploadCloud, Download, FileText } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { uploadApi } from '../../../api/client';
import Papa from 'papaparse';

const LOCATIONS = ['Ojota', 'Oregun', 'Kerang'];

const normalizeCategoryKey = (category = '') => String(category || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '');

const PRODUCT_NAMES_BY_CATEGORY = {
    swan: ['50CL', '75CL', '150CL'],
    supreme: ['3LITRES', '2LITRES', '900ML', '450ML', '220ML', '120ML', 'ORANGE LOLLY', 'FUNBLAST', '90ML VANILLA POUCH', '130ML VANILLA POUCH', '120ML YOGHURT'],
    gala: ['GALA CLASSIC 60G', 'GALA ODOGWO 120G', 'COCKTAIL'],
    funtime: ['FUNTIME COCOUNT CHIPS', 'FUNTIME COCOUNT JAR', 'GALA CHIN CHIN'],
    zuri: ['ZURI CLASSIC 10G', 'ZURI JOLLOF 10G', 'ZURI CHICKEN 10', 'ZURI CLASSIC 100G', 'ZURI BEEF 100G', 'ZURI JOLLOF 100G', 'ZURI CHICKEN 100G', 'ZURI BEEF 10G'],
    kingswaybread: ['Jumbo 1300g', 'Family Loaf 800g', 'Midi Loaf 400g']
};

const PACKAGING_BY_PRODUCT_NAME = {
    '50CL': [{ label: '50CL', value: '50CL', price: 2018.14 }],
    '75CL': [
        { label: '75CL', value: '75CL', price: 2609.17 },
        { label: '75CL', value: '75CL', price: 4156.17 }
    ],
    '150CL': [{ label: '150CL', value: '150CL', price: 2279.61 }],
    '3LITRES': [{ label: '3LITRES', value: '3LITRES', price: 17199.60 }],
    '2LITRES': [{ label: '2LITRES', value: '2LITRES', price: 21496.20 }],
    '900ML': [{ label: '900ML', value: '900ML', price: 39414.10 }],
    '450ML': [{ label: '450ML', value: '450ML', price: 22781.85 }],
    '220ML': [{ label: '220ML', value: '220ML', price: 18331.50 }],
    '120ML': [{ label: '120ML', value: '120ML', price: 19431.50 }],
    'ORANGE LOLLY': [{ label: 'ORANGE LOLLY', value: 'ORANGE LOLLY', price: 2902.90 }],
    'FUNBLAST': [{ label: 'FUNBLAST', value: 'FUNBLAST', price: 24933.00 }],
    '90ML VANILLA POUCH': [{ label: '90ML VANILLA POUCH', value: '90ML VANILLA POUCH', price: 6800.00 }],
    '130ML VANILLA POUCH': [{ label: '130ML VANILLA POUCH', value: '130ML VANILLA POUCH', price: 7550.00 }],
    '120ML YOGHURT': [{ label: '120ML YOGHURT', value: '120ML YOGHURT', price: 5350.00 }],
    'GALA CLASSIC 60G': [{ label: 'GALA CLASSIC 60G', value: 'GALA CLASSIC 60G', price: 4200.00 }],
    'GALA ODOGWO 120G': [{ label: 'GALA ODOGWO 120G', value: 'GALA ODOGWO 120G', price: 10500.00 }],
    'COCKTAIL': [{ label: 'COCKTAIL', value: 'COCKTAIL', price: 3700.00 }],
    'FUNTIME COCOUNT CHIPS': [{ label: 'FUNTIME COCOUNT CHIPS', value: 'FUNTIME COCOUNT CHIPS', price: 3596.00 }],
    'FUNTIME COCOUNT JAR': [{ label: 'FUNTIME COCOUNT JAR', value: 'FUNTIME COCOUNT JAR', price: 13800.00 }],
    'GALA CHIN CHIN': [{ label: 'GALA CHIN CHIN', value: 'GALA CHIN CHIN', price: 7725.00 }],
    'ZURI CLASSIC 10G': [{ label: 'ZURI CLASSIC 10G', value: 'ZURI CLASSIC 10G', price: 21000.00 }],
    'ZURI JOLLOF 10G': [{ label: 'ZURI JOLLOF 10G', value: 'ZURI JOLLOF 10G', price: 21000.00 }],
    'ZURI CHICKEN 10': [{ label: 'ZURI CHICKEN 10', value: 'ZURI CHICKEN 10', price: 21000.00 }],
    'ZURI CLASSIC 100G': [{ label: 'ZURI CLASSIC 100G', value: 'ZURI CLASSIC 100G', price: 21000.00 }],
    'ZURI BEEF 100G': [{ label: 'ZURI BEEF 100G', value: 'ZURI BEEF 100G', price: 21000.00 }],
    'ZURI JOLLOF 100G': [{ label: 'ZURI JOLLOF 100G', value: 'ZURI JOLLOF 100G', price: 21000.00 }],
    'ZURI CHICKEN 100G': [{ label: 'ZURI CHICKEN 100G', value: 'ZURI CHICKEN 100G', price: 21000.00 }],
    'ZURI BEEF 10G': [{ label: 'ZURI BEEF 10G', value: 'ZURI BEEF 10G', price: 21000.00 }],
    'Jumbo 1300g': [{ label: 'Jumbo 1300g', value: 'Jumbo 1300g', price: 1850.00 }],
    'Family Loaf 800g': [{ label: 'Family Loaf 800g', value: 'Family Loaf 800g', price: 1400.00 }],
    'Midi Loaf 400g': [{ label: 'Midi Loaf 400g', value: 'Midi Loaf 400g', price: 700.00 }]
};

const STOCK_UNIT_BY_PRODUCT_NAME = {
    '50CL': 'pack',
    '75CL': 'pack',
    '150CL': 'pack',
    '3LITRES': 'pack',
    '2LITRES': 'pack',
    '900ML': 'pack',
    '450ML': 'pack',
    '220ML': 'pack',
    '120ML': 'pack',
    'ORANGE LOLLY': 'pack',
    'FUNBLAST': 'pack',
    '90ML VANILLA POUCH': 'pack',
    '130ML VANILLA POUCH': 'pack',
    '120ML YOGHURT': 'pack',
    'GALA CLASSIC 60G': 'carton',
    'GALA ODOGWO 120G': 'carton',
    'COCKTAIL': 'carton',
    'FUNTIME COCOUNT CHIPS': 'carton',
    'FUNTIME COCOUNT JAR': 'carton',
    'GALA CHIN CHIN': 'carton',
    'ZURI CLASSIC 10G': 'carton',
    'ZURI JOLLOF 10G': 'carton',
    'ZURI CHICKEN 10': 'carton',
    'ZURI CLASSIC 100G': 'carton',
    'ZURI BEEF 100G': 'carton',
    'ZURI JOLLOF 100G': 'carton',
    'ZURI CHICKEN 100G': 'carton',
    'ZURI BEEF 10G': 'carton',
    'Jumbo 1300g': 'piece',
    'Family Loaf 800g': 'piece',
    'Midi Loaf 400g': 'piece'
};

const STOCK_UNIT_BY_CATEGORY = {
    swan: 'pack',
    supreme: 'pack',
    gala: 'carton',
    funtime: 'carton',
    zuri: 'carton',
    kingswaybread: 'piece'
};

const AddProductPage = ({ product, onClose }) => {
    const { addProduct, updateProduct, bulkAddProducts, businessSegments, products } = useStore();
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
    // 'single' or 'bulk'
    const [uploadMode, setUploadMode] = useState('single');
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        description: '',
        category: '',
        image: '',
        location: '',
        packaging: '',
        price: '',
        stockCount: ''
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                brand: product.brand || product.category || '',
                description: product.description || '',
                category: product.category || '',
                image: product.image || '',
                location: product.location || '',
                packaging: product.packaging || '',
                price: product.price ?? '',
                stockCount: product.stockCount ?? ''
            });
        }
    }, [product]);

    const packagingOptions = useMemo(() => {
        const categoryKey = normalizeCategoryKey(formData.category);
        const matchingCategory = businessSegments.find((segment) => normalizeCategoryKey(segment?.name) === categoryKey);
        const productOptions = formData.name ? PACKAGING_BY_PRODUCT_NAME[formData.name] || [] : [];
        return productOptions.length > 0 ? productOptions : (matchingCategory?.packagingOptions || []);
    }, [businessSegments, formData.category, formData.name]);

    const productNameOptions = useMemo(() => {
        const categoryKey = normalizeCategoryKey(formData.category);
        if (!categoryKey) return [];

        return PRODUCT_NAMES_BY_CATEGORY[categoryKey] || [];
    }, [formData.category]);

    const stockUnit = useMemo(() => {
        const categoryKey = normalizeCategoryKey(formData.category);
        if (formData.name) {
            return STOCK_UNIT_BY_PRODUCT_NAME[formData.name] || STOCK_UNIT_BY_CATEGORY[categoryKey] || 'unit';
        }
        return STOCK_UNIT_BY_CATEGORY[categoryKey] || 'unit';
    }, [formData.category, formData.name]);

    const stockUnitLabel = stockUnit === 'carton' ? 'carton' : stockUnit === 'pack' ? 'pack' : stockUnit === 'piece' ? 'piece' : 'unit';
    const packagingFieldLabel = stockUnit === 'carton' ? 'Cartons' : stockUnit === 'pack' ? 'Packs / Pieces' : stockUnit === 'piece' ? 'Pieces' : 'Packs / Pieces';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            if (name === 'category') {
                return { ...prev, category: value, brand: value, name: '', packaging: '', price: '' };
            }
            if (name === 'name') {
                const nextName = value;
                const categoryKey = normalizeCategoryKey(prev.category);
                const matchingCategory = businessSegments.find((segment) => normalizeCategoryKey(segment?.name) === categoryKey);
                const productOptions = nextName ? PACKAGING_BY_PRODUCT_NAME[nextName] || [] : [];
                const fallbackOption = productOptions[0] || matchingCategory?.packagingOptions?.[0];

                return {
                    ...prev,
                    name: nextName,
                    packaging: fallbackOption?.value || '',
                    price: fallbackOption?.price != null ? String(Number(fallbackOption.price)) : ''
                };
            }
            if (name === 'packaging') {
                const selectedOption = e.target.selectedOptions?.[0];
                const selectedPrice = selectedOption?.getAttribute('data-price');
                return {
                    ...prev,
                    packaging: value,
                    price: selectedPrice ? String(Number(selectedPrice)) : ''
                };
            }
            return { ...prev, [name]: value };
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setError('');
        setUploadingImage(true);
        try {
            const res = await uploadApi.image(file);
            const url = res.data?.data?.url;
            if (url) setFormData(prev => ({ ...prev, image: url }));
            else setError('Upload returned no URL');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Image upload failed');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.location) return setError('Please select a product location.');
        if (!formData.category) return setError('Please select a product category.');
        if (!formData.price) return setError('Please enter a price.');
        if (formData.stockCount === '' || formData.stockCount === null) return setError('Please enter the stock count.');

        setLoading(true);
        const payload = {
            name: formData.name.trim(),
            brand: formData.brand.trim(),
            description: formData.description.trim(),
            category: formData.category,
            image: formData.image,
            location: formData.location,
            packaging: formData.packaging.trim(),
            price: Number(formData.price),
            stockCount: Math.max(0, Math.floor(Number(formData.stockCount) || 0))
        };

        try {
            const res = product
                ? await updateProduct(product.id || product._id, payload)
                : await addProduct(payload);
            if (res?.success === false) {
                setError(res.message || 'Could not save product.');
            } else {
                onClose();
            }
        } catch (err) {
            setError(err?.response?.data?.message || err.message || 'Could not save product.');
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const headers = ['name', 'brand', 'category', 'location', 'price', 'stockCount', 'packaging', 'description'];
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(',');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "bulk_product_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleBulkUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setError('');
        setSuccessMsg('');
        setLoading(true);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                if (results.errors.length > 0) {
                    setError('Error parsing CSV file. Please check the format.');
                    setLoading(false);
                    return;
                }

                try {
                    const res = await bulkAddProducts(results.data);
                    if (res.success) {
                        setSuccessMsg(`Successfully imported ${res.count} products.`);
                        setTimeout(() => onClose(), 2000);
                    } else {
                        setError(res.message || 'Bulk upload failed.');
                    }
                } catch (err) {
                    setError('An error occurred during bulk upload.');
                } finally {
                    setLoading(false);
                }
            },
            error: () => {
                setError('Failed to read the file.');
                setLoading(false);
            }
        });
        
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="font-['Sen',sans-serif] text-[var(--text-primary)] pb-10"
        >
            <div className="max-w-5xl mx-auto py-2">
                <div className="flex justify-between items-center mb-6 border-b border-[var(--divider)] pb-6">
                    <h1 className="text-3xl font-bold tracking-tight text-[#0f2e53] dark:text-blue-100">
                        {product ? 'Edit Product' : 'Add New Product'}
                    </h1>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-all">
                        <X size={24} className="text-[var(--text-muted)]" />
                    </button>
                </div>

                {!product && (
                    <div className="flex gap-4 mb-8">
                        <button
                            onClick={() => setUploadMode('single')}
                            className={`px-6 py-2.5 rounded-xl font-bold text-[13px] transition-all ${uploadMode === 'single' ? 'bg-[#0f2e53] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                        >
                            Single Upload
                        </button>
                        <button
                            onClick={() => setUploadMode('bulk')}
                            className={`px-6 py-2.5 rounded-xl font-bold text-[13px] transition-all flex items-center gap-2 ${uploadMode === 'bulk' ? 'bg-[#0f2e53] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                        >
                            <UploadCloud size={16} /> Bulk Upload
                        </button>
                    </div>
                )}
                
                {error && (
                    <div className="px-4 py-3 mb-6 rounded-xl bg-red-50 dark:bg-red-950/30 text-[#ed0000] text-[12px] font-bold">
                        {error}
                    </div>
                )}

                {successMsg && (
                    <div className="px-4 py-3 mb-6 rounded-xl bg-green-50 dark:bg-green-950/30 text-green-700 text-[12px] font-bold">
                        {successMsg}
                    </div>
                )}

                {uploadMode === 'bulk' ? (
                    <div className="bg-[var(--bg-tertiary)] border border-[var(--divider)] rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-6">
                        <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center text-[var(--text-muted)]">
                            <FileText size={32} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">Bulk Upload Products</h3>
                            <p className="text-[13px] text-[var(--text-muted)] mt-2 max-w-md mx-auto">
                                Download the CSV template, fill in your product details, and upload to add multiple products at once.
                            </p>
                            <p className="text-[12px] mt-2 text-[#0f2e53] dark:text-blue-300 font-semibold max-w-md mx-auto">
                                💡 No image needed — each product automatically inherits the cover image from its category.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-4">
                            <button 
                                onClick={downloadTemplate}
                                className="px-6 py-3 border border-[var(--divider)] rounded-xl font-bold text-[13px] flex items-center gap-2 hover:bg-[var(--bg-secondary)] transition-all"
                            >
                                <Download size={16} /> Download Template
                            </button>
                            
                            <div className="relative">
                                <button 
                                    disabled={loading}
                                    className="px-6 py-3 bg-[#0f2e53] text-white rounded-xl font-bold text-[13px] flex items-center gap-2 hover:bg-[#0a1f38] transition-all disabled:opacity-50"
                                >
                                    <UploadCloud size={16} /> {loading ? 'Uploading...' : 'Upload CSV File'}
                                </button>
                                <input 
                                    type="file" 
                                    accept=".csv" 
                                    ref={fileInputRef}
                                    onChange={handleBulkUpload}
                                    disabled={loading}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Row 1 — category / brand */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[12px] font-bold text-[var(--text-primary)]">Product Type (Category) *</label>
                                <select
                                    name="category" value={formData.category} onChange={handleChange} required
                                    className="w-full border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#0f2e53]"
                                >
                                    <option value="">Select product type</option>
                                    {businessSegments.map(seg => (
                                        <option key={seg._id || seg.name} value={seg.name}>{seg.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[12px] font-bold text-[var(--text-primary)]">Brand</label>
                                <input
                                    name="brand" value={formData.brand} readOnly
                                    placeholder="Auto-filled from category"
                                    className="w-full border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#0f2e53] cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Row 2 — product name / location */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[12px] font-bold text-[var(--text-primary)]">Name of Product *</label>
                                <select
                                    name="name" value={formData.name} onChange={handleChange} required
                                    disabled={!formData.category}
                                    className="w-full border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#0f2e53] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">Select product name</option>
                                    {productNameOptions.map((productName) => (
                                        <option key={productName} value={productName}>{productName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[12px] font-bold text-[var(--text-primary)]">Location *</label>
                                <select
                                    name="location" value={formData.location} onChange={handleChange} required
                                    className="w-full border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#0f2e53]"
                                >
                                    <option value="">Select product location</option>
                                    {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Row 3 — description */}
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-[var(--text-primary)]">Description</label>
                            <textarea
                                name="description" value={formData.description} onChange={handleChange}
                                placeholder="Short description shown on the product page"
                                className="w-full border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#0f2e53] h-[110px] resize-none"
                            />
                        </div>

                        {/* Row 4 — image */}
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-[var(--text-primary)]">Product Image</label>
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1 border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl flex items-center px-4 py-2.5">
                                    <span className="bg-gray-500 text-white text-[10px] px-3 py-1.5 rounded mr-3 font-bold">{uploadingImage ? 'Uploading…' : 'Choose file'}</span>
                                    <span className="text-[12px] text-[var(--text-muted)] truncate max-w-[260px]">
                                        {uploadingImage ? 'Sending to server…' : (formData.image ? 'Uploaded ✓' : 'No file chosen')}
                                    </span>
                                    <input type="file" onChange={handleFileChange} disabled={uploadingImage} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                </div>
                                {formData.image && (
                                    <img src={formData.image} alt="" className="w-16 h-16 object-cover rounded-xl border border-[var(--divider)]" />
                                )}
                            </div>
                        </div>

                        {/* Row 5 — packaging + price */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[12px] font-bold text-[var(--text-primary)]">
                                    {packagingFieldLabel}
                                    {!formData.category && <span className="text-[var(--text-muted)] font-medium ml-1">(pick a category first)</span>}
                                </label>
                                <select
                                    name="packaging" value={formData.packaging} onChange={handleChange}
                                    disabled={!formData.category || !formData.name || packagingOptions.length === 0}
                                    className="w-full border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#0f2e53] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">Select packaging</option>
                                    {packagingOptions.map((option) => (
                                        <option key={option.value} value={option.value} data-price={option.price}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[12px] font-bold text-[var(--text-primary)]">Price (₦) *</label>
                                <input
                                    name="price" type="number" min="0" step="1"
                                    value={formData.price} onChange={handleChange} required
                                    disabled={!formData.category || !formData.name || !formData.packaging}
                                    placeholder="e.g. 1500"
                                    className="w-full border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#0f2e53] disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[12px] font-bold text-[var(--text-primary)]">
                                    Stock count ({stockUnitLabel}) *
                                    {Number(formData.stockCount) === 0 && formData.stockCount !== '' && (
                                        <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-[#ed0000]">Out of stock</span>
                                    )}
                                </label>
                                <input
                                    name="stockCount" type="number" min="0" step="1"
                                    value={formData.stockCount} onChange={handleChange} required
                                    placeholder={`e.g. 10 ${stockUnitLabel}s`}
                                    className="w-full border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#0f2e53]"
                                />
                                <p className="text-[10px] text-[var(--text-muted)] font-medium">Enter the number of {stockUnitLabel}s in stock. This is the main inventory unit for the selected product.</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-6 border-t border-[var(--divider)]">
                            <button type="button" onClick={onClose} className="px-8 py-3 rounded-xl border border-[var(--divider)] font-bold text-[13px] hover:bg-[var(--bg-secondary)] transition-all">
                                Cancel
                            </button>
                            <button type="submit" disabled={loading} className="px-8 py-3 bg-[#0f2e53] text-white rounded-xl font-bold text-[13px] hover:bg-[#0a1f38] transition-all disabled:opacity-50">
                                {loading ? 'Saving…' : (product ? 'Save changes' : 'Save product')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </motion.div>
    );
};

export default AddProductPage;

