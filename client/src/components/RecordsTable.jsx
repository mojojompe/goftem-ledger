import React from 'react';
import { FiCheck, FiTruck, FiTrash2, FiMessageCircle, FiInbox } from 'react-icons/fi';

const PaymentBadge = ({ status }) => (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${status === 'paid'
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}>
        {status === 'paid' ? 'Paid' : 'Pending'}
    </span>
);

const DeliveryBadge = ({ status }) => (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${status === 'delivered'
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-600'
        }`}>
        {status === 'delivered' ? 'Delivered' : 'Pending'}
    </span>
);

const ActionBtn = ({ onClick, title, color, children }) => {
    const colors = {
        green: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100',
        black: 'bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100',
        yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100',
        red: 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100',
    };
    return (
        <button
            onClick={onClick}
            title={title}
            className={`p-2.5 rounded-xl border ${colors[color]} transition-all active:scale-90`}
        >
            {children}
        </button>
    );
};

/** Mobile-friendly card view for each sale */
const SaleCard = ({ sale, onMarkPaid, onMarkDelivered, onDelete, onWhatsAppReminder }) => (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-3">
            <div>
                <p className="font-bold text-gray-900 text-sm">{sale.buyerName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{sale.item}</p>
            </div>
            <p className="font-black text-gray-900 text-base shrink-0">₦{sale.price.toLocaleString()}</p>
        </div>

        <div className="flex flex-wrap gap-2">
            <PaymentBadge status={sale.paymentStatus} />
            <DeliveryBadge status={sale.deliveryStatus} />
        </div>

        <div className="flex gap-2 pt-1">
            {sale.paymentStatus === 'pending' && (
                <ActionBtn onClick={() => onWhatsAppReminder(sale)} title="WhatsApp Reminder" color="green">
                    <FiMessageCircle size={16} />
                </ActionBtn>
            )}
            {sale.paymentStatus === 'pending' && (
                <ActionBtn onClick={() => onMarkPaid(sale)} title="Mark as Paid" color="black">
                    <FiCheck size={16} />
                </ActionBtn>
            )}
            {sale.deliveryStatus === 'pending' && (
                <ActionBtn onClick={() => onMarkDelivered(sale._id)} title="Mark as Delivered" color="yellow">
                    <FiTruck size={16} />
                </ActionBtn>
            )}
            <ActionBtn onClick={() => onDelete(sale._id)} title="Delete" color="red">
                <FiTrash2 size={16} />
            </ActionBtn>
        </div>
    </div>
);

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
                    {/* Date Group Header */}
                    <div className="flex items-center gap-3 mb-3">
                        <p className="text-sm font-black text-gray-800">{dateLabel}</p>
                        <span className="bg-black text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                            {salesArray.length}
                        </span>
                        <div className="flex-1 h-px bg-gray-100"></div>
                    </div>

                    {/* Mobile: card stacks, Desktop: table */}
                    <div className="block md:hidden space-y-3">
                        {salesArray.map(sale => (
                            <SaleCard
                                key={sale._id}
                                sale={sale}
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
                                    <th className="px-5 py-4">Name</th>
                                    <th className="px-5 py-4">Item</th>
                                    <th className="px-5 py-4">Price</th>
                                    <th className="px-5 py-4 text-center">Payment</th>
                                    <th className="px-5 py-4 text-center">Delivery</th>
                                    <th className="px-5 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {salesArray.map((sale) => (
                                    <tr key={sale._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-4 font-bold text-gray-900 whitespace-nowrap">{sale.buyerName}</td>
                                        <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{sale.item}</td>
                                        <td className="px-5 py-4 font-black text-gray-900 whitespace-nowrap">₦{sale.price.toLocaleString()}</td>
                                        <td className="px-5 py-4 text-center whitespace-nowrap">
                                            <PaymentBadge status={sale.paymentStatus} />
                                        </td>
                                        <td className="px-5 py-4 text-center whitespace-nowrap">
                                            <DeliveryBadge status={sale.deliveryStatus} />
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {sale.paymentStatus === 'pending' && (
                                                    <ActionBtn onClick={() => onWhatsAppReminder(sale)} title="WhatsApp Reminder" color="green">
                                                        <FiMessageCircle size={15} />
                                                    </ActionBtn>
                                                )}
                                                {sale.paymentStatus === 'pending' && (
                                                    <ActionBtn onClick={() => onMarkPaid(sale)} title="Mark as Paid" color="black">
                                                        <FiCheck size={15} />
                                                    </ActionBtn>
                                                )}
                                                {sale.deliveryStatus === 'pending' && (
                                                    <ActionBtn onClick={() => onMarkDelivered(sale._id)} title="Mark as Delivered" color="yellow">
                                                        <FiTruck size={15} />
                                                    </ActionBtn>
                                                )}
                                                <ActionBtn onClick={() => onDelete(sale._id)} title="Delete" color="red">
                                                    <FiTrash2 size={15} />
                                                </ActionBtn>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RecordsTable;
