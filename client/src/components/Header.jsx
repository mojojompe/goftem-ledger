import React from 'react';

const Header = () => {
    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-center space-x-3">
                <img src="/Logo.png" alt="GOFTEM STORES Logo" className="w-10 h-10 object-contain" />
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    GOFTEM STORES <span className="text-blue-600 font-medium">Sales Tracker</span>
                </h1>
            </div>
        </header>
    );
};

export default Header;
