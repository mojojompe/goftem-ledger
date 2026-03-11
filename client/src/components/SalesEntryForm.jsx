import React, { useState } from 'react';
import { FiPlus, FiX, FiUser, FiCalendar, FiCreditCard, FiTruck, FiShoppingBag, FiDollarSign, FiTrash2 } from 'react-icons/fi';

const inputClass = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:bg-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 transition-all placeholder:font-normal placeholder:text-gray-400";

const Field = ({ label, children }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{label}</label>
        {children}
    </div>
);

const SalesEntryForm = ({ onAddRecord }) => {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        buyerName: '',
        paymentStatus: 'pending',
        deliveryStatus: 'pending',
    });
    const [items, setItems] = useState([{ name: '', price: '' }]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, field, value) => {
        setItems(prev => prev.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        ));
    };

    const addItem = () => setItems(prev => [...prev, { name: '', price: '' }]);

    const removeItem = (index) => {
        if (items.length === 1) return; // keep at least one
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const totalPrice = items.reduce((sum, i) => sum + (Number(i.price) || 0), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validItems = items.filter(i => i.name.trim() && i.price);
        if (!validItems.length) return;

        await onAddRecord({
            ...formData,
            items: validItems.map(i => ({ name: i.name.trim(), price: Number(i.price) })),
        });

        // Reset
        setFormData(prev => ({
            ...prev, buyerName: '', paymentStatus: 'pending', deliveryStatus: 'pending',
        }));
        setItems([{ name: '', price: '' }]);
        setOpen(false);
    };

    return (
        <div className="mb-6">
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-black text-white font-bold text-sm py-4 rounded-2xl shadow-lg shadow-black/10 hover:bg-gray-900 active:scale-[0.98] transition-all"
                >
                    <FiPlus size={18} /> Record New Sale
                </button>
            )}

            {open && (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-base font-black text-gray-900">New Sale</h2>
                        <button onClick={() => setOpen(false)} className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                            <FiX size={16} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Buyer info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Date">
                                <input type="date" name="date" value={formData.date} onChange={handleChange} className={inputClass} required />
                            </Field>
                            <Field label="Buyer Name">
                                <input type="text" name="buyerName" value={formData.buyerName} onChange={handleChange} placeholder="e.g. John Doe" className={inputClass} required />
                            </Field>
                        </div>

                        {/* Items */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Items Purchased</label>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="flex items-center gap-1.5 text-xs font-bold text-black bg-yellow-400 hover:bg-yellow-500 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <FiPlus size={13} /> Add Item
                                </button>
                            </div>

                            <div className="space-y-2">
                                {items.map((item, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                            placeholder={`Item ${index + 1} name`}
                                            className={`${inputClass} flex-1`}
                                            required
                                        />
                                        <input
                                            type="number"
                                            value={item.price}
                                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                            placeholder="₦ Price"
                                            className={`${inputClass} w-28 sm:w-36`}
                                            required
                                        />
                                        {items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="p-2.5 rounded-xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-colors flex-shrink-0"
                                            >
                                                <FiTrash2 size={15} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Total */}
                            {items.length > 1 && (
                                <div className="mt-3 flex justify-end">
                                    <div className="bg-black text-white px-4 py-2 rounded-xl text-sm font-black">
                                        Total: ₦{totalPrice.toLocaleString()}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Status */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Payment Status">
                                <select name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} className={`${inputClass} cursor-pointer`}>
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                </select>
                            </Field>
                            <Field label="Delivery Status">
                                <select name="deliveryStatus" value={formData.deliveryStatus} onChange={handleChange} className={`${inputClass} cursor-pointer`}>
                                    <option value="pending">Pending</option>
                                    <option value="delivered">Delivered</option>
                                </select>
                            </Field>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-black text-white font-bold py-3.5 rounded-xl active:scale-[0.98] hover:bg-gray-900 transition-all shadow-lg shadow-black/10"
                        >
                            Add Record
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default SalesEntryForm;
