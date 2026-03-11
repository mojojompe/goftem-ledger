import React from 'react';
import { FiTrendingUp, FiClock, FiCheckCircle, FiDollarSign } from 'react-icons/fi';

const SummaryCard = ({ title, value, icon, colorClass }) => (
    <div className="card flex items-center p-6 space-x-4">
        <div className={`p-4 rounded-full ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const SummaryCards = ({ totalSales, pendingPayments, paidOrders, totalRevenue }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SummaryCard
                title="Total Sales Today"
                value={totalSales}
                icon={<FiTrendingUp className="w-6 h-6 text-black" />}
                colorClass="bg-gray-100"
            />
            <SummaryCard
                title="Pending Payments"
                value={pendingPayments}
                icon={<FiClock className="w-6 h-6 text-yellow-600" />}
                colorClass="bg-yellow-100"
            />
            <SummaryCard
                title="Paid Orders"
                value={paidOrders}
                icon={<FiCheckCircle className="w-6 h-6 text-green-600" />}
                colorClass="bg-green-100"
            />
            <SummaryCard
                title="Total Revenue Today"
                value={`₦${totalRevenue.toLocaleString()}`}
                icon={<FiDollarSign className="w-6 h-6 text-yellow-500" />}
                colorClass="bg-black text-yellow-500"
            />
        </div>
    );
};

export default SummaryCards;
