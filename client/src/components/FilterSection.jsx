import React, { useState } from 'react';
import { FiCalendar, FiFilter, FiDownload } from 'react-icons/fi';
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';

const PRESETS = [
    { label: 'Today', getValue: () => ({ start: new Date(), end: new Date() }) },
    { label: 'Yesterday', getValue: () => { const d = subDays(new Date(), 1); return { start: d, end: d }; } },
    { label: 'This Week', getValue: () => ({ start: startOfWeek(new Date(), { weekStartsOn: 1 }), end: endOfWeek(new Date(), { weekStartsOn: 1 }) }) },
    { label: 'This Month', getValue: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }) },
];

const FilterSection = ({
    currentStatusFilter,
    onStatusFilterChange,
    dateRange,
    onDateRangeChange,
    onExportExcel,
    isExporting
}) => {
    const [showDateCustomizer, setShowDateCustomizer] = useState(false);
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    const STATUS_FILTERS = ['All', 'Paid', 'Pending Payments'];

    const handlePresetClick = (preset) => {
        const { start, end } = preset.getValue();
        onDateRangeChange({ start, end });
        setShowDateCustomizer(false);
    };

    const handleCustomApply = () => {
        if (customStart && customEnd) {
            onDateRangeChange({ start: new Date(customStart), end: new Date(customEnd) });
            setShowDateCustomizer(false);
        }
    };

    const getDateLabel = () => {
        if (!dateRange.start || !dateRange.end) return 'All Time';
        if (format(dateRange.start, 'yyyy-MM-dd') === format(dateRange.end, 'yyyy-MM-dd')) {
            if (format(dateRange.start, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) return 'Today';
            if (format(dateRange.start, 'yyyy-MM-dd') === format(subDays(new Date(), 1), 'yyyy-MM-dd')) return 'Yesterday';
            return format(dateRange.start, 'MMM d, yyyy');
        }
        return `${format(dateRange.start, 'MMM d')} - ${format(dateRange.end, 'MMM d, yyyy')}`;
    };

    return (
        <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                {/* Left: Status Tabs */}
                <div className="flex overflow-x-auto pb-2 sm:pb-0 scrollbar-hide gap-2">
                    {STATUS_FILTERS.map(filter => (
                        <button
                            key={filter}
                            onClick={() => onStatusFilterChange(filter)}
                            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                                currentStatusFilter === filter
                                    ? 'bg-black text-white border-black'
                                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Right: Date Picker & Export */}
                <div className="flex items-center gap-2 self-start sm:self-auto relative">
                    <button
                        onClick={() => setShowDateCustomizer(!showDateCustomizer)}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <FiCalendar size={14} className="text-gray-400" />
                        {getDateLabel()}
                    </button>

                    <button
                        onClick={onExportExcel}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-bold hover:bg-green-100 transition-colors disabled:opacity-50"
                        title="Export current view to Excel"
                    >
                        <FiDownload size={14} />
                        <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export XLS'}</span>
                    </button>

                    {/* Date Customizer Dropdown */}
                    {showDateCustomizer && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20">
                            <div className="p-2 border-b border-gray-100">
                                {PRESETS.map(preset => (
                                    <button
                                        key={preset.label}
                                        onClick={() => handlePresetClick(preset)}
                                        className="w-full text-left px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                                <button
                                    onClick={() => onDateRangeChange({ start: null, end: null })}
                                    className="w-full text-left px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    All Time
                                </button>
                            </div>
                            <div className="p-3 bg-gray-50 space-y-3">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Custom Range</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="date"
                                        value={customStart}
                                        onChange={(e) => setCustomStart(e.target.value)}
                                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-200"
                                    />
                                    <input
                                        type="date"
                                        value={customEnd}
                                        onChange={(e) => setCustomEnd(e.target.value)}
                                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-200"
                                    />
                                </div>
                                <button
                                    onClick={handleCustomApply}
                                    disabled={!customStart || !customEnd}
                                    className="w-full py-2 bg-black text-white text-xs font-bold rounded-lg disabled:opacity-50 hover:bg-gray-900 transition-colors"
                                >
                                    Apply Custom Range
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilterSection;
