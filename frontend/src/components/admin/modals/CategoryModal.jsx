import React from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { SettingInput } from '../ui/shared_ui'

const CategoryModal = ({ category, onClose }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] flex items-center justify-center p-6 backdrop-blur-md bg-black/40 font-['Sen',sans-serif]">
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[var(--bg-tertiary)] rounded-3xl p-10 max-w-sm w-full shadow-2xl relative border border-[var(--divider)]">
            <button onClick={onClose} className="absolute right-8 top-8 text-[var(--text-muted)]"><X size={24} /></button>
            <h3 className="text-2xl font-bold mb-10 tracking-tight text-[var(--text-primary)]">{category ? 'Modify segment' : 'New classification'}</h3>
            <div className="space-y-6">
                <SettingInput label="Segment name" value={category?.name || ''} />
                <SettingInput label="Abstract" value="" placeholder="Brief category summary..." />
                <button className="w-full bg-black text-white py-4.5 rounded-2xl font-bold text-[14px] shadow-2xl hover:bg-zinc-800 transition-all">Submit classification</button>
            </div>
        </motion.div>
    </motion.div>
)

export default CategoryModal
