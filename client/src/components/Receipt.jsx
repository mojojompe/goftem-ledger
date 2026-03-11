import React, { forwardRef } from 'react';
import { format } from 'date-fns';

const Receipt = forwardRef(({ receiptData }, ref) => {
    if (!receiptData) return null;

    // Support both old (single item) and new (items array) format
    const items = receiptData.items && receiptData.items.length > 0
        ? receiptData.items
        : receiptData.item ? [{ name: receiptData.item, price: receiptData.price, quantity: 1 }] : [];

    const getItemTotal = (item) => item.price * (item.quantity || 1);
    const total = items.reduce((sum, i) => sum + getItemTotal(i), 0);

    return (
        <div
            ref={ref}
            style={{ fontFamily: 'Inter, system-ui, sans-serif', width: '360px', backgroundColor: '#ffffff' }}
        >
            {/* Watermark layer */}
            <div style={{
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Background watermark */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'url(/Flier.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.06,
                    pointerEvents: 'none',
                }} />

                {/* Content */}
                <div style={{ position: 'relative', padding: '32px 28px' }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px dashed #e5e7eb' }}>
                        <img
                            src="/Logo.png"
                            alt="GOFTEM"
                            crossOrigin="anonymous"
                            style={{ width: '56px', height: '56px', objectFit: 'contain', margin: '0 auto 12px' }}
                        />
                        <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#111827', margin: 0 }}>GOFTEM STORES</h2>
                        <p style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600, letterSpacing: '2px', margin: '4px 0 0', textTransform: 'uppercase' }}>Official Receipt</p>
                    </div>

                    {/* Meta */}
                    <div style={{ marginBottom: '20px' }}>
                        {[
                            { label: 'Receipt ID', value: `#${receiptData._id?.substring(0, 8).toUpperCase() || 'N/A'}` },
                            { label: 'Date', value: receiptData.date ? format(new Date(receiptData.date), 'MMM dd, yyyy') : '' },
                            { label: 'Buyer', value: receiptData.buyerName },
                        ].map(({ label, value }) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1f2937', textAlign: 'right', maxWidth: '180px' }}>{value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Items table */}
                    <div style={{ border: '1px solid #f3f4f6', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
                        <div style={{ backgroundColor: '#f9fafb', padding: '8px 16px', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>Item</span>
                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>Amount</span>
                        </div>
                        {items.map((item, i) => (
                            <div key={i} style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderTop: '1px solid #f3f4f6' }}>
                                <div style={{ maxWidth: '190px' }}>
                                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937', margin: 0 }}>{item.name}</p>
                                    {(item.quantity || 1) > 1 && (
                                        <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 0' }}>₦{item.price.toLocaleString()} × {item.quantity}</p>
                                    )}
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>₦{getItemTotal(item).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <div style={{ backgroundColor: '#111827', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {items.length > 1 ? `Total (${items.length} items)` : 'Amount Paid'}
                        </span>
                        <span style={{ fontSize: '22px', fontWeight: 900, color: '#facc15' }}>₦{total.toLocaleString()}</span>
                    </div>

                    {/* Footer */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#dcfce7', color: '#15803d', padding: '8px 16px', borderRadius: '9999px', fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', border: '1px solid #bbf7d0' }}>
                            ✓ Payment Confirmed
                        </div>
                        <p style={{ fontSize: '10px', color: '#d1d5db', marginTop: '16px', fontWeight: 600 }}>Thank you for your business!</p>
                    </div>
                </div>
            </div>
        </div>
    );
});

Receipt.displayName = 'Receipt';
export default Receipt;
