import React, { useState, useEffect, useRef } from 'react';
import { salesService } from '../services/api';
import Header from '../components/Header';
import SummaryCards from '../components/SummaryCards';
import SalesEntryForm from '../components/SalesEntryForm';
import FilterSection from '../components/FilterSection';
import RecordsTable from '../components/RecordsTable';
import Receipt from '../components/Receipt';
import { format, isToday } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Dashboard = () => {
    const [sales, setSales] = useState([]);
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(true);

    // Receipt Modal State
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [currentReceiptData, setCurrentReceiptData] = useState(null);
    const receiptRef = useRef(null);

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const data = await salesService.getSales();
            setSales(data);
        } catch (error) {
            console.error('Error fetching sales:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRecord = async (newSale) => {
        try {
            const savedSale = await salesService.createSale(newSale);
            setSales([savedSale, ...sales]);
        } catch (error) {
            console.error('Error adding sale:', error);
            alert('Failed to add sale record');
        }
    };

    const handleMarkPaid = async (sale) => {
        try {
            const updatedSale = await salesService.updatePaymentStatus(sale._id, 'paid');
            setSales(sales.map(s => s._id === sale._id ? updatedSale : s));
            // Show receipt modal
            setCurrentReceiptData(updatedSale);
            setShowReceiptModal(true);
        } catch (error) {
            console.error('Error marking paid:', error);
        }
    };

    const handleMarkDelivered = async (id) => {
        try {
            const updatedSale = await salesService.updateDeliveryStatus(id, 'delivered');
            setSales(sales.map(s => s._id === id ? updatedSale : s));
        } catch (error) {
            console.error('Error marking delivered:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await salesService.deleteSale(id);
                setSales(sales.filter(s => s._id !== id));
            } catch (error) {
                console.error('Error deleting sale:', error);
            }
        }
    };

    const handleWhatsAppReminder = (sale) => {
        // We assume there might be a phone number field later, 
        // but for now we follow the user prompt which opens whatsapp without a specific number 
        // so the buyer can be selected manually in WA, or we just leave phone empty
        const message = `Hello ${sale.buyerName}, this is GOFTEM STORES.\n\nThis is a reminder that your payment for:\n\nItem: ${sale.item}\nPrice: ₦${sale.price.toLocaleString()}\n\nis still pending.\n\nThank you.`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    };

    const downloadReceipt = async () => {
        if (!receiptRef.current) return;
        try {
            const canvas = await html2canvas(receiptRef.current, {
                scale: 2,
                useCORS: true,
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Goftem-Receipt-${currentReceiptData.buyerName}-${format(new Date(), 'yyyyMMdd')}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Could not generate PDF');
        }
    };

    const shareReceiptWhatsApp = () => {
        const message = `Hello ${currentReceiptData.buyerName}, here is your receipt from GOFTEM STORES.\n\nItem: ${currentReceiptData.item}\nAmount: ₦${Number(currentReceiptData.price).toLocaleString()}\nStatus: PAID\nDate: ${format(new Date(currentReceiptData.date), 'MMM dd, yyyy')}\n\nThank you for your business!`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    };

    // Derived State Calculations
    const todaySales = sales.filter(s => isToday(new Date(s.date)));
    const totalSalesToday = todaySales.length;
    const pendingPayments = sales.filter(s => s.paymentStatus === 'pending').length;
    const paidOrders = sales.filter(s => s.paymentStatus === 'paid').length;
    const totalRevenueToday = todaySales
        .filter(s => s.paymentStatus === 'paid')
        .reduce((sum, s) => sum + s.price, 0);

    // Filter Logic
    const filteredSales = sales.filter(sale => {
        if (filter === 'Today') return isToday(new Date(sale.date));
        if (filter === 'Pending Payments') return sale.paymentStatus === 'pending';
        if (filter === 'Paid') return sale.paymentStatus === 'paid';
        return true; // 'All'
    });

    // Group by Date for the Table
    const groupedSales = filteredSales.reduce((acc, sale) => {
        const dateLabel = format(new Date(sale.date), 'MMMM d yyyy');
        if (!acc[dateLabel]) {
            acc[dateLabel] = [];
        }
        acc[dateLabel].push(sale);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <SummaryCards
                    totalSales={totalSalesToday}
                    pendingPayments={pendingPayments}
                    paidOrders={paidOrders}
                    totalRevenue={totalRevenueToday}
                />

                <SalesEntryForm onAddRecord={handleAddRecord} />

                <div className="mb-2">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Sales Records</h2>
                    <FilterSection currentFilter={filter} onFilterChange={setFilter} />
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading records...</div>
                ) : (
                    <RecordsTable
                        groupedSales={groupedSales}
                        onMarkPaid={handleMarkPaid}
                        onMarkDelivered={handleMarkDelivered}
                        onDelete={handleDelete}
                        onWhatsAppReminder={handleWhatsAppReminder}
                    />
                )}
            </main>

            {/* Receipt Modal */}
            {showReceiptModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-lg w-full max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800">Payment Successful</h3>
                            <button
                                onClick={() => setShowReceiptModal(false)}
                                className="text-gray-500 hover:text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-full w-8 h-8 flex justify-center items-center"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-grow flex justify-center bg-gray-100">
                            {/* Receipt Component */}
                            <Receipt ref={receiptRef} receiptData={currentReceiptData} />
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={downloadReceipt}
                                className="flex-1 btn btn-primary py-2.5"
                            >
                                Download PDF
                            </button>
                            <button
                                onClick={shareReceiptWhatsApp}
                                className="flex-1 btn bg-green-500 text-white hover:bg-green-600 py-2.5"
                            >
                                Share via WhatsApp
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
