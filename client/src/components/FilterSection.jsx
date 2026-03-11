import React from 'react';

const filters = [
    { id: 'All', label: 'All' },
    { id: 'Today', label: 'Today' },
    { id: 'Pending Payments', label: 'Pending' },
    { id: 'Paid', label: 'Paid' },
];

const FilterSection = ({ currentFilter, onFilterChange }) => {
    return (
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4 no-scrollbar">
            {filters.map((f) => (
                <button
                    key={f.id}
                    onClick={() => onFilterChange(f.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${currentFilter === f.id
                            ? 'bg-black text-white shadow-md'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                        }`}
                >
                    {f.label}
                </button>
            ))}
        </div>
    );
};

export default FilterSection;
