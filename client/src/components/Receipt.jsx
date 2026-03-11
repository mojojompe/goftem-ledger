import React, { forwardRef } from 'react';
import { format } from 'date-fns';

const Receipt = forwardRef(({ receiptData }, ref) => {
    if (!receiptData) return null;

    return (
        <div
            ref={ref}
            style={{ fontFamily: 'Inter, system-ui, sans-serif', width: '360px' }}
            className="bg-white relative overflow-hidden"
        >
            {/* Watermark */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'url(/Flier.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.06,
                }}
            />

            {/* Content */}
            <div className="relative px-7 py-8">
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-6 pb-5 border-b border-dashed border-gray-200">
                    <img src="/Logo.png" alt="GOFTEM" className="w-14 h-14 object-contain mb-3" />
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">GOFTEM STORES</h2>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mt-1">Official Receipt</p>
                </div>

                {/* Fields */}
                <div className="space-y-3 mb-6">
                    {[
                        { label: 'Receipt ID', value: `#${receiptData._id?.substring(0, 8).toUpperCase() || 'N/A'}` },
                        { label: 'Date', value: receiptData.date ? format(new Date(receiptData.date), 'MMM dd, yyyy') : '' },
                        { label: 'Buyer', value: receiptData.buyerName },
                        { label: 'Item', value: receiptData.item },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                            <span className="text-sm font-bold text-gray-800 text-right max-w-[180px] truncate">{value}</span>
                        </div>
                    ))}
                </div>

                {/* Amount */}
                <div className="bg-black rounded-xl px-5 py-4 flex justify-between items-center mb-5">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Amount Paid</span>
                    <span className="text-xl font-black text-yellow-400">₦{Number(receiptData.price).toLocaleString()}</span>
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
