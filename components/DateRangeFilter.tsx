"use client";

import { DateRange } from "@/types";

interface DateRangeFilterProps {
  dateRange: DateRange;
  onChange: (dateRange: DateRange) => void;
}

export default function DateRangeFilter({
  dateRange,
  onChange,
}: DateRangeFilterProps) {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...dateRange,
      start: new Date(e.target.value),
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...dateRange,
      end: new Date(e.target.value),
    });
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Date Range</h3>

      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">From:</label>
          <input
            type="date"
            value={formatDateForInput(dateRange.start)}
            onChange={handleStartDateChange}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">To:</label>
          <input
            type="date"
            value={formatDateForInput(dateRange.end)}
            onChange={handleEndDateChange}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={() => {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 30);
            onChange({ start, end });
          }}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition"
        >
          Last 30 Days
        </button>

        <button
          onClick={() => {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 90);
            onChange({ start, end });
          }}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition"
        >
          Last 90 Days
        </button>
      </div>
    </div>
  );
}
