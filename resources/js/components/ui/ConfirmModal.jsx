import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function ConfirmModal({ title, message, confirmLabel = 'Confirm', danger = true, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${danger ? 'bg-red-100' : 'bg-yellow-100'}`}>
          <ExclamationTriangleIcon className={`h-6 w-6 ${danger ? 'text-red-600' : 'text-yellow-600'}`} />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-raisin">{title}</h3>
          <p className="mt-1 text-sm text-warm-gray">{message}</p>
        </div>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-200 text-warm-gray py-2.5 rounded-xl hover:bg-gray-50 transition font-semibold text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
