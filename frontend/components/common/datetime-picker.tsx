"use client";

import React, { useState, useEffect, useRef } from "react";
import { subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths,format, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Preset {
    label: string;
    getRange: () => [Date | null, Date | null];
}

interface DateTimePickerProps {
    value?: [Date | null, Date | null];
    onChange?: (range: [Date | null, Date | null]) => void;
    presets?: Preset[];
    minDate?: Date;
    maxDate?: Date;
    displayMonths?: number;
}

const PRESETS: Preset[] = [
    { label: "Today", getRange: () => [new Date(), new Date()] },
    { label: "Yesterday", getRange: () => [subDays(new Date(), 1), subDays(new Date(), 1)] },
    { label: "This week", getRange: () => [startOfWeek(new Date(), { weekStartsOn: 1 }), endOfWeek(new Date(), { weekStartsOn: 1 })] },
    { label: "Last week", getRange: () => [startOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 }), endOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 })] },
    { label: "This month", getRange: () => [startOfMonth(new Date()), endOfMonth(new Date())] },
    { label: "Last month", getRange: () => [startOfMonth(subMonths(new Date(), 1)), endOfMonth(subMonths(new Date(), 1))] },
    { label: "This year", getRange: () => [startOfYear(new Date()), endOfYear(new Date())] },
];

