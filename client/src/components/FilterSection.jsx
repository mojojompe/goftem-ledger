import React from 'react';

const FilterSection = ({ currentFilter, onFilterChange }) => {
    const filters = [
        { id: 'All', label: 'All' },
        { id: 'Today', label: 'Today' },
        { id: 'Pending Payments', label: 'Pending Payments' },
        { id: 'Paid', label: 'Paid' },
    ];

    return (
        <div className="flex flex-wrap gap-3 mb-6">
            {filters.map((filter) => (
                <button
                    key={filter.id}
                    onClick={() => onFilterChange(filter.id)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${currentFilter === filter.id
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    );
};

export default FilterSection;
