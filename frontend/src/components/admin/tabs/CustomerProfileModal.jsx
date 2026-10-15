import { useEffect } from 'react'
import { CalendarDays, Mail, MapPin, Phone, Truck, UserRound, X } from 'lucide-react'
import { format } from 'date-fns'

const valueOrDash = value => String(value || '').trim() || '—'

const CustomerProfileModal = ({ customer, onClose }) => {
    useEffect(() => {
        const onKeyDown = event => {
            if (event.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [onClose])

    const joined = customer.joinDate && !Number.isNaN(new Date(customer.joinDate).getTime())
        ? format(new Date(customer.joinDate), 'MMM d, yyyy')
        : '—'

    return (
        <div
            className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}
        >
            <section role="dialog" aria-modal="true" aria-labelledby="customer-profile-title" className="w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--divider)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] shadow-2xl">
                <header className="flex items-start justify-between border-b border-[var(--divider)] px-6 py-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-red)]/10 text-[var(--brand-red)]">
                            <UserRound size={20} />
                        </span>
                        <div className="min-w-0">
                            <h2 id="customer-profile-title" className="truncate text-lg font-bold">{valueOrDash(customer.name)}</h2>
                            <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">Customer profile</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close customer profile" className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]">
                        <X size={18} />
                    </button>
                </header>

                <div className="max-h-[75vh] space-y-6 overflow-y-auto p-6">
                    <section>
                        <h3 className="mb-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Contact and address</h3>
                        <div className="divide-y divide-[var(--divider)] rounded-xl border border-[var(--divider)]">
                            <div className="flex items-start gap-3 p-4">
                                <Mail size={15} className="mt-0.5 shrink-0 text-[var(--text-muted)]" />
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Email</p>
                                    {customer.email ? <a href={`mailto:${customer.email}`} className="mt-1 block break-all text-sm font-medium hover:text-[var(--brand-red)]">{customer.email}</a> : <p className="mt-1 text-sm">—</p>}
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4">
                                <Phone size={15} className="mt-0.5 shrink-0 text-[var(--text-muted)]" />
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Phone number</p>
                                    {customer.phone ? <a href={`tel:${customer.phone}`} className="mt-1 block text-sm font-medium hover:text-[var(--brand-red)]">{customer.phone}</a> : <p className="mt-1 text-sm">—</p>}
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4">
                                <MapPin size={15} className="mt-0.5 shrink-0 text-[var(--text-muted)]" />
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Address</p>
                                    <p className="mt-1 whitespace-pre-wrap break-words text-sm font-medium">{valueOrDash(customer.address)}</p>
                                    {customer.state && <p className="mt-1 text-xs text-[var(--text-muted)]">{customer.state}</p>}
                                </div>
                            </div>
                        </div>
                    </section>

                    {(customer.dispatchAddress || customer.dispatchPhone) && (
                        <section>
                            <h3 className="mb-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Latest dispatch order</h3>
                            <div className="space-y-3 rounded-xl border border-[var(--divider)] p-4">
                                {customer.dispatchAddress && <p className="flex items-start gap-2 text-sm"><MapPin size={15} className="mt-0.5 shrink-0 text-[var(--text-muted)]" /><span className="whitespace-pre-wrap break-words">{customer.dispatchAddress}</span></p>}
                                {customer.dispatchPhone && <a href={`tel:${customer.dispatchPhone}`} className="flex items-center gap-2 text-sm hover:text-[var(--brand-red)]"><Truck size={15} className="shrink-0 text-[var(--text-muted)]" /><span><span className="mr-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Rider contact</span>{customer.dispatchPhone}</span></a>}
                            </div>
                        </section>
                    )}

                    <div className="flex flex-wrap gap-x-6 gap-y-3 border-t border-[var(--divider)] pt-4 text-xs text-[var(--text-muted)]">
                        <span className="inline-flex items-center gap-2"><CalendarDays size={14} /> Joined {joined}</span>
                        <span>{Number(customer.orders || 0)} {Number(customer.orders || 0) === 1 ? 'order' : 'orders'}</span>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default CustomerProfileModal