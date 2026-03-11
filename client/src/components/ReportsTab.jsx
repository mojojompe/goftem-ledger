import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, parseISO } from 'date-fns';
import { FiTrendingUp, FiShoppingBag, FiActivity } from 'react-icons/fi';

const ReportsTab = ({ analytics, totalRevenue }) => {
    if (!analytics) return (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FiActivity size={48} className="mb-4 text-gray-200" />
            <p className="font-bold text-gray-500">Analytics Loading</p>
        </div>
    );

    const { topItems, revenueTimeline } = analytics;

    // Format timeline dates for chart
    const chartData = (revenueTimeline || []).map(entry => ({
        date: format(parseISO(entry.date), 'MMM d'),
        fullDate: format(parseISO(entry.date), 'MMM d, yyyy'),
        revenue: entry.revenue
    }));

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <FiTrendingUp className="text-yellow-500" /> Performance Report
            </h2>

            {/* Top Cards for Report context */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Revenue In Selection</p>
                    <p className="text-3xl font-black text-gray-900">₦{totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Top Selling Item</p>
                    {topItems?.[0] ? (
                        <>
                            <p className="text-xl font-black text-gray-900 truncate">{topItems[0].name}</p>
                            <p className="text-sm font-semibold text-green-600 mt-1">{topItems[0].quantity} units sold</p>
                        </>
                    ) : (
                        <p className="text-xl font-black text-gray-400">—</p>
                    )}
                </div>
            </div>

            {/* Revenue Bar Chart */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-black"></span> Revenue Overview
                </h3>
                <div className="h-64 w-full">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }} tickFormatter={(val) => `₦${val >= 1000 ? val/1000 + 'k' : val}`} />
                                <Tooltip
                                    cursor={{ fill: '#f9fafb' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-black text-white p-3 rounded-xl shadow-xl">
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{payload[0].payload.fullDate}</p>
                                                    <p className="text-sm font-black">₦{payload[0].value.toLocaleString()}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#eab308' : '#111827'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm font-semibold">
                            No revenue data in this period
                        </div>
                    )}
                </div>
            </div>

            {/* Top Items Table */}
            <div className="bg-white border border-gray-100 rounded-2xl p-0 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-50">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <FiShoppingBag className="text-gray-400" /> Top Performing Items
                    </h3>
                </div>
                {topItems?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left bg-white">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                    <th className="px-5 py-3">Item Name</th>
                                    <th className="px-5 py-3 text-right">Units Sold</th>
                                    <th className="px-5 py-3 text-right">Revenue Generated</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {topItems.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex flex-col items-center justify-center text-[10px] font-black shrink-0">
                                                    {idx + 1}
                                                </span>
                                                <span className="font-bold text-gray-900 text-sm truncate max-w-[200px]">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-bold text-gray-700 text-sm">{item.quantity}</td>
                                        <td className="px-5 py-3.5 text-right font-black text-gray-900 text-sm">₦{item.revenue.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-400 text-sm font-semibold">
                        No item data in this period
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsTab;
