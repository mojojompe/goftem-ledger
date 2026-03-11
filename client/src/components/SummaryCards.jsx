import React from 'react';
import { FiTrendingUp, FiClock, FiCheckCircle, FiDollarSign } from 'react-icons/fi';

const cards = [
    {
        key: 'totalSales',
        title: 'Sales Today',
        icon: FiTrendingUp,
        iconBg: 'bg-gray-100',
        iconColor: 'text-gray-800',
        valueFn: (p) => p.totalSales,
    },
    {
        key: 'pendingPayments',
        title: 'Pending',
        icon: FiClock,
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        valueFn: (p) => p.pendingPayments,
    },
    {
        key: 'paidOrders',
        title: 'Paid',
        icon: FiCheckCircle,
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        valueFn: (p) => p.paidOrders,
    },
    {
        key: 'totalRevenue',
        title: 'Revenue Today',
        icon: FiDollarSign,
        iconBg: 'bg-black',
        iconColor: 'text-yellow-400',
        valueFn: (p) => `₦${p.totalRevenue.toLocaleString()}`,
        dark: true,
    },
];

const SummaryCards = (props) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <div
                        key={card.key}
                        className={`rounded-2xl p-4 sm:p-5 border ${card.dark ? 'bg-black border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'} shadow-sm`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className={`p-2 rounded-xl ${card.iconBg}`}>
                                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${card.iconColor}`} />
                            </div>
                        </div>
                        <p className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${card.dark ? 'text-gray-400' : 'text-gray-500'}`}>{card.title}</p>
                        <p className={`text-xl sm:text-2xl font-black leading-none ${card.dark ? 'text-yellow-400' : 'text-gray-900'}`}>{card.valueFn(props)}</p>
                    </div>
                );
            })}
        </div>
    );
};

export default SummaryCards;
