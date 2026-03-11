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
import ReportsTab from '../components/ReportsTab';
import { format, isToday } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FiX, FiDownload, FiList, FiBarChart2 } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const Dashboard = () => {
    // ── Global App State ──────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState('records'); // 'records' | 'reports'

    // Data State
    const [sales, setSales] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    // Filtering & Pagination State
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateRange, setDateRange] = useState({ start: new Date(), end: new Date() }); // Default Today
    const [pagination, setPagination] = useState({ page: 1, limit: 30, hasNextPage: false, totalRecords: 0 });
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Modals
    const [showSearch, setShowSearch] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [currentReceiptData, setCurrentReceiptData] = useState(null);
    const receiptRef = useRef(null);
    const [deleteModal, setDeleteModal] = useState({ open: false, sale: null });
    const [alertModal, setAlertModal] = useState({ open: false, title: '', message: '' });

    // ── Fetching Data ─────────────────────────────────────────────────────────
    const loadSales = async (page = 1, append = false) => {
        try {
            const params = {
                page,
                limit: pagination.limit,
                includeAnalytics: page === 1, // Only fetch analytics on fresh load
            };
            if (dateRange.start && dateRange.end) {
                params.startDate = dateRange.start.toISOString();
                params.endDate = dateRange.end.toISOString();
            }

            const data = await salesService.getSales(params);

            if (append) {
                setSales(prev => [...prev, ...data.sales]);
            } else {
                setSales(data.sales);
            }
            if (data.analytics) setAnalytics(data.analytics);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Fetch error:', error);
            showAlert('Error', 'Failed to load records.');
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    };

    // Reload when date range changes
    useEffect(() => {
        setLoading(true);
        loadSales(1, false);
    }, [dateRange]);

    const handleLoadMore = () => {
        if (!pagination.hasNextPage) return;
        setIsLoadingMore(true);
        loadSales(pagination.currentPage + 1, true);
    };

    const showAlert = (title, message) => setAlertModal({ open: true, title, message });
    const showReceipt = (saleData) => { setCurrentReceiptData(saleData); setShowReceiptModal(true); };

    // ── Excel Export ──────────────────────────────────────────────────────────
    const handleExportExcel = async () => {
        setIsExporting(true);
        try {
            // Re-fetch all matching records strictly for export (unpaginated/high limit)
            const params = { page: 1, limit: 10000 };
            if (dateRange.start && dateRange.end) {
                params.startDate = dateRange.start.toISOString();
                params.endDate = dateRange.end.toISOString();
            }
            const data = await salesService.getSales(params);
            const exportData = data.sales.map(s => {
                const total = getSaleTotal(s);
                const itemsStr = s.items && s.items.length > 0
                    ? s.items.map(i => `${i.name} (${i.quantity || 1} x ₦${i.price})`).join(' | ')
                    : s.item;
                return {
                    'Order ID': s._id.substring(0, 8).toUpperCase(),
                    'Date': format(new Date(s.date || s.createdAt), 'yyyy-MM-dd HH:mm'),
                    'Customer Name': s.buyerName,
                    'Items Purchased': itemsStr,
                    'Total Amount (₦)': total,
                    'Payment Status': s.paymentStatus.toUpperCase(),
                    'Delivery Status': s.deliveryStatus.toUpperCase(),
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
            saveAs(blob, `GOFTEM_Sales_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
        } catch (err) {
            showAlert('Export Failed', 'Could not generate the Excel file. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    // ── CRUD Handlers ─────────────────────────────────────────────────────────
    const handleAddRecord = async (newSale) => {
        try {
            const savedSale = await salesService.createSale(newSale);
            setSales(prev => [savedSale, ...prev]);
            // If the active filter is 'Today', or if there's no filter, re-run full load to update analytics
            if (!dateRange.start || (isToday(dateRange.start) && isToday(dateRange.end))) {
                loadSales(1, false);
            }
            if (savedSale.paymentStatus === 'paid') showReceipt(savedSale);
        } catch (error) {
            showAlert('Error', 'Failed to add sale record. Please try again.');
        }
    };

    const handleMarkPaid = async (sale) => {
        try {
            const updatedSale = await salesService.updatePaymentStatus(sale._id, 'paid');
            setSales(prev => prev.map(s => s._id === sale._id ? updatedSale : s));
            loadSales(1, false); // Refresh to update analytics
            showReceipt(updatedSale);
        } catch (error) { console.error('Error marking paid:', error); }
    };

    const handleMarkItemPaid = async (saleId, itemIndex) => {
        try {
            const updatedSale = await salesService.updateItemPaymentStatus(saleId, itemIndex, 'paid');
            setSales(prev => prev.map(s => s._id === saleId ? updatedSale : s));
            if (updatedSale.paymentStatus === 'paid') {
                loadSales(1, false);
                showReceipt(updatedSale);
            }
        } catch (error) { console.error('Error marking item paid:', error); }
    };

    const handleMarkDelivered = async (id) => {
        try {
            const updatedSale = await salesService.updateDeliveryStatus(id, 'delivered');
            setSales(prev => prev.map(s => s._id === id ? updatedSale : s));
        } catch (error) { console.error('Error marking delivered:', error); }
    };

    const handleDeleteConfirm = async () => {
        const { sale } = deleteModal;
        setDeleteModal({ open: false, sale: null });
        try {
            await salesService.deleteSale(sale._id);
            setSales(prev => prev.filter(s => s._id !== sale._id));
            loadSales(1, false); // refresh analytics
        } catch (error) {
            showAlert('Error', 'Failed to delete record. Please try again.');
        }
    };

    const handleWhatsAppReminder = (sale) => {
        let unpaidItems = sale.items && sale.items.length > 0 ? sale.items.filter(i => i.paymentStatus !== 'paid') : [{ name: sale.item, price: sale.price, quantity: 1 }];
        if (unpaidItems.length === 0) return;
        const itemsList = unpaidItems.map(i => {
            const qty = i.quantity || 1;
            return `• ${i.name}${qty > 1 ? ` (×${qty})` : ''}: ₦${(i.price * qty).toLocaleString()}`;
        }).join('\n');
        const unpaidTotal = unpaidItems.reduce((s, i) => s + i.price * (i.quantity || 1), 0);
        const message = `Hello ${sale.buyerName}, this is GOFTEM STORES.\n\nThis is a reminder that the following payment(s) are still pending:\n\n${itemsList}\n\nOutstanding: ₦${unpaidTotal.toLocaleString()}\n\nThank you.`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    // ── Receipt ───────────────────────────────────────────────────────────────
    const captureCanvas = useCallback(async () => {
        const el = receiptRef.current;
        if (!el) return null;
        const container = document.createElement('div');
        container.style.cssText = `position: fixed; top: -9999px; left: -9999px; width: ${el.scrollWidth}px; height: ${el.scrollHeight}px; overflow: visible; background: #ffffff; z-index: -1;`;
        const clone = el.cloneNode(true);
        clone.style.cssText = `width: ${el.scrollWidth}px; height: ${el.scrollHeight}px; overflow: visible;`;
        container.appendChild(clone);
        document.body.appendChild(container);

        try {
            return await html2canvas(clone, { scale: 3, useCORS: true, allowTaint: false, backgroundColor: '#ffffff', logging: false, width: el.scrollWidth, height: el.scrollHeight, windowWidth: el.scrollWidth, windowHeight: el.scrollHeight });
        } finally { document.body.removeChild(container); }
    }, []);

    const downloadReceipt = async () => {
        try {
            const canvas = await captureCanvas();
            if (!canvas) return;
            const link = document.createElement('a');
            link.download = `GOFTEM-Receipt-${currentReceiptData.buyerName}-${format(new Date(), 'yyyyMMdd')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) { showAlert('Download Error', 'Could not generate receipt image. Please try again.'); }
    };

    const shareReceiptWhatsApp = async () => {
        const rData = currentReceiptData;
        const items = rData.items && rData.items.length > 0 ? rData.items : [{ name: rData.item, price: rData.price, quantity: 1 }];
        const itemsList = items.map(i => {
            const qty = i.quantity || 1;
            return `• ${i.name}${qty > 1 ? ` (×${qty})` : ''}: ₦${(i.price * qty).toLocaleString()}`;
        }).join('\n');
        const total = getSaleTotal(rData);
        const textMessage = `Hello ${rData.buyerName}, here is your receipt from GOFTEM STORES.\n\n${itemsList}\n\nTotal: ₦${total.toLocaleString()}\nStatus: PAID ✅\nDate: ${format(new Date(rData.date), 'MMM dd, yyyy')}\n\nThank you for your business! 🙏`;

        try {
            const canvas = await captureCanvas();
            if (canvas) {
                const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
                const file = new File([blob], `GOFTEM-Receipt-${rData.buyerName}.png`, { type: 'image/png' });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({ title: 'GOFTEM STORES Receipt', text: textMessage, files: [file] });
                    return;
                }
            }
        } catch (err) { if (err.name === 'AbortError') return; }
        window.open(`https://wa.me/?text=${encodeURIComponent(textMessage)}`, '_blank');
    };

    // ── Pre-calculate values ──────────────────────────────────────────────────
    const totalSalesNum = pagination.totalRecords || 0;
    const pendingPaymentsNum = sales.filter(s => s.paymentStatus === 'pending').length; // accurate for current loaded page
    const paidOrdersNum = sales.filter(s => s.paymentStatus === 'paid').length;
    const totalRevenueNum = sales.filter(s => s.paymentStatus === 'paid').reduce((sum, s) => sum + getSaleTotal(s), 0);

    const filteredSales = sales.filter(sale => {
        if (statusFilter === 'Pending Payments') return sale.paymentStatus === 'pending';
        if (statusFilter === 'Paid') return sale.paymentStatus === 'paid';
        return true;
    });

    const groupedSales = filteredSales.reduce((acc, sale) => {
        const key = format(new Date(sale.date || sale.createdAt), 'MMMM d, yyyy');
        if (!acc[key]) acc[key] = [];
        acc[key].push(sale);
        return acc;
    }, {});


    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            <Header onSearchOpen={() => setShowSearch(true)} />

            {/* Main Tabs Navigation */}
            <div className="bg-white border-b border-gray-100 px-4 sm:px-6 sticky top-[61px] z-40">
                <div className="max-w-5xl mx-auto flex gap-6">
                    <button
                        onClick={() => setActiveTab('records')}
                        className={`py-3.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                            activeTab === 'records' ? 'border-yellow-400 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-700'
                        }`}
                    >
                        <FiList size={16} /> Sales Records
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`py-3.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                            activeTab === 'reports' ? 'border-yellow-400 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-700'
                        }`}
                    >
                        <FiBarChart2 size={16} /> Reports
                    </button>
                </div>
            </div>

            <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-6 pb-20">
                
                {/* Always show Filter/Summary at top unless switching completely out. 
                    Actually, we'll keep Filter Section global so Date Range applies to Reports too. */}
                <FilterSection
                    currentStatusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    onExportExcel={handleExportExcel}
                    isExporting={isExporting}
                />

                {loading ? (
                    <div className="flex flex-col items-center py-16 text-gray-400">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-3"></div>
                        <p className="text-sm font-semibold">Loading data...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'records' ? (
                            <div className="space-y-6">
                                <SummaryCards
                                    totalSales={totalSalesNum}
                                    pendingPayments={pendingPaymentsNum} // Note: This shows pending in loaded subset
                                    paidOrders={paidOrdersNum}
                                    totalRevenue={totalRevenueNum} // Note: This shows revenue in loaded subset
                                />
                                <SalesEntryForm onAddRecord={handleAddRecord} />
                                <RecordsTable
                                    groupedSales={groupedSales}
                                    onMarkItemPaid={handleMarkItemPaid}
                                    onMarkPaid={handleMarkPaid}
                                    onMarkDelivered={handleMarkDelivered}
                                    onDelete={(s) => setDeleteModal({ open: true, sale: s })}
                                    onWhatsAppReminder={handleWhatsAppReminder}
                                    onShowReceipt={showReceipt}
                                    hasNextPage={pagination.hasNextPage}
                                    onLoadMore={handleLoadMore}
                                    isLoadingMore={isLoadingMore}
                                />
                            </div>
                        ) : (
                            <ReportsTab 
                                analytics={analytics} 
                                totalRevenue={totalRevenueNum} 
                            />
                        )}
                    </>
                )}
            </main>

            {/* Modals */}
            <SearchModal open={showSearch} onClose={() => setShowSearch(false)} sales={sales} onShowReceipt={showReceipt} />
            
            {showReceiptModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-white w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col shadow-2xl max-h-[90vh]">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <div><p className="font-black text-gray-900">Receipt</p><p className="text-xs text-gray-400 mt-0.5">Download or share with customer</p></div>
                            <button onClick={() => setShowReceiptModal(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"><FiX size={16} className="text-gray-600" /></button>
                        </div>
                        <div className="overflow-y-auto flex-1 bg-gray-50 flex justify-center p-4"><Receipt ref={receiptRef} receiptData={currentReceiptData} /></div>
                        <div className="p-4 border-t border-gray-100 flex gap-3">
                            <button onClick={downloadReceipt} className="flex-1 flex items-center justify-center gap-2 bg-black text-white font-bold py-3.5 rounded-xl active:scale-95 transition-all text-sm"><FiDownload size={16} /> Download</button>
                            <button onClick={shareReceiptWhatsApp} className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3.5 rounded-xl active:scale-95 transition-all text-sm hover:bg-green-600"><FaWhatsapp size={18} /> Share</button>
                        </div>
                    </div>
                </div>
            )}
            
            <ConfirmModal open={deleteModal.open} title="Delete Record?" message={`This will permanently delete the sale record for "${deleteModal.sale?.buyerName}". This action cannot be undone.`} confirmLabel="Delete" confirmColor="red" onConfirm={handleDeleteConfirm} onCancel={() => setDeleteModal({ open: false, sale: null })} />
            <ConfirmModal open={alertModal.open} title={alertModal.title} message={alertModal.message} confirmLabel="OK" confirmColor="black" onConfirm={() => setAlertModal({ open: false, title: '', message: '' })} onCancel={() => setAlertModal({ open: false, title: '', message: '' })} />
        </div>
    );
};

export default Dashboard;
