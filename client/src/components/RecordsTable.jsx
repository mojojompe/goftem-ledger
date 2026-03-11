import React from 'react';
import { FiCheck, FiTruck, FiTrash2, FiMessageCircle, FiInbox, FiClock } from 'react-icons/fi';

// Helper: get total price from a sale (handles old single-item and new multi-item)
export const getSaleTotal = (sale) => {
    if (sale.items && sale.items.length > 0) {
        return sale.items.reduce((sum, i) => sum + i.price, 0);
    }
    return sale.price || 0;
};

export const getPaidTotal = (sale) => {
    if (sale.items && sale.items.length > 0) {
        return sale.items.filter(i => i.paymentStatus === 'paid').reduce((sum, i) => sum + i.price, 0);
    }
    return sale.paymentStatus === 'paid' ? (sale.price || 0) : 0;
};

const OverallBadge = ({ sale }) => {
    if (!sale.items || sale.items.length <= 1) {
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
                sale.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>{sale.paymentStatus === 'paid' ? 'Paid' : 'Pending'}</span>
        );
    }
    const paidCount = sale.items.filter(i => i.paymentStatus === 'paid').length;
    const total = sale.items.length;
    if (paidCount === 0) return <span className="inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-700">All Pending</span>;
    if (paidCount === total) return <span className="inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-green-100 text-green-700">Fully Paid</span>;
    return <span className="inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">{paidCount}/{total} Paid</span>;
};

const DeliveryBadge = ({ status }) => (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
        status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
    }`}>{status === 'delivered' ? 'Delivered' : 'Pending'}</span>
);

const ActionBtn = ({ onClick, title, color, children, small }) => {
    const colors = {
        green: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100',
        black: 'bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100',
        yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100',
        red: 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100',
    };
    return (
        <button onClick={onClick} title={title} className={`${small ? 'p-1.5' : 'p-2.5'} rounded-xl border ${colors[color]} transition-all active:scale-90`}>
            {children}
        </button>
    );
};

// Mobile Card
const SaleCard = ({ sale, onMarkItemPaid, onMarkPaid, onMarkDelivered, onDelete, onWhatsAppReminder }) => {
    const total = getSaleTotal(sale);
    const paidTotal = getPaidTotal(sale);
    const hasMultiItems = sale.items && sale.items.length > 1;

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-3">
                <p className="font-bold text-gray-900 text-sm">{sale.buyerName}</p>
                <div className="text-right shrink-0">
                    <p className="font-black text-gray-900">₦{total.toLocaleString()}</p>
                    {hasMultiItems && paidTotal > 0 && paidTotal < total && (
                        <p className="text-[10px] text-green-600 font-bold">₦{paidTotal.toLocaleString()} paid</p>
                    )}
                </div>
            </div>

            {/* Items with per-item status */}
            {sale.items && sale.items.length > 0 ? (
                <div className="space-y-2 bg-gray-50 rounded-xl p-3">
                    {sale.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                                <p className="text-xs text-gray-500">₦{item.price.toLocaleString()}</p>
                            </div>
                            {item.paymentStatus === 'paid' ? (
                                <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-bold uppercase shrink-0">
                                    <FiCheck size={10} /> Paid
                                </span>
                            ) : (
                                <button
                                    onClick={() => onMarkItemPaid(sale._id, i)}
                                    className="flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-[10px] font-bold uppercase shrink-0 hover:bg-yellow-100 active:scale-95 transition-all"
                                >
                                    <FiClock size={10} /> Mark Paid
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-gray-500">{sale.item}</p>
            )}

            <div className="flex flex-wrap gap-2">
                <OverallBadge sale={sale} />
                <DeliveryBadge status={sale.deliveryStatus} />
            </div>

            <div className="flex gap-2 pt-1">
                {sale.paymentStatus === 'pending' && (
                    <ActionBtn onClick={() => onWhatsAppReminder(sale)} title="WhatsApp Reminder" color="green"><FiMessageCircle size={16} /></ActionBtn>
                )}
                {/* Only show whole-sale mark paid if no multi-items or single item */}
                {sale.paymentStatus === 'pending' && (!sale.items || sale.items.length <= 1) && (
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

const RecordsTable = ({ groupedSales, onMarkItemPaid, onMarkPaid, onMarkDelivered, onDelete, onWhatsAppReminder }) => {
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

                    {/* Mobile cards */}
                    <div className="block md:hidden space-y-3">
                        {salesArray.map(sale => (
                            <SaleCard key={sale._id} sale={sale}
                                onMarkItemPaid={onMarkItemPaid}
                                onMarkPaid={onMarkPaid}
                                onMarkDelivered={onMarkDelivered}
                                onDelete={onDelete}
                                onWhatsAppReminder={onWhatsAppReminder}
                            />
                        ))}
                    </div>

                    {/* Desktop table */}
                    <div className="hidden md:block bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                    <th className="px-5 py-4">Buyer</th>
                                    <th className="px-5 py-4">Items & Payment</th>
                                    <th className="px-5 py-4">Total</th>
                                    <th className="px-5 py-4 text-center">Status</th>
                                    <th className="px-5 py-4 text-center">Delivery</th>
                                    <th className="px-5 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {salesArray.map((sale) => {
                                    const total = getSaleTotal(sale);
                                    const paidTotal = getPaidTotal(sale);
                                    return (
                                        <tr key={sale._id} className="hover:bg-gray-50/50 transition-colors align-top">
                                            <td className="px-5 py-4 font-bold text-gray-900 whitespace-nowrap">{sale.buyerName}</td>
                                            <td className="px-5 py-4 max-w-[250px]">
                                                {sale.items && sale.items.length > 0 ? (
                                                    <div className="space-y-1.5">
                                                        {sale.items.map((item, i) => (
                                                            <div key={i} className="flex items-center justify-between gap-3">
                                                                <div className="min-w-0">
                                                                    <span className="text-xs font-semibold text-gray-800 truncate block">{item.name}</span>
                                                                    <span className="text-xs text-gray-500">₦{item.price.toLocaleString()}</span>
                                                                </div>
                                                                {item.paymentStatus === 'paid' ? (
                                                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-lg text-[10px] font-bold uppercase shrink-0">
                                                                        <FiCheck size={9} /> Paid
                                                                    </span>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => onMarkItemPaid(sale._id, i)}
                                                                        className="flex items-center gap-1 px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-[10px] font-bold uppercase shrink-0 hover:bg-yellow-100 active:scale-95 transition-all"
                                                                    >
                                                                        <FiClock size={9} /> Pending
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-600">{sale.item}</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 align-middle">
                                                <p className="font-black text-gray-900 whitespace-nowrap">₦{total.toLocaleString()}</p>
                                                {paidTotal > 0 && paidTotal < total && (
                                                    <p className="text-[10px] text-green-600 font-bold">₦{paidTotal.toLocaleString()} paid</p>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-center align-middle"><OverallBadge sale={sale} /></td>
                                            <td className="px-5 py-4 text-center align-middle"><DeliveryBadge status={sale.deliveryStatus} /></td>
                                            <td className="px-5 py-4 align-middle">
                                                <div className="flex items-center justify-center gap-2">
                                                    {sale.paymentStatus === 'pending' && (
                                                        <ActionBtn onClick={() => onWhatsAppReminder(sale)} title="WhatsApp Reminder" color="green"><FiMessageCircle size={15} /></ActionBtn>
                                                    )}
                                                    {sale.paymentStatus === 'pending' && (!sale.items || sale.items.length <= 1) && (
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
