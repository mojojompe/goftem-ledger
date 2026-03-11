import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX, FiFileText, FiUser, FiShoppingBag, FiCheck, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';

const getSaleTotal = (sale) => {
    if (sale.items && sale.items.length > 0)
        return sale.items.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0);
    return sale.price || 0;
};

const highlight = (text, query) => {
    if (!query || !text) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
        <>
            {text.slice(0, idx)}
            <mark className="bg-yellow-200 text-yellow-900 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
            {text.slice(idx + query.length)}
        </>
    );
};

const SearchModal = ({ open, onClose, sales, onShowReceipt }) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (open) {
            setQuery('');
            setTimeout(() => inputRef.current?.focus(), 80);
        }
    }, [open]);

    // Close on Escape
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const q = query.trim().toLowerCase();

    const results = q.length < 1 ? [] : sales.filter(sale => {
        const orderId = sale._id?.substring(0, 8).toLowerCase();
        const name = sale.buyerName?.toLowerCase();
        const itemNames = (sale.items || []).map(i => i.name.toLowerCase()).join(' ');
        const legacyItem = sale.item?.toLowerCase() || '';
        return (
            orderId?.includes(q) ||
            name?.includes(q) ||
            itemNames.includes(q) ||
            legacyItem.includes(q)
        );
    });

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[70] flex flex-col items-center pt-4 px-3 sm:pt-16 sm:px-4"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div className="relative w-full max-w-lg flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[85vh]">
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
                    <FiSearch size={18} className="text-gray-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search by name, item or order ID…"
                        className="flex-1 text-sm font-semibold text-gray-900 outline-none placeholder:font-normal placeholder:text-gray-400 bg-transparent"
                    />
                    {query && (
                        <button onClick={() => setQuery('')} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                            <FiX size={16} />
                        </button>
                    )}
                    <button onClick={onClose} className="text-xs font-bold text-gray-400 hover:text-gray-700 ml-1 transition-colors">
                        Close
                    </button>
                </div>

                {/* Results */}
                <div className="overflow-y-auto flex-1">
                    {q.length === 0 && (
                        <div className="flex flex-col items-center py-12 text-gray-400">
                            <FiSearch size={36} className="mb-3 text-gray-200" />
                            <p className="text-sm font-semibold">Start typing to search</p>
                            <p className="text-xs mt-1 text-center px-8">Search by customer name, product name, or the first 8 characters of an Order ID</p>
                        </div>
                    )}

                    {q.length > 0 && results.length === 0 && (
                        <div className="flex flex-col items-center py-12 text-gray-400">
                            <p className="text-sm font-semibold">No results for "{query}"</p>
                        </div>
                    )}

                    {results.length > 0 && (
                        <ul className="divide-y divide-gray-50">
                            {results.map(sale => {
                                const total = getSaleTotal(sale);
                                const orderId = sale._id?.substring(0, 8).toUpperCase();
                                const isPaid = sale.paymentStatus === 'paid';
                                const matchedItems = (sale.items || []).filter(i => i.name.toLowerCase().includes(q));

                                return (
                                    <li key={sale._id}
                                        className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => {
                                            if (isPaid) { onShowReceipt(sale); onClose(); }
                                        }}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                {/* Buyer name */}
                                                <div className="flex items-center gap-2">
                                                    <FiUser size={12} className="text-gray-400 shrink-0" />
                                                    <p className="text-sm font-bold text-gray-900 truncate">
                                                        {highlight(sale.buyerName, query)}
                                                    </p>
                                                </div>

                                                {/* Order ID + date */}
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    <span className="text-[11px] text-gray-400 font-mono">
                                                        #{highlight(orderId, query.toUpperCase())}
                                                    </span>
                                                    <span className="text-[11px] text-gray-400">
                                                        {sale.date ? format(new Date(sale.date), 'MMM d, yyyy') : ''}
                                                    </span>
                                                </div>

                                                {/* Matched items */}
                                                {matchedItems.length > 0 && (
                                                    <div className="mt-1.5 flex flex-wrap gap-1">
                                                        {matchedItems.map((item, i) => (
                                                            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-50 text-yellow-800 rounded-lg text-[11px] font-semibold border border-yellow-100">
                                                                <FiShoppingBag size={9} />
                                                                {highlight(item.name, query)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* All items */}
                                                {matchedItems.length === 0 && sale.items?.length > 0 && (
                                                    <p className="text-[11px] text-gray-400 mt-1 truncate">
                                                        {sale.items.map(i => i.name).join(', ')}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Right side */}
                                            <div className="text-right shrink-0">
                                                <p className="font-black text-gray-900 text-sm">₦{total.toLocaleString()}</p>
                                                <div className="flex items-center justify-end gap-1 mt-1">
                                                    {isPaid ? (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                            <FiCheck size={9} /> Paid
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full">
                                                            <FiClock size={9} /> Pending
                                                        </span>
                                                    )}
                                                </div>
                                                {isPaid && (
                                                    <p className="text-[10px] text-purple-500 font-semibold mt-1 flex items-center justify-end gap-1">
                                                        <FiFileText size={9} /> Tap for receipt
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* Result count */}
                {results.length > 0 && (
                    <div className="px-4 py-2 border-t border-gray-50 bg-gray-50">
                        <p className="text-[11px] text-gray-400 font-semibold">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchModal;
