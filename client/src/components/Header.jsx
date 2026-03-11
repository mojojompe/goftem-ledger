import React from 'react';

const Header = () => {
    return (
        <header style={{ fontFamily: 'Inter, system-ui, sans-serif' }} className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo + Brand */}
                <div className="flex items-center gap-3">
                    <div className="bg-black rounded-xl p-1.5 shadow-md">
                        <img src="/Logo.png" alt="GOFTEM" className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                        <p className="text-base font-black text-gray-900 leading-none tracking-tight">
                            GOFTEM <span className="text-yellow-500">STORES</span>
                        </p>
                        <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase mt-0.5">Sales Tracker</p>
                    </div>
                </div>

                {/* Status pill */}
                <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[11px] font-bold text-green-700 uppercase tracking-wider hidden sm:inline">Live</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
