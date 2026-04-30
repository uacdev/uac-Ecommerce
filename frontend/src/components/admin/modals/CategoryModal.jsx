import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useStore } from '../../../context/StoreContext'
import { uploadApi } from '../../../api/client'

const CategoryModal = ({ category, onClose }) => {
    const { addCategory, updateCategoryById } = useStore();
    const [formData, setFormData] = useState({
        name: category?.name || '',
        abstract: category?.abstract || '',
        parent: category?.parent || '',
        coverImage: category?.coverImage || ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [error, setError] = useState('');

    const handleCoverChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setError('');
        setUploadingCover(true);
        try {
            const res = await uploadApi.image(file);
            const url = res.data?.data?.url;
            if (url) setFormData(prev => ({ ...prev, coverImage: url }));
            else setError('Upload returned no URL');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Cover upload failed');
        } finally {
            setUploadingCover(false);
        }
    };

    const handleChange = (e, field) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) return;
        setSubmitting(true);
        setError('');
        const payload = {
            name: formData.name,
            abstract: formData.abstract,
            parent: formData.parent,
            coverImage: formData.coverImage,
            color: category?.color || 'bg-indigo-50 text-indigo-600'
        };
        const res = category
            ? await updateCategoryById(category._id, payload)
            : await addCategory(payload);
        setSubmitting(false);
        if (res?.success) onClose();
        else setError(res?.message || 'Could not save category');
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] flex items-center justify-center p-6 backdrop-blur-md bg-black/40 font-['Sen',sans-serif]">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[var(--bg-tertiary)] rounded-3xl p-10 max-w-sm w-full shadow-2xl relative border border-[var(--divider)]">
                <button onClick={onClose} className="absolute right-8 top-8 text-[var(--text-muted)] hover:text-[#ed0000] transition-colors"><X size={24} /></button>
                <h3 className="text-2xl font-bold mb-8 tracking-tight text-[var(--text-primary)]">{category ? 'Modify segment' : 'New classification'}</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 rounded-full bg-[var(--bg-secondary)] border-2 border-dashed border-[var(--divider)] flex flex-col items-center justify-center text-[var(--text-muted)] cursor-pointer hover:border-[#ed0000] hover:text-[#ed0000] transition-all relative overflow-hidden">
                            {formData.coverImage ? (
                                <img src={formData.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                                <span className="text-[10px] font-bold mt-1 text-center px-2">{uploadingCover ? 'Uploading…' : <>Upload<br/>Cover</>}</span>
                            )}
                            <input type="file" onChange={handleCoverChange} disabled={uploadingCover} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[var(--text-muted)] tracking-tight ml-1">Segment name *</label>
                        <input required value={formData.name} onChange={(e) => handleChange(e, 'name')} placeholder="e.g. Ice Cream" className="w-full bg-[var(--bg-secondary)] rounded-xl px-6 py-4 text-[14px] font-bold outline-none focus:border-[#ed0000]/30 border border-transparent shadow-sm text-[var(--text-primary)]" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[var(--text-muted)] tracking-tight ml-1">Parent Segment (Optional)</label>
                        <select value={formData.parent} onChange={(e) => handleChange(e, 'parent')} className="w-full bg-[var(--bg-secondary)] rounded-xl px-6 py-4 text-[14px] font-bold outline-none focus:border-[#ed0000]/30 border border-transparent shadow-sm text-[var(--text-primary)]">
                            <option value="">None (Top Level)</option>
                            <option value="Snacks">Snacks</option>
                            <option value="Beverages">Beverages</option>
                            <option value="Desserts">Desserts</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[var(--text-muted)] tracking-tight ml-1">Abstract Description</label>
                        <textarea value={formData.abstract} onChange={(e) => handleChange(e, 'abstract')} placeholder="Brief category summary..." className="w-full bg-[var(--bg-secondary)] rounded-xl px-6 py-4 text-[14px] font-bold outline-none focus:border-[#ed0000]/30 border border-transparent shadow-sm text-[var(--text-primary)] h-24 resize-none" />
                    </div>

                    {error && <p className="text-[12px] font-bold text-[#ed0000] text-center">{error}</p>}

                    <button type="submit" disabled={submitting} className="w-full bg-black text-white py-4 bg-[#0f2e53] hover:bg-[#0a1f38] rounded-2xl font-bold text-[14px] shadow-xl transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
                        {submitting ? 'Saving…' : (category ? 'Save changes' : 'Submit classification')}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default CategoryModal;
