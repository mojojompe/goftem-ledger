import React, { useState } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';

const Field = ({ label, children }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{label}</label>
        {children}
    </div>
);

const inputClass = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:bg-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 transition-all placeholder:font-normal placeholder:text-gray-400";

const SalesEntryForm = ({ onAddRecord }) => {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        buyerName: '',
        item: '',
        price: '',
        paymentStatus: 'pending',
        deliveryStatus: 'pending',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.buyerName || !formData.item || !formData.price || !formData.date) return;
        await onAddRecord({ ...formData, price: Number(formData.price) });
        setFormData(prev => ({
            ...prev, buyerName: '', item: '', price: '',
            paymentStatus: 'pending', deliveryStatus: 'pending',
        }));
        setOpen(false);
    };

    return (
        <div className="mb-6">
            {/* Toggle Button */}
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-black text-white font-bold text-sm py-4 rounded-2xl shadow-lg shadow-black/10 hover:bg-gray-900 active:scale-[0.98] transition-all"
                >
                    <FiPlus size={18} /> Record New Sale
                </button>
            )}

            {/* Form Panel */}
            {open && (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-base font-black text-gray-900">New Sale</h2>
                        <button
                            onClick={() => setOpen(false)}
                            className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                        >
                            <FiX size={16} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Date">
                            <input type="date" name="date" value={formData.date} onChange={handleChange} className={inputClass} required />
                        </Field>
                        <Field label="Buyer Name">
                            <input type="text" name="buyerName" value={formData.buyerName} onChange={handleChange} placeholder="e.g. John Doe" className={inputClass} required />
                        </Field>
                        <Field label="Item Purchased">
                            <input type="text" name="item" value={formData.item} onChange={handleChange} placeholder="e.g. Gold Watch" className={inputClass} required />
                        </Field>
                        <Field label="Price (₦)">
                            <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0" className={inputClass} required />
                        </Field>
                        <Field label="Payment Status">
                            <select name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} className={inputClass}>
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                            </select>
                        </Field>
                        <Field label="Delivery Status">
                            <select name="deliveryStatus" value={formData.deliveryStatus} onChange={handleChange} className={inputClass}>
                                <option value="pending">Pending</option>
                                <option value="delivered">Delivered</option>
                            </select>
                        </Field>

                        <div className="sm:col-span-2 pt-2">
                            <button
                                type="submit"
                                className="w-full bg-black text-white font-bold py-3.5 rounded-xl active:scale-[0.98] hover:bg-gray-900 transition-all shadow-lg shadow-black/10"
                            >
                                Add Record
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default SalesEntryForm;
