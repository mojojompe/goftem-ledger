import React from 'react';
import { FiCheck, FiTruck, FiTrash2, FiMessageCircle, FiInbox } from 'react-icons/fi';

// Helper: get total price from a sale (handles old single-item and new multi-item)
export const getSaleTotal = (sale) => {
    if (sale.items && sale.items.length > 0) {
        return sale.items.reduce((sum, i) => sum + i.price, 0);
    }
    return sale.price || 0;
};

// Helper: get display label for items
export const getItemsLabel = (sale) => {
    if (sale.items && sale.items.length > 0) {
        if (sale.items.length === 1) return sale.items[0].name;
        return `${sale.items[0].name} +${sale.items.length - 1} more`;
    }
    return sale.item || '—';
};

const PaymentBadge = ({ status }) => (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
        status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
    }`}>{status === 'paid' ? 'Paid' : 'Pending'}</span>
);

const DeliveryBadge = ({ status }) => (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
        status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
    }`}>{status === 'delivered' ? 'Delivered' : 'Pending'}</span>
);

const ActionBtn = ({ onClick, title, color, children }) => {
    const colors = {
        green: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100',
        black: 'bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100',
        yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100',
        red: 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100',
    };
    return (
        <button onClick={onClick} title={title} className={`p-2.5 rounded-xl border ${colors[color]} transition-all active:scale-90`}>
            {children}
        </button>
    );
};

const SaleCard = ({ sale, onMarkPaid, onMarkDelivered, onDelete, onWhatsAppReminder }) => {
    const total = getSaleTotal(sale);
    const hasMultipleItems = sale.items && sale.items.length > 1;

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">{sale.buyerName}</p>
                    {/* Items list */}
                    {sale.items && sale.items.length > 0 ? (
                        <div className="mt-1 space-y-0.5">
                            {sale.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-xs text-gray-500">
                                    <span>{item.name}</span>
                                    <span className="font-semibold">₦{item.price.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-500 mt-0.5">{sale.item}</p>
                    )}
                </div>
                <div className="text-right shrink-0">
                    <p className="font-black text-gray-900 text-base">₦{total.toLocaleString()}</p>
                    {hasMultipleItems && <p className="text-[10px] text-gray-400 font-semibold">{sale.items.length} items</p>}
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <PaymentBadge status={sale.paymentStatus} />
                <DeliveryBadge status={sale.deliveryStatus} />
            </div>

            <div className="flex gap-2 pt-1">
                {sale.paymentStatus === 'pending' && (
                    <ActionBtn onClick={() => onWhatsAppReminder(sale)} title="WhatsApp Reminder" color="green"><FiMessageCircle size={16} /></ActionBtn>
                )}
                {sale.paymentStatus === 'pending' && (
                    <ActionBtn onClick={() => onMarkPaid(sale)} title="Mark as Paid" color="black"><FiCheck size={16} /></ActionBtn>
                )}
                {sale.deliveryStatus === 'pending' && (
                    <ActionBtn onClick={() => onMarkDelivered(sale._id)} title="Mark as Delivered" color="yellow"><FiTruck size={16} /></ActionBtn>
                )}
                <ActionBtn onClick={() => onDelete(sale._id)} title="Delete" color="red"><FiTrash2 size={16} /></ActionBtn>
            </div>
        </div>
    );
};

const RecordsTable = ({ groupedSales, onMarkPaid, onMarkDelivered, onDelete, onWhatsAppReminder }) => {
    if (Object.keys(groupedSales).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FiInbox size={48} className="mb-4 text-gray-300" />
                <p className="font-bold text-gray-500">No records found</p>
                <p className="text-sm">Add a new sale to get started</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {Object.entries(groupedSales).map(([dateLabel, salesArray]) => (
                <div key={dateLabel}>
                    <div className="flex items-center gap-3 mb-3">
                        <p className="text-sm font-black text-gray-800">{dateLabel}</p>
                        <span className="bg-black text-white text-[11px] font-bold px-2.5 py-1 rounded-full">{salesArray.length}</span>
                        <div className="flex-1 h-px bg-gray-100"></div>
                    </div>

                    {/* Mobile: cards */}
                    <div className="block md:hidden space-y-3">
                        {salesArray.map(sale => (
                            <SaleCard key={sale._id} sale={sale} onMarkPaid={onMarkPaid} onMarkDelivered={onMarkDelivered} onDelete={onDelete} onWhatsAppReminder={onWhatsAppReminder} />
                        ))}
                    </div>

                    {/* Desktop: table */}
                    <div className="hidden md:block bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                    <th className="px-5 py-4">Name</th>
                                    <th className="px-5 py-4">Items</th>
                                    <th className="px-5 py-4">Total</th>
                                    <th className="px-5 py-4 text-center">Payment</th>
                                    <th className="px-5 py-4 text-center">Delivery</th>
                                    <th className="px-5 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {salesArray.map((sale) => {
                                    const total = getSaleTotal(sale);
                                    return (
                                        <tr key={sale._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-5 py-4 font-bold text-gray-900 whitespace-nowrap">{sale.buyerName}</td>
                                            <td className="px-5 py-4 text-gray-600 max-w-[200px]">
                                                {sale.items && sale.items.length > 0 ? (
                                                    <div className="space-y-0.5">
                                                        {sale.items.map((item, i) => (
                                                            <div key={i} className="flex justify-between gap-4 text-xs">
                                                                <span className="truncate">{item.name}</span>
                                                                <span className="font-semibold shrink-0">₦{item.price.toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm">{sale.item}</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 font-black text-gray-900 whitespace-nowrap">₦{total.toLocaleString()}</td>
                                            <td className="px-5 py-4 text-center"><PaymentBadge status={sale.paymentStatus} /></td>
                                            <td className="px-5 py-4 text-center"><DeliveryBadge status={sale.deliveryStatus} /></td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {sale.paymentStatus === 'pending' && (
                                                        <ActionBtn onClick={() => onWhatsAppReminder(sale)} title="WhatsApp Reminder" color="green"><FiMessageCircle size={15} /></ActionBtn>
                                                    )}
                                                    {sale.paymentStatus === 'pending' && (
                                                        <ActionBtn onClick={() => onMarkPaid(sale)} title="Mark as Paid" color="black"><FiCheck size={15} /></ActionBtn>
                                                    )}
                                                    {sale.deliveryStatus === 'pending' && (
                                                        <ActionBtn onClick={() => onMarkDelivered(sale._id)} title="Mark as Delivered" color="yellow"><FiTruck size={15} /></ActionBtn>
                                                    )}
                                                    <ActionBtn onClick={() => onDelete(sale._id)} title="Delete" color="red"><FiTrash2 size={15} /></ActionBtn>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RecordsTable;
