import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Minus, Image as ImageIcon } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';

const AddProductPage = ({ product, onClose }) => {
    const { addProduct, updateProduct, categories } = useStore();
    const [loading, setLoading] = useState(false);
    
    // UAC Foods Specific Field adapting FMCG to the Design template
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        category: '',
        price: '',
        image: '',
        description: '',
        body: '',
        location: '',
        dietary_info: '',
        shelf_life: '',
        shipping_type: '',
        weight: '',
        pack_size: '',
        qualities: '',
        package_content: '',
        storage: ''
    });

    const [features, setFeatures] = useState(['']);
    
    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                brand: product.brand || '',
                category: product.category || '',
                price: product.price || '',
                image: product.image || '',
                description: product.description || '',
                body: product.body || '',
                location: product.location || '',
                dietary_info: product.dietary_info || '',
                shelf_life: product.shelf_life || '',
                shipping_type: product.shipping_type || '',
                weight: product.weight || '',
                pack_size: product.pack_size || '',
                qualities: product.qualities || '',
                package_content: product.package_content || '',
                storage: product.storage || ''
            });
            setFeatures(product.features?.length ? product.features : ['']);
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFeatureChange = (index, val) => {
        const newFeatures = [...features];
        newFeatures[index] = val;
        setFeatures(newFeatures);
    };

    const addFeature = () => setFeatures([...features, '']);
    const removeFeature = (index) => {
        if (features.length > 1) {
            setFeatures(features.filter((_, i) => i !== index));
        }
    };

    const handleFileChange = (e) => {
        // Mocking file upload
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: URL.createObjectURL(file) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const finalData = { ...formData, features: features.filter(f => f.trim() !== '') };
            if (product) {
                await updateProduct(product.id, finalData);
            } else {
                await addProduct(finalData);
            }
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="font-['Sen',sans-serif] text-[var(--text-primary)] pb-10"
        >
            <div className="max-w-7xl mx-auto py-2">
                <div className="flex justify-between items-center mb-10 border-b border-[var(--divider)] pb-6">
                    <h1 className="text-3xl font-bold tracking-tight text-[#0f2e53] dark:text-blue-100">{product ? 'Edit Product' : 'Add New Product'}</h1>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-all">
                        <X size={24} className="text-[var(--text-muted)]" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-[var(--text-primary)]">Title</label>
                            <input name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Gala Sausage Roll" className="w-full border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#0f2e53]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-[var(--text-primary)]">Brand</label>
                            <input name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g. UAC Foods, Supreme" className="w-full border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#0f2e53]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-[var(--text-primary)]">Product Type (Category)</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#0f2e53]">
                                <option value="">Select product type</option>
                                {categories && categories.filter(c => c !== 'All').map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-[var(--text-primary)]">Product Image</label>
                            <div className="relative w-full border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl flex items-center px-4 py-2.5">
                                <span className="bg-gray-500 text-white text-[10px] px-3 py-1.5 rounded mr-3 font-bold">Choose file</span>
                                <span className="text-[12px] text-[var(--text-muted)] truncate max-w-[150px]">{formData.image ? 'File selected' : 'No file chosen'}</span>
                                <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-[var(--text-primary)]">Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#0f2e53] h-[100px] resize-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-[var(--text-primary)]">Body / Detailed Composition</label>
                            <textarea name="body" value={formData.body} onChange={handleChange} className="w-full border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#0f2e53] h-[100px] resize-none" />
                        </div>
                    </div>

                    {/* Row 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-[var(--text-primary)]">Location</label>
                            <select name="location" value={formData.location} onChange={handleChange} className="w-full border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#0f2e53]">
                                <option value="">Select product location</option>
                                <option value="Lagos Plant">Lagos Plant</option>
                                <option value="Kano Plant">Kano Plant</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-[var(--text-primary)]">Dietary Info</label>
                            <select name="dietary_info" value={formData.dietary_info} onChange={handleChange} className="w-full border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#0f2e53]">
                                <option value="">Select dietary info</option>
                                <option value="Halal">Halal</option>
                                <option value="Vegetarian">Vegetarian</option>
                                <option value="None">None</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-[var(--text-primary)]">Shelf Life</label>
                            <select name="shelf_life" value={formData.shelf_life} onChange={handleChange} className="w-full border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#0f2e53]">
                                <option value="">Select shelf life</option>
                                <option value="3 Months">3 Months</option>
                                <option value="6 Months">6 Months</option>
                                <option value="1 Year">1 Year</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 4 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-[var(--text-primary)]">Shipping Type</label>
                            <select name="shipping_type" value={formData.shipping_type} onChange={handleChange} className="w-full border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#0f2e53]">
                                <option value="">Select shipping type</option>
                                <option value="Cold Chain">Cold Chain</option>
                                <option value="Dry Freight">Dry Freight</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-[var(--text-primary)]">Weight / Volume</label>
                            <input name="weight" value={formData.weight} onChange={handleChange} type="text" className="w-[120px] border border-red-300 bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-red-500 block" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-[var(--text-primary)]">Units per Carton</label>
                            <input name="pack_size" value={formData.pack_size} onChange={handleChange} type="number" className="w-[120px] border border-red-300 bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-red-500 block" />
                        </div>
                    </div>

                    {/* Row 5 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-[var(--text-primary)]">Features</label>
                            <div className="space-y-2">
                                {features.map((f, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="text-[10px] text-[var(--text-muted)] w-4">{i + 1}.</span>
                                        <input value={f} onChange={(e) => handleFeatureChange(i, e.target.value)} className="flex-1 border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#0f2e53]" />
                                    </div>
                                ))}
                                <div className="flex gap-2 justify-center mt-4">
                                    <button type="button" onClick={() => removeFeature(features.length - 1)} className="p-2 border border-red-200 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-all"><Minus size={16} /></button>
                                    <button type="button" onClick={addFeature} className="p-2 border border-blue-200 text-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all"><Plus size={16} /></button>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-[var(--text-primary)]">Qualities (Allergens etc.)</label>
                            <select name="qualities" value={formData.qualities} onChange={handleChange} className="w-full border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#0f2e53]">
                                <option value="">Select product qualities</option>
                                <option value="Contains Nuts">Contains Nuts</option>
                                <option value="Dairy Component">Dairy Component</option>
                                <option value="Gluten Free">Gluten Free</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[12px] font-bold text-[var(--text-primary)]">Gallery Images</label>
                            <div className="relative w-full border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl flex items-center px-4 py-2.5">
                                <span className="bg-gray-500 text-white text-[10px] px-3 py-1.5 rounded mr-3 font-bold">Choose files</span>
                                <span className="text-[12px] text-[var(--text-muted)] truncate max-w-[150px]">No file chosen</span>
                            </div>
                            <p className="text-[10px] text-blue-500 font-bold mt-1">Total files limit: 0.00MB / 5MB</p>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-[var(--divider)]">
                        <h2 className="text-xl font-bold tracking-tight text-[#0f2e53] mb-6 dark:text-blue-100">Package</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[12px] font-bold text-[var(--text-primary)]">Content</label>
                                <textarea name="package_content" value={formData.package_content} onChange={handleChange} className="w-full border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#0f2e53] h-[100px] resize-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[12px] font-bold text-[var(--text-primary)]">Storage</label>
                                <textarea name="storage" value={formData.storage} onChange={handleChange} className="w-full border border-[var(--divider)] bg-[var(--bg-tertiary)] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#0f2e53] h-[100px] resize-none" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6">
                        <button type="button" onClick={onClose} className="px-8 py-3 rounded-xl border border-[var(--divider)] font-bold text-[13px] hover:bg-[var(--bg-secondary)] transition-all">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="px-8 py-3 bg-[#0f2e53] text-white rounded-xl font-bold text-[13px] hover:bg-[#0a1f38] transition-all disabled:opacity-50">
                            {loading ? 'Saving...' : 'Save Product'}
                        </button>
                    </div>

                </form>
            </div>
        </motion.div>
    );
};

export default AddProductPage;
