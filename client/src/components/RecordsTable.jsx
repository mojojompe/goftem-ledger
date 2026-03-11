import React from 'react';
import { format } from 'date-fns';
import { FiCheck, FiTruck, FiTrash2, FiMessageCircle } from 'react-icons/fi';

const RecordsTable = ({
    groupedSales,
    onMarkPaid,
    onMarkDelivered,
    onDelete,
    onWhatsAppReminder,
}) => {
    if (Object.keys(groupedSales).length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
                No sales records found.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {Object.entries(groupedSales).map(([dateLabel, salesArray]) => (
                <div key={dateLabel} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800 text-lg">{dateLabel} Sales</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-gray-100 text-sm font-medium text-gray-500 uppercase tracking-wider">
                                    <th className="p-4 pl-6">Name</th>
                                    <th className="p-4">Item</th>
                                    <th className="p-4">Price</th>
                                    <th className="p-4">Payment</th>
                                    <th className="p-4">Delivery</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {salesArray.map((sale) => (
                                    <tr key={sale._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 pl-6 font-medium text-gray-900 whitespace-nowrap">{sale.buyerName}</td>
                                        <td className="p-4 text-gray-600 whitespace-nowrap">{sale.item}</td>
                                        <td className="p-4 font-semibold text-gray-800 whitespace-nowrap">₦{sale.price.toLocaleString()}</td>

                                        {/* Payment Status Badge */}
                                        <td className="p-4 whitespace-nowrap">
                                            <span className={`badge ${sale.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                                {sale.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                                            </span>
                                        </td>

                                        {/* Delivery Status Badge */}
                                        <td className="p-4 whitespace-nowrap">
                                            <span className={`badge ${sale.deliveryStatus === 'delivered' ? 'badge-success' : 'badge-primary'}`}>
                                                {sale.deliveryStatus === 'delivered' ? 'Delivered' : 'Pending'}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="p-4">
                                            <div className="flex items-center justify-center space-x-2">
                                                {sale.paymentStatus === 'pending' && (
                                                    <button
                                                        onClick={() => onWhatsAppReminder(sale)}
                                                        title="WhatsApp Reminder"
                                                        className="p-1.5 text-green-500 hover:bg-green-50 rounded bg-white border border-green-100 transition-colors"
                                                    >
                                                        <FiMessageCircle size={16} />
                                                    </button>
                                                )}
                                                {sale.paymentStatus === 'pending' && (
                                                    <button
                                                        onClick={() => onMarkPaid(sale)}
                                                        title="Mark as Paid"
                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded bg-white border border-green-100 transition-colors"
                                                    >
                                                        <FiCheck size={16} />
                                                    </button>
                                                )}
                                                {sale.deliveryStatus === 'pending' && (
                                                    <button
                                                        onClick={() => onMarkDelivered(sale._id)}
                                                        title="Mark as Delivered"
                                                        className="p-1.5 text-black hover:bg-gray-100 rounded bg-white border border-gray-200 transition-colors"
                                                    >
                                                        <FiTruck size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => onDelete(sale._id)}
                                                    title="Delete Record"
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded bg-white border border-red-100 transition-colors"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
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
