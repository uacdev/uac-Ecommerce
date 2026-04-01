import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { SettingInput } from '../ui/shared_ui'
import { useStore } from '../../../context/StoreContext'

const CategoryModal = ({ category, onClose }) => {
    const { addCategory } = useStore();
    const [formData, setFormData] = useState({
        name: category?.name || '',
        abstract: category?.abstract || ''
    });

    const handleChange = (e, field) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.name) {
            addCategory({
                name: formData.name,
                abstract: formData.abstract,
                count: 0,
                sales: '₦0',
                color: 'bg-indigo-50 text-indigo-600'
            });
            onClose();
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] flex items-center justify-center p-6 backdrop-blur-md bg-black/40 font-['Sen',sans-serif]">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[var(--bg-tertiary)] rounded-3xl p-10 max-w-sm w-full shadow-2xl relative border border-[var(--divider)]">
                <button onClick={onClose} className="absolute right-8 top-8 text-[var(--text-muted)] hover:text-[#ed0000] transition-colors"><X size={24} /></button>
                <h3 className="text-2xl font-bold mb-8 tracking-tight text-[var(--text-primary)]">{category ? 'Modify segment' : 'New classification'}</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 rounded-full bg-[var(--bg-secondary)] border-2 border-dashed border-[var(--divider)] flex flex-col items-center justify-center text-[var(--text-muted)] cursor-pointer hover:border-[#ed0000] hover:text-[#ed0000] transition-all relative overflow-hidden">
                            <span className="text-[10px] font-bold mt-1 text-center px-2">Upload<br/>Cover</span>
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[var(--text-muted)] tracking-tight ml-1">Segment name *</label>
                        <input required value={formData.name} onChange={(e) => handleChange(e, 'name')} placeholder="e.g. Ice Cream" className="w-full bg-[var(--bg-secondary)] rounded-xl px-6 py-4 text-[14px] font-bold outline-none focus:border-[#ed0000]/30 border border-transparent shadow-sm text-[var(--text-primary)]" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[var(--text-muted)] tracking-tight ml-1">Parent Segment (Optional)</label>
                        <select className="w-full bg-[var(--bg-secondary)] rounded-xl px-6 py-4 text-[14px] font-bold outline-none focus:border-[#ed0000]/30 border border-transparent shadow-sm text-[var(--text-primary)]">
                            <option value="">None (Top Level)</option>
                            <option value="snacks">Snacks</option>
                            <option value="beverages">Beverages</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[var(--text-muted)] tracking-tight ml-1">Abstract Description</label>
                        <textarea value={formData.abstract} onChange={(e) => handleChange(e, 'abstract')} placeholder="Brief category summary..." className="w-full bg-[var(--bg-secondary)] rounded-xl px-6 py-4 text-[14px] font-bold outline-none focus:border-[#ed0000]/30 border border-transparent shadow-sm text-[var(--text-primary)] h-24 resize-none" />
                    </div>

                    <button type="submit" className="w-full bg-black text-white py-4 bg-[#0f2e53] hover:bg-[#0a1f38] rounded-2xl font-bold text-[14px] shadow-xl transition-all active:scale-[0.98]">Submit classification</button>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default CategoryModal;
