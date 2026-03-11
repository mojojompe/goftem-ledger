import React, { forwardRef } from 'react';
import { format } from 'date-fns';

const Receipt = forwardRef(({ receiptData }, ref) => {
    if (!receiptData) return null;

    return (
        <div
            ref={ref}
            className="bg-white p-8 max-w-md mx-auto relative overflow-hidden text-gray-800"
            style={{
                width: '400px',
                minHeight: '500px',
                border: '1px solid #e5e7eb',
            }}
        >
            {/* Watermark Flier */}
            <div
                className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'url(/Flier.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            />

            {/* Receipt Content - Z-index to sit above watermark */}
            <div className="relative z-10 flex flex-col h-full">
                {/* Header - Centered Logo */}
                <div className="text-center mb-6 border-b pb-6 border-gray-200">
                    <img src="/Logo.png" alt="GOFTEM STORES Logo" className="w-16 h-16 mx-auto mb-2 object-contain" />
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">GOFTEM STORES</h2>
                    <p className="text-gray-500 text-sm">Official Payment Receipt</p>
                </div>

                {/* Details */}
                <div className="space-y-4 flex-grow mb-6">
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500 text-sm">Receipt ID</span>
                        <span className="font-semibold">{receiptData._id?.substring(0, 8).toUpperCase() || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500 text-sm">Date</span>
                        <span className="font-semibold">{receiptData.date ? format(new Date(receiptData.date), 'MMM dd, yyyy') : ''}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500 text-sm">Buyer Name</span>
                        <span className="font-semibold text-right max-w-[200px] truncate">{receiptData.buyerName}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500 text-sm">Item</span>
                        <span className="font-semibold text-right max-w-[200px] truncate">{receiptData.item}</span>
                    </div>
                    <div className="flex justify-between border-gray-100 pb-2 bg-gray-50 p-3 rounded mt-2">
                        <span className="font-bold text-gray-700">Amount Paid</span>
                        <span className="font-bold text-lg text-green-700">₦{Number(receiptData.price).toLocaleString()}</span>
                    </div>
                </div>

                {/* Status */}
                <div className="text-center mt-auto pt-6 border-t border-gray-200">
                    <div className="inline-flex items-center justify-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full mb-4 font-bold border border-green-200">
                        <span>Payment Status: PAID</span>
                    </div>
                    <p className="text-xs text-gray-400 italic">Thank you for your business!</p>
                </div>
            </div>
        </div>
    );
});

export default Receipt;