function getMonthMatrix(year: number, month: number): Date[][] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const matrix: Date[][] = [];
    let week: Date[] = [];
    let day = new Date(firstDay);
    day.setDate(day.getDate() - ((day.getDay() + 6) % 7)); // Monday as first day
    let safety = 0; // Prevent infinite loop
    while ((day <= lastDay || week.length < 7) && safety < 42) { // 6 weeks max
    week.push(new Date(day));
    if (week.length === 7) {
        matrix.push(week);
        week = [];
    }
    day.setDate(day.getDate() + 1);
    safety++;
    }
    return matrix;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
    value,
    onChange,
    presets = PRESETS,
    minDate,
    maxDate,
}) => {
    const [open, setOpen] = useState(false);
    const [range, setRange] = useState<[Date | null, Date | null]>(value || [null, null]);
    const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

    // Sync internal state with value prop
    useEffect(() => {
        setRange(value || [null, null]);
    }, [value]);

    // Each calendar has its own month/year
    const today = new Date();
    const initialLeft = range[0] || today;
    const initialRight = range[1] && range[1] > initialLeft
        ? range[1]
        : new Date(initialLeft.getFullYear(), initialLeft.getMonth() + 1, 1);
    const [leftMonth, setLeftMonth] = useState<{ year: number; month: number }>({ year: initialLeft.getFullYear(), month: initialLeft.getMonth() });
    const [rightMonth, setRightMonth] = useState<{ year: number; month: number }>({ year: initialRight.getFullYear(), month: initialRight.getMonth() });

    // Prevent left calendar from being after right calendar
    const handleLeftNav = (delta: number) => {
    const newMonth = new Date(leftMonth.year, leftMonth.month + delta, 1);
    
    // Don't allow left calendar to be after right calendar
    if (newMonth.getFullYear() > rightMonth.year || (newMonth.getFullYear() === rightMonth.year && newMonth.getMonth() >= rightMonth.month)) return;
        setLeftMonth({ year: newMonth.getFullYear(), month: newMonth.getMonth() });
    };
    const handleRightNav = (delta: number) => {
    const newMonth = new Date(rightMonth.year, rightMonth.month + delta, 1);

    // Don't allow right calendar to be before left calendar
    if (newMonth.getFullYear() < leftMonth.year || (newMonth.getFullYear() === leftMonth.year && newMonth.getMonth() <= leftMonth.month)) return;
        setRightMonth({ year: newMonth.getFullYear(), month: newMonth.getMonth() });
    };

    // Click outside to dismiss date picker
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    /**
     * Handle day click
     * @param date - The date to be clicked
     */
    const handleDayClick = (date: Date) => {
        if (!range[0] || (range[0] && range[1])) {
            setRange([date, null]);
        } else {
            // Only allow end date after start date
            if (date < range[0]) setRange([date, null]);
            else setRange([range[0], date]);
        }
    };

    /**
     * Handle preset click
     * @param preset - The preset to be clicked
     */
    const handlePreset = (preset: Preset) => {
        const [start, end] = preset.getRange();
        setRange([start, end]);
        if (onChange) onChange([start, end]);
        setOpen(false);
    };

    /**
     * Handle apply
     */
    const handleApply = () => {
        if (onChange) onChange(range);
        setOpen(false);
    };

    /**
     * Handle cancel
     */
    const handleCancel = () => {
        setRange([null, null]);
        if (onChange) onChange([null, null]);
        setOpen(false);
    };

    /**
     * Render calendar
     * @param year - The year of the calendar
     * @param month - The month of the calendar
     * @param idx - The index of the calendar
     * @param isLeft - Whether the calendar is the left calendar
     */
    const renderCalendar = (year: number, month: number, idx: number, isLeft: boolean) => {
        const matrix = getMonthMatrix(year, month);

        return (
            <div key={`${year}-${month}-${idx}`} className="flex flex-col items-center px-4 min-w-[320px] font-regular-eng">

                {/* Month and year */}
                <div className="flex items-center justify-between w-full mb-2">
                    <button onClick={() => isLeft ? handleLeftNav(-1) : handleRightNav(-1)} className="cursor-pointer" aria-label="Prev Month"><ChevronLeft size={20} className="text-primary-light" /></button>
                    <span className="font-semibold text-base">{format(new Date(year, month), "MMMM yyyy")}</span>
                    <button onClick={() => isLeft ? handleLeftNav(1) : handleRightNav(1)} className="cursor-pointer" aria-label="Next Month"><ChevronRight size={20} className="text-primary-light" /></button>
                </div>

                {/* Days of the week */}
                <div className="grid grid-cols-7 gap-5 text-base text-center mb-1">
                    {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                        <div key={d} className="font-bold text-gray-500 pb-1 text-xs">{d}</div>
                    ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-1 text-xs text-center">
                    {matrix.flat().map((date, i) => {
                        const isCurrentMonth = date.getMonth() === month;
                        const isSelected =
                            (range[0] && isSameDay(date, range[0])) ||
                            (range[1] && isSameDay(date, range[1]));
                        const inRange =
                            range[0] && range[1] && date > range[0] && date < range[1];
                        const isDisabled =
                            (minDate && date < minDate) ||
                            (maxDate && date > maxDate) ||
                            !isCurrentMonth;
                        const isHovered =
                            range[0] && !range[1] && hoveredDate &&
                            ((date > range[0] && date <= hoveredDate) || (date < range[0] && date >= hoveredDate));
                        return (
                            <button
                                key={i}
                                className={`rounded-lg w-[33px] h-[33px] flex items-center justify-center transition-colors
                                    ${isSelected ? "bg-primary-light text-white font-bold" : ""}
                                    ${inRange || isHovered ? "bg-primary-light/20" : ""}
                                    ${isDisabled ? "text-gray-300 cursor-not-allowed" : "hover:bg-primary-light/10"}
                                    ${!isCurrentMonth ? "opacity-40" : ""}
                                `}
                                disabled={isDisabled}
                                onClick={() => handleDayClick(date)}
                                onMouseEnter={() => setHoveredDate(date)}
                                onMouseLeave={() => setHoveredDate(null)}
                                tabIndex={isDisabled ? -1 : 0}
                                aria-label={format(date, "yyyy-MM-dd")}
                            >
                            {date.getDate()}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    /**
     * Format range for display
     */
    const displayValue = range[0] && range[1]
        ? `${format(range[0], "MMM d, yyyy")} - ${format(range[1], "MMM d, yyyy")}`
        : "Select date range";

    return (
        <div className="relative inline-block" ref={pickerRef}>
            <button
                className="border rounded-lg px-3 py-2 flex items-center gap-2 bg-white hover:shadow focus:outline-none cursor-pointer border-gray-300"
                onClick={() => setOpen((v) => !v)}
                type="button"
                aria-haspopup="dialog"
                aria-expanded={open}
            >
                <span className="text-gray-500 text-sm">{displayValue}</span>
            </button>

            {/* Calendar */}
            {open && (
                <div className="absolute z-50 mt-2 bg-white border rounded-xl shadow-xl p-4 flex flex-col md:flex-row gap-8" role="dialog">

                    {/* Presets */}
                    <div className="flex flex-col gap-2 min-w-[140px]">
                        {presets.map((preset) => (
                            <button
                                key={preset.label}
                                className="text-left px-3 py-2 rounded-lg hover:bg-primary-light/10 text-gray-700 text-sm cursor-pointer"
                                onClick={() => handlePreset(preset)}
                                type="button"
                            >
                            {preset.label}
                            </button>
                        ))}
                    </div>

                    {/* Calendars */}
                    <div className="flex flex-col gap-8">

                        <div className="flex flex-col md:flex-row gap-8 ">
                            {/* Left calendar */}
                            {renderCalendar(leftMonth.year, leftMonth.month, 0, true)}

                            {/* Right calendar */}
                            {renderCalendar(rightMonth.year, rightMonth.month, 1, false)}
                        </div>
                        
                        {/* Date range display */}
                        <div className="flex flex-col justify-end gap-2 ml-4 text-xs">
                            <div className="flex gap-2">
                            <input
                                type="text"
                                className="border rounded px-2 py-1 w-28 text-sm"
                                value={range[0] ? format(range[0], "MMM d, yyyy") : ""}
                                readOnly
                            />
                            <span className="self-center">-</span>
                            <input
                                type="text"
                                className="border rounded px-2 py-1 w-28 text-sm"
                                value={range[1] ? format(range[1], "MMM d, yyyy") : ""}
                                readOnly
                            />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2 mt-2">
                                <button
                                    className="px-3 py-1 rounded-md border border-gray-300 bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 cursor-pointer"
                                    onClick={handleCancel}
                                    type="button"
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-3 py-1 rounded-md bg-orange-500 text-white text-sm hover:bg-orange-600 cursor-pointer"
                                    onClick={handleApply}
                                    type="button"
                                    disabled={!range[0] || !range[1]}
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateTimePicker;