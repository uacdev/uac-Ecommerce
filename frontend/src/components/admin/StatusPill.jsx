import React from 'react'
import { motion } from 'framer-motion'
import { 
    Clock, CheckCircle2, Truck, XCircle, 
    AlertCircle, RefreshCw, CreditCard 
} from 'lucide-react'

const StatusPill = ({ status, delay = 0 }) => {
    const config = {
        pending: {
            label: 'Pending',
            icon: Clock,
            color: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
        },
        paid: {
            label: 'Paid (Verify)',
            icon: CreditCard,
            color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
        },
        confirmed: {
            label: 'Confirmed',
            icon: CheckCircle2,
            color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        },
        shipped: {
            label: 'In Transit',
            icon: Truck,
            color: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
        },
        delivered: {
            label: 'Delivered',
            icon: CheckCircle2,
            color: 'bg-green-500/10 text-green-500 border-green-500/20'
        },
        completed: {
            label: 'Completed',
            icon: CheckCircle2,
            color: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
        },
        refunded: {
            label: 'Refunded',
            icon: RefreshCw,
            color: 'bg-red-500/10 text-red-500 border-red-500/20'
        },
        out_of_stock: {
            label: 'Out of Stock',
            icon: XCircle,
            color: 'bg-red-500/10 text-red-500 border-red-500/20'
        },
        available: {
            label: 'Available',
            icon: CheckCircle2,
            color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        }
    }

    const { label, icon: Icon, color } = config[status] || {
        label: status,
        icon: AlertCircle,
        color: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-[11px] font-bold ${color} whitespace-nowrap`}
        >
            <Icon size={12} className="shrink-0" />
            <span>{label}</span>
        </motion.div>
    )
}

export default StatusPill
