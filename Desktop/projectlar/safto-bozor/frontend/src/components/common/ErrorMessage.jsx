import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
        <span className="text-red-800">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;