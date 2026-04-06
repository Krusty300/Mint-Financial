import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ 
  value, 
  onChange, 
  placeholder = "Select date",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(false);
  };

  const displayDate = value ? format(parseISO(value), 'MMM dd, yyyy') : placeholder;

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white ${className}`}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        aria-label="Select date"
        aria-expanded={isOpen}
        tabIndex={0}
      >
        <Calendar className="w-4 h-4 text-gray-400" />
        <span className="text-gray-900 flex-1 min-w-0">
          {displayDate}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>
      
      {isOpen && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-2">
          <input
            type="date"
            value={value}
            onChange={handleDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 p-1 text-gray-600 hover:text-gray-900"
            aria-label="Close date picker"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};
