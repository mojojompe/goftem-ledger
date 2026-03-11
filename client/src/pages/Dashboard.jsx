import React, { useState, useEffect, useRef } from 'react';
import { salesService } from '../services/api';
import Header from '../components/Header';
import SummaryCards from '../components/SummaryCards';
import SalesEntryForm from '../components/SalesEntryForm';
import FilterSection from '../components/FilterSection';
import RecordsTable, { getSaleTotal, getPaidTotal } from '../components/RecordsTable';
import Receipt from '../components/Receipt';
import { format, isToday } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FiX, FiDownload } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const Dashboard = () => {
    const [sales, setSales] = useState([]);
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [currentReceiptData, setCurrentReceiptData] = useState(null);
    const receiptRef = useRef(null);

    useEffect(() => { fetchSales(); }, []);

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

    const showReceipt = (saleData) => {
        setCurrentReceiptData(saleData);
        setShowReceiptModal(true);
    };

    const handleAddRecord = async (newSale) => {
        try {
            const savedSale = await salesService.createSale(newSale);
            setSales([savedSale, ...sales]);
            // Show receipt immediately if entered as paid
            if (savedSale.paymentStatus === 'paid') {
                showReceipt(savedSale);
            }
        } catch (error) {
            alert('Failed to add sale record');
        }
    };

    const handleMarkPaid = async (sale) => {
        try {
            const updatedSale = await salesService.updatePaymentStatus(sale._id, 'paid');
            setSales(sales.map(s => s._id === sale._id ? updatedSale : s));
            showReceipt(updatedSale);
        } catch (error) {
            console.error('Error marking paid:', error);
        }
    };

    const handleMarkItemPaid = async (saleId, itemIndex) => {
        try {
            const updatedSale = await salesService.updateItemPaymentStatus(saleId, itemIndex, 'paid');
            setSales(sales.map(s => s._id === saleId ? updatedSale : s));
            // If all items now paid, show receipt
            if (updatedSale.paymentStatus === 'paid') {
                showReceipt(updatedSale);
            }
        } catch (error) {
            console.error('Error marking item paid:', error);
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
        if (window.confirm('Delete this record?')) {
            try {
                await salesService.deleteSale(id);
                setSales(sales.filter(s => s._id !== id));
            } catch (error) {
                console.error('Error deleting:', error);
            }
        }
    };

    const handleWhatsAppReminder = (sale) => {
        // Only list items that are still pending
        let unpaidItems;
        if (sale.items && sale.items.length > 0) {
            unpaidItems = sale.items.filter(i => i.paymentStatus !== 'paid');
        } else {
            unpaidItems = [{ name: sale.item, price: sale.price }];
        }
        if (unpaidItems.length === 0) return;
        const itemsList = unpaidItems.map(i => `• ${i.name}: ₦${i.price.toLocaleString()}`).join('\n');
        const unpaidTotal = unpaidItems.reduce((s, i) => s + i.price, 0);
        const message = `Hello ${sale.buyerName}, this is GOFTEM STORES.\n\nThis is a reminder that the following payment(s) are still pending:\n\n${itemsList}\n\nOutstanding: ₦${unpaidTotal.toLocaleString()}\n\nThank you.`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    /** Capture receipt as a PNG blob from the DOM */
    const captureReceiptBlob = async () => {
        if (!receiptRef.current) return null;
        const canvas = await html2canvas(receiptRef.current, { scale: 2, useCORS: true });
        return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    };

    const downloadReceipt = async () => {
        if (!receiptRef.current) return;
        try {
            const canvas = await html2canvas(receiptRef.current, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Goftem-Receipt-${currentReceiptData.buyerName}-${format(new Date(), 'yyyyMMdd')}.pdf`);
        } catch (error) {
            alert('Could not generate PDF');
        }
    };

    const shareReceiptWhatsApp = async () => {
        const receiptItems = currentReceiptData.items && currentReceiptData.items.length > 0
            ? currentReceiptData.items.map(i => `• ${i.name}: ₦${i.price.toLocaleString()}`).join('\n')
            : `• ${currentReceiptData.item}: ₦${currentReceiptData.price?.toLocaleString()}`;
        const receiptTotal = getSaleTotal(currentReceiptData);
        const textMessage = `Hello ${currentReceiptData.buyerName}, here is your receipt from GOFTEM STORES.\n\n${receiptItems}\n\nTotal: ₦${receiptTotal.toLocaleString()}\nStatus: PAID ✅\nDate: ${format(new Date(currentReceiptData.date), 'MMM dd, yyyy')}\n\nThank you for your business! 🙏`;

        // Try to share image via Web Share API (works on mobile)
        try {
            const blob = await captureReceiptBlob();
            if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], 'receipt.png', { type: 'image/png' })] })) {
                const file = new File([blob], `GOFTEM-Receipt-${currentReceiptData.buyerName}.png`, { type: 'image/png' });
                await navigator.share({
                    title: 'GOFTEM STORES Receipt',
                    text: textMessage,
                    files: [file],
                });
                return;
            }
        } catch (err) {
            // Web Share not supported or user cancelled — fall through to WhatsApp link
            if (err.name === 'AbortError') return;
        }

        // Fallback: open WhatsApp with text message
        window.open(`https://wa.me/?text=${encodeURIComponent(textMessage)}`, '_blank');
    };

    // Stats
    const todaySales = sales.filter(s => isToday(new Date(s.date)));
    const totalSalesToday = todaySales.length;
    const pendingPayments = sales.filter(s => s.paymentStatus === 'pending').length;
    const paidOrders = sales.filter(s => s.paymentStatus === 'paid').length;
    const totalRevenueToday = todaySales.filter(s => s.paymentStatus === 'paid').reduce((sum, s) => sum + getSaleTotal(s), 0);

    // Filter
    const filteredSales = sales.filter(sale => {
        if (filter === 'Today') return isToday(new Date(sale.date));
        if (filter === 'Pending Payments') return sale.paymentStatus === 'pending';
        if (filter === 'Paid') return sale.paymentStatus === 'paid';
        return true;
    });

    // Group by date
    const groupedSales = filteredSales.reduce((acc, sale) => {
        const key = format(new Date(sale.date), 'MMMM d, yyyy');
        if (!acc[key]) acc[key] = [];
        acc[key].push(sale);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            <Header />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-20">
                <SummaryCards
                    totalSales={totalSalesToday}
                    pendingPayments={pendingPayments}
                    paidOrders={paidOrders}
                    totalRevenue={totalRevenueToday}
                />

                <SalesEntryForm onAddRecord={handleAddRecord} />

                <div>
                    <FilterSection currentFilter={filter} onFilterChange={setFilter} />
                    {loading ? (
                        <div className="flex flex-col items-center py-16 text-gray-400">
                            <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-3"></div>
                            <p className="text-sm font-semibold">Loading records...</p>
                        </div>
                    ) : (
                        <RecordsTable
                            groupedSales={groupedSales}
                            onMarkItemPaid={handleMarkItemPaid}
                            onMarkPaid={handleMarkPaid}
                            onMarkDelivered={handleMarkDelivered}
                            onDelete={handleDelete}
                            onWhatsAppReminder={handleWhatsAppReminder}
                        />
                    )}
                </div>
            </main>

            {/* Receipt Modal */}
            {showReceiptModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-white w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col shadow-2xl max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <div>
                                <p className="font-black text-gray-900">Payment Confirmed ✅</p>
                                <p className="text-xs text-gray-400 mt-0.5">Receipt ready to share</p>
                            </div>
                            <button
                                onClick={() => setShowReceiptModal(false)}
                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                            >
                                <FiX size={16} className="text-gray-600" />
                            </button>
                        </div>

                        {/* Receipt Preview */}
                        <div className="overflow-y-auto flex-1 bg-gray-50 flex justify-center p-4">
                            <Receipt ref={receiptRef} receiptData={currentReceiptData} />
                        </div>

                        {/* Actions */}
                        <div className="p-4 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={downloadReceipt}
                                className="flex-1 flex items-center justify-center gap-2 bg-black text-white font-bold py-3.5 rounded-xl active:scale-95 transition-all text-sm"
                            >
                                <FiDownload size={16} /> Download PDF
                            </button>
                            <button
                                onClick={shareReceiptWhatsApp}
                                className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3.5 rounded-xl active:scale-95 transition-all text-sm hover:bg-green-600"
                            >
                                <FaWhatsapp size={18} /> Share
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
