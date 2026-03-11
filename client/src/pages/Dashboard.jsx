import React, { useState, useEffect, useRef, useCallback } from 'react';
import { salesService } from '../services/api';
import Header from '../components/Header';
import SearchModal from '../components/SearchModal';
import SummaryCards from '../components/SummaryCards';
import SalesEntryForm from '../components/SalesEntryForm';
import FilterSection from '../components/FilterSection';
import RecordsTable, { getSaleTotal, getPaidTotal } from '../components/RecordsTable';
import Receipt from '../components/Receipt';
import ConfirmModal from '../components/ConfirmModal';
import { format, isToday } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FiX, FiDownload } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const Dashboard = () => {
    const [sales, setSales] = useState([]);
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(true);

    // Search
    const [showSearch, setShowSearch] = useState(false);

    // Receipt modal
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [currentReceiptData, setCurrentReceiptData] = useState(null);
    const receiptRef = useRef(null);

    // Delete confirm modal
    const [deleteModal, setDeleteModal] = useState({ open: false, sale: null });

    // Alert modal (replaces window.alert)
    const [alertModal, setAlertModal] = useState({ open: false, title: '', message: '' });

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

    const showAlert = (title, message) => setAlertModal({ open: true, title, message });

    const showReceipt = (saleData) => {
        setCurrentReceiptData(saleData);
        setShowReceiptModal(true);
    };

    // ── CRUD handlers ─────────────────────────────────────────────────────────
    const handleAddRecord = async (newSale) => {
        try {
            const savedSale = await salesService.createSale(newSale);
            setSales(prev => [savedSale, ...prev]);
            if (savedSale.paymentStatus === 'paid') showReceipt(savedSale);
        } catch (error) {
            showAlert('Error', 'Failed to add sale record. Please try again.');
        }
    };

    const handleMarkPaid = async (sale) => {
        try {
            const updatedSale = await salesService.updatePaymentStatus(sale._id, 'paid');
            setSales(prev => prev.map(s => s._id === sale._id ? updatedSale : s));
            showReceipt(updatedSale);
        } catch (error) {
            console.error('Error marking paid:', error);
        }
    };

    const handleMarkItemPaid = async (saleId, itemIndex) => {
        try {
            const updatedSale = await salesService.updateItemPaymentStatus(saleId, itemIndex, 'paid');
            setSales(prev => prev.map(s => s._id === saleId ? updatedSale : s));
            if (updatedSale.paymentStatus === 'paid') showReceipt(updatedSale);
        } catch (error) {
            console.error('Error marking item paid:', error);
        }
    };

    const handleMarkDelivered = async (id) => {
        try {
            const updatedSale = await salesService.updateDeliveryStatus(id, 'delivered');
            setSales(prev => prev.map(s => s._id === id ? updatedSale : s));
        } catch (error) {
            console.error('Error marking delivered:', error);
        }
    };

    // Delete uses modal — onDelete receives whole sale object
    const handleDeleteRequest = (sale) => setDeleteModal({ open: true, sale });

    const handleDeleteConfirm = async () => {
        const { sale } = deleteModal;
        setDeleteModal({ open: false, sale: null });
        try {
            await salesService.deleteSale(sale._id);
            setSales(prev => prev.filter(s => s._id !== sale._id));
        } catch (error) {
            showAlert('Error', 'Failed to delete record. Please try again.');
        }
    };

    const handleWhatsAppReminder = (sale) => {
        let unpaidItems;
        if (sale.items && sale.items.length > 0) {
            unpaidItems = sale.items.filter(i => i.paymentStatus !== 'paid');
        } else {
            unpaidItems = [{ name: sale.item, price: sale.price, quantity: 1 }];
        }
        if (unpaidItems.length === 0) return;
        const itemsList = unpaidItems.map(i => {
            const qty = i.quantity || 1;
            return `• ${i.name}${qty > 1 ? ` (×${qty})` : ''}: ₦${(i.price * qty).toLocaleString()}`;
        }).join('\n');
        const unpaidTotal = unpaidItems.reduce((s, i) => s + i.price * (i.quantity || 1), 0);
        const message = `Hello ${sale.buyerName}, this is GOFTEM STORES.\n\nThis is a reminder that the following payment(s) are still pending:\n\n${itemsList}\n\nOutstanding: ₦${unpaidTotal.toLocaleString()}\n\nThank you.`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    // ── Receipt generation ────────────────────────────────────────────────────
    /** Clone receipt outside modal, capture full height, then clean up */
    const captureCanvas = useCallback(async () => {
        const el = receiptRef.current;
        if (!el) return null;

        // Create a temp off-screen container with no overflow clipping
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: -9999px;
            left: -9999px;
            width: ${el.scrollWidth}px;
            height: ${el.scrollHeight}px;
            overflow: visible;
            background: #ffffff;
            z-index: -1;
        `;
        const clone = el.cloneNode(true);
        clone.style.cssText = `
            width: ${el.scrollWidth}px;
            height: ${el.scrollHeight}px;
            overflow: visible;
        `;
        container.appendChild(clone);
        document.body.appendChild(container);

        try {
            const canvas = await html2canvas(clone, {
                scale: 3,
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#ffffff',
                logging: false,
                width: el.scrollWidth,
                height: el.scrollHeight,
                windowWidth: el.scrollWidth,
                windowHeight: el.scrollHeight,
            });
            return canvas;
        } finally {
            document.body.removeChild(container);
        }
    }, []);

    const downloadReceipt = async () => {
        try {
            const canvas = await captureCanvas();
            if (!canvas) return;
            // Download as PNG — more reliable than PDF for mobile
            const link = document.createElement('a');
            link.download = `GOFTEM-Receipt-${currentReceiptData.buyerName}-${format(new Date(), 'yyyyMMdd')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            showAlert('Download Error', 'Could not generate receipt image. Please try again.');
        }
    };

    const shareReceiptWhatsApp = async () => {
        const receiptData = currentReceiptData;
        const items = receiptData.items && receiptData.items.length > 0
            ? receiptData.items
            : [{ name: receiptData.item, price: receiptData.price, quantity: 1 }];

        const itemsList = items.map(i => {
            const qty = i.quantity || 1;
            return `• ${i.name}${qty > 1 ? ` (×${qty})` : ''}: ₦${(i.price * qty).toLocaleString()}`;
        }).join('\n');
        const total = getSaleTotal(receiptData);
        const textMessage = `Hello ${receiptData.buyerName}, here is your receipt from GOFTEM STORES.\n\n${itemsList}\n\nTotal: ₦${total.toLocaleString()}\nStatus: PAID ✅\nDate: ${format(new Date(receiptData.date), 'MMM dd, yyyy')}\n\nThank you for your business! 🙏`;

        // Try Web Share API with image file (works on Android/iOS PWA)
        try {
            const canvas = await captureCanvas();
            if (canvas) {
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                const file = new File([blob], `GOFTEM-Receipt-${receiptData.buyerName}.png`, { type: 'image/png' });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: 'GOFTEM STORES Receipt',
                        text: textMessage,
                        files: [file],
                    });
                    return; // success
                }
            }
        } catch (err) {
            if (err.name === 'AbortError') return; // user cancelled share sheet
        }

        // Fallback: WhatsApp web text link
        window.open(`https://wa.me/?text=${encodeURIComponent(textMessage)}`, '_blank');
    };

    // ── Stats ─────────────────────────────────────────────────────────────────
    const todaySales = sales.filter(s => isToday(new Date(s.date)));
    const totalSalesToday = todaySales.length;
    const pendingPayments = sales.filter(s => s.paymentStatus === 'pending').length;
    const paidOrders = sales.filter(s => s.paymentStatus === 'paid').length;
    const totalRevenueToday = todaySales
        .filter(s => s.paymentStatus === 'paid')
        .reduce((sum, s) => sum + getSaleTotal(s), 0);

    // ── Filter & Group ────────────────────────────────────────────────────────
    const filteredSales = sales.filter(sale => {
        if (filter === 'Today') return isToday(new Date(sale.date));
        if (filter === 'Pending Payments') return sale.paymentStatus === 'pending';
        if (filter === 'Paid') return sale.paymentStatus === 'paid';
        return true;
    });

    const groupedSales = filteredSales.reduce((acc, sale) => {
        const key = format(new Date(sale.date), 'MMMM d, yyyy');
        if (!acc[key]) acc[key] = [];
        acc[key].push(sale);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            <Header onSearchOpen={() => setShowSearch(true)} />

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
                            onDelete={handleDeleteRequest}
                            onWhatsAppReminder={handleWhatsAppReminder}
                            onShowReceipt={showReceipt}
                        />
                    )}
                </div>
            </main>

            {/* ── Search Modal ──────────────────────────────────────────────────── */}
            <SearchModal
                open={showSearch}
                onClose={() => setShowSearch(false)}
                sales={sales}
                onShowReceipt={showReceipt}
            />

            {/* ── Receipt Modal ─────────────────────────────────────────────────── */}
            {showReceiptModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-white w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col shadow-2xl max-h-[90vh]">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <div>
                                <p className="font-black text-gray-900">Receipt</p>
                                <p className="text-xs text-gray-400 mt-0.5">Download or share with customer</p>
                            </div>
                            <button onClick={() => setShowReceiptModal(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                                <FiX size={16} className="text-gray-600" />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 bg-gray-50 flex justify-center p-4">
                            <Receipt ref={receiptRef} receiptData={currentReceiptData} />
                        </div>

                        <div className="p-4 border-t border-gray-100 flex gap-3">
                            <button onClick={downloadReceipt} className="flex-1 flex items-center justify-center gap-2 bg-black text-white font-bold py-3.5 rounded-xl active:scale-95 transition-all text-sm">
                                <FiDownload size={16} /> Download
                            </button>
                            <button onClick={shareReceiptWhatsApp} className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3.5 rounded-xl active:scale-95 transition-all text-sm hover:bg-green-600">
                                <FaWhatsapp size={18} /> Share
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation Modal ─────────────────────────────────────── */}
            <ConfirmModal
                open={deleteModal.open}
                title="Delete Record?"
                message={`This will permanently delete the sale record for "${deleteModal.sale?.buyerName}". This action cannot be undone.`}
                confirmLabel="Delete"
                confirmColor="red"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteModal({ open: false, sale: null })}
            />

            {/* ── Alert Modal ───────────────────────────────────────────────────── */}
            <ConfirmModal
                open={alertModal.open}
                title={alertModal.title}
                message={alertModal.message}
                confirmLabel="OK"
                confirmColor="black"
                onConfirm={() => setAlertModal({ open: false, title: '', message: '' })}
                onCancel={() => setAlertModal({ open: false, title: '', message: '' })}
            />
        </div>
    );
};

export default Dashboard;
