import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, UploadCloud, Download, FileText } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { uploadApi } from '../../../api/client';
import Papa from 'papaparse';

const LOCATIONS = ['Ojota', 'Oregun', 'Kerang'];

const PACKAGING_LABEL_BY_CATEGORY = {
    Swan: 'Size in Pack',
    Supreme: 'Packs / Pieces',
    Gala: 'Cartons / Pieces',
    Funtime: 'Cartons / Pieces',
    Zuri: 'Pieces'
};

const PACKAGING_PLACEHOLDER_BY_CATEGORY = {
    Swan: 'e.g. 75cl x 12',
    Supreme: 'e.g. 1 pack of 24 pieces',
    Gala: 'e.g. 1 carton of 24 pieces',
    Funtime: 'e.g. 1 carton of 12 pieces',
    Zuri: 'e.g. 6 pieces'
};

const AddProductPage = ({ product, onClose }) => {
    const { addProduct, updateProduct, bulkAddProducts, businessSegments } = useStore();
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
                brand: product.brand || '',
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

    const packagingLabel = useMemo(
        () => PACKAGING_LABEL_BY_CATEGORY[formData.category] || 'Packaging',
        [formData.category]
    );
    const packagingPlaceholder = useMemo(
        () => PACKAGING_PLACEHOLDER_BY_CATEGORY[formData.category] || 'Specify packaging',
        [formData.category]
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
                        {/* Row 1 — identity */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[12px] font-bold text-[var(--text-primary)]">Name of Product *</label>
                                <input
                                    name="name" value={formData.name} onChange={handleChange} required
                                    placeholder="e.g. Gala Sausage Roll"
                                    className="w-full border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#0f2e53]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[12px] font-bold text-[var(--text-primary)]">Brand</label>
                                <input
                                    name="brand" value={formData.brand} onChange={handleChange}
                                    placeholder="e.g. Gala Cocktail"
                                    className="w-full border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#0f2e53]"
                                />
                            </div>
                        </div>

                        {/* Row 2 — category / location */}
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
                                    {packagingLabel}
                                    {!formData.category && <span className="text-[var(--text-muted)] font-medium ml-1">(pick a category first)</span>}
                                </label>
                                <input
                                    name="packaging" value={formData.packaging} onChange={handleChange}
                                    disabled={!formData.category}
                                    placeholder={packagingPlaceholder}
                                    className="w-full border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#0f2e53] disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[12px] font-bold text-[var(--text-primary)]">Price (₦) *</label>
                                <input
                                    name="price" type="number" min="0" step="1"
                                    value={formData.price} onChange={handleChange} required
                                    placeholder="e.g. 1500"
                                    className="w-full border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#0f2e53]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[12px] font-bold text-[var(--text-primary)]">
                                    Stock count *
                                    {Number(formData.stockCount) === 0 && formData.stockCount !== '' && (
                                        <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-[#ed0000]">Out of stock</span>
                                    )}
                                </label>
                                <input
                                    name="stockCount" type="number" min="0" step="1"
                                    value={formData.stockCount} onChange={handleChange} required
                                    placeholder="e.g. 100"
                                    className="w-full border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#0f2e53]"
                                />
                                <p className="text-[10px] text-[var(--text-muted)] font-medium">Auto-decreases on each order. 0 marks the product out of stock.</p>
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

