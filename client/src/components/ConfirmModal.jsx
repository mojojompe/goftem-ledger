import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

/**
 * Reusable confirmation modal.
 * Props: open, title, message, confirmLabel, confirmColor, onConfirm, onCancel
 */
const ConfirmModal = ({
    open,
    title = 'Are you sure?',
    message,
    confirmLabel = 'Confirm',
    confirmColor = 'red', // 'red' | 'black' | 'green'
    onConfirm,
    onCancel,
}) => {
    if (!open) return null;

    const btnColors = {
        red: 'bg-red-500 hover:bg-red-600 text-white',
        black: 'bg-black hover:bg-gray-800 text-white',
        green: 'bg-green-500 hover:bg-green-600 text-white',
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-red-50 rounded-xl shrink-0">
                            <FiAlertTriangle size={20} className="text-red-500" />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 text-base">{title}</h3>
                            {message && <p className="text-sm text-gray-500 mt-1 leading-relaxed">{message}</p>}
                        </div>
                    </div>
                </div>
                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 active:scale-95 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm active:scale-95 transition-all ${btnColors[confirmColor]}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
