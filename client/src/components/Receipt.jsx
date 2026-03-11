import React, { forwardRef } from 'react';
import { format } from 'date-fns';

const Receipt = forwardRef(({ receiptData }, ref) => {
    if (!receiptData) return null;

    // Support both old (single item) and new (items array) format
    const items = receiptData.items && receiptData.items.length > 0
        ? receiptData.items
        : receiptData.item ? [{ name: receiptData.item, price: receiptData.price }] : [];

    const total = items.reduce((sum, i) => sum + i.price, 0);

    return (
        <div
            ref={ref}
            style={{ fontFamily: 'Inter, system-ui, sans-serif', width: '360px' }}
            className="bg-white relative overflow-hidden"
        >
            {/* Watermark */}
            <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: 'url(/Flier.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.06,
            }} />

            {/* Content */}
            <div className="relative px-7 py-8">
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-6 pb-5 border-b border-dashed border-gray-200">
                    <img src="/Logo.png" alt="GOFTEM" className="w-14 h-14 object-contain mb-3" />
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">GOFTEM STORES</h2>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mt-1">Official Receipt</p>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-5">
                    {[
                        { label: 'Receipt ID', value: `#${receiptData._id?.substring(0, 8).toUpperCase() || 'N/A'}` },
                        { label: 'Date', value: receiptData.date ? format(new Date(receiptData.date), 'MMM dd, yyyy') : '' },
                        { label: 'Buyer', value: receiptData.buyerName },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                            <span className="text-sm font-bold text-gray-800 text-right max-w-[180px] truncate">{value}</span>
                        </div>
                    ))}
                </div>

                {/* Items */}
                <div className="border border-gray-100 rounded-xl overflow-hidden mb-5">
                    <div className="bg-gray-50 px-4 py-2 flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-wider">
                        <span>Item</span>
                        <span>Price</span>
                    </div>
                    {items.map((item, i) => (
                        <div key={i} className="px-4 py-2.5 flex justify-between items-center border-t border-gray-50">
                            <span className="text-sm font-semibold text-gray-800 truncate max-w-[180px]">{item.name}</span>
                            <span className="text-sm font-bold text-gray-900 shrink-0">₦{item.price.toLocaleString()}</span>
                        </div>
                    ))}
                </div>

                {/* Total */}
                <div className="bg-black rounded-xl px-5 py-4 flex justify-between items-center mb-5">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {items.length > 1 ? `Total (${items.length} items)` : 'Amount Paid'}
                    </span>
                    <span className="text-xl font-black text-yellow-400">₦{total.toLocaleString()}</span>
                </div>

                {/* Status */}
                <div className="text-center">
                    <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-green-200">
                        ✓ Payment Confirmed
                    </span>
                    <p className="text-[10px] text-gray-400 mt-4 font-semibold">Thank you for your business!</p>
                </div>
            </div>
        </div>
    );
});

export default Receipt;
