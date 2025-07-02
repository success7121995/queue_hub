"use client"

import React, { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";

interface TimePickerProps {
	value: string;
	onChange: (val: string) => void;
	disabled?: boolean;
	format?: string; // e.g. 'HH:mm:ss' or 'HH:mm'
}

const pad = (n: number) => n.toString().padStart(2, '0');

const parseTime = (val: string) => {
	// Accepts '13:30:00' or '13:30'
	const [h = '00', m = '00', s = '00'] = val.split(":");
	return { hour: parseInt(h, 10), minute: parseInt(m, 10), second: parseInt(s, 10) };
};

const TimePicker: React.FC<TimePickerProps & { className?: string; style?: React.CSSProperties }> = ({ value, onChange, disabled, format = 'HH:mm:ss', className = '', style }) => {
	const [open, setOpen] = useState(false);
	const [internal, setInternal] = useState(parseTime(value || '09:00:00'));
	const inputRef = useRef<HTMLInputElement>(null);
	const timePickerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (timePickerRef.current && !timePickerRef.current.contains(event.target as Node)) {
				setOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [timePickerRef]);

	useEffect(() => {
		setInternal(parseTime(value || '09:00:00'));
	}, [value]);

	const handleSelect = (type: 'hour' | 'minute' | 'second', val: number) => {
		setInternal(prev => ({ ...prev, [type]: val }));
	};

	const handleOk = () => {
		const timeStr =
			format === 'HH:mm'
				? `${pad(internal.hour)}:${pad(internal.minute)}`
				: `${pad(internal.hour)}:${pad(internal.minute)}:${pad(internal.second)}`;
		onChange(timeStr);
		setOpen(false);
	};

	const handleCancel = () => {
		setOpen(false);
		setInternal(parseTime(value || '09:00:00'));
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInternal(parseTime(e.target.value));
	};

	// Generate options for 24-hour format
	const hours = Array.from({ length: 24 }, (_, i) => i); // 0-23
	const minutes = Array.from({ length: 60 }, (_, i) => i);
	const seconds = Array.from({ length: 60 }, (_, i) => i);

	// For scroll-to-selected
	const hourRef = useRef<HTMLDivElement>(null);
	const minuteRef = useRef<HTMLDivElement>(null);
	const secondRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (open) {
			setTimeout(() => {
				hourRef.current?.querySelector('.selected')?.scrollIntoView({ block: 'center' });
				minuteRef.current?.querySelector('.selected')?.scrollIntoView({ block: 'center' });
				secondRef.current?.querySelector('.selected')?.scrollIntoView({ block: 'center' });
			}, 0);
		}
	}, [open, internal]);

	return (
		<div className={`relative w-full ${className}`} style={{ maxWidth: 180, ...style }}>
			<div
				className={`flex items-center border border-gray-300 rounded-lg px-2 py-0 cursor-pointer bg-gray-100 focus-within:ring-2 focus-within:ring-primary-light transition-all ${disabled ? 'bg-gray-100 text-gray-400' : 'bg-white text-text-main'} ${open ? 'ring-2 ring-primary-light' : ''}`}
				style={{ minHeight: 40, fontSize: 16 }}
				onClick={() => !disabled && setOpen(true)}
				tabIndex={0}
				onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && !disabled) setOpen(true); }}
				aria-label="Select time"
			>
				<Clock className="mr-2 text-primary-light" size={18} />
				<input
					ref={inputRef}
					className="flex-1 outline-none border-none bg-transparent text-sm font-medium focus:outline-none focus:ring-0"
					value={
						`${pad(internal.hour)}:${pad(internal.minute)}${format === 'HH:mm:ss' ? ':' + pad(internal.second) : ''}`
					}
					onChange={handleInputChange}
					disabled={disabled}
					onFocus={() => setOpen(true)}
					style={{ background: 'transparent', border: 'none', width: '100%' }}
				/>
			</div>
			{open && !disabled && (
				<div ref={timePickerRef} className="absolute left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl p-4 flex flex-col gap-4 z-50 text-gray-500 text-sm" style={{ width: 280, minWidth: 180, maxWidth: 300 }}>
					<div className="flex flex-nowrap justify-between gap-2 w-full min-w-0">
						{/* Hour (24-hour format) */}
						<div ref={hourRef} className="flex-1 flex flex-col items-center max-h-40 overflow-y-auto min-w-[60px]">
							{hours.map(h => (
								<div
									key={h}
									className={`py-1 px-2 rounded-[5px] w-10 text-center cursor-pointer ${internal.hour === h ? 'bg-primary-light text-white font-bold selected' : 'hover:bg-primary-light/10'}`}
									onClick={() => handleSelect('hour', h)}
									tabIndex={0}
									onKeyDown={e => { if (e.key === 'Enter') handleSelect('hour', h); }}
									aria-label={`Select hour ${pad(h)}`}
								>
									{pad(h)}
								</div>
							))}
						</div>
						{/* Minute */}
						<div ref={minuteRef} className="flex-1 flex flex-col items-center max-h-40 overflow-y-auto min-w-[60px]">
							{minutes.map(m => (
								<div
									key={m}
									className={`py-1 px-2 rounded-[5px] w-10 text-center cursor-pointer ${internal.minute === m ? 'bg-primary-light text-white font-bold selected' : 'hover:bg-primary-light/10'}`}
									onClick={() => handleSelect('minute', m)}
									tabIndex={0}
									onKeyDown={e => { if (e.key === 'Enter') handleSelect('minute', m); }}
									aria-label={`Select minute ${pad(m)}`}
								>
									{pad(m)}
								</div>
							))}
						</div>
						{/* Second (optional) */}
						{format === 'HH:mm:ss' && (
							<div ref={secondRef} className="flex-1 flex flex-col items-center max-h-40 overflow-y-auto min-w-[60px]">
								{seconds.map(s => (
									<div
										key={s}
										className={`py-1 px-2 rounded-[5px] w-10 text-center cursor-pointer ${internal.second === s ? 'bg-primary-light text-white font-bold selected' : 'hover:bg-primary-light/10'}`}
										onClick={() => handleSelect('second', s)}
										tabIndex={0}
										onKeyDown={e => { if (e.key === 'Enter') handleSelect('second', s); }}
										aria-label={`Select second ${pad(s)}`}
									>
										{pad(s)}
									</div>
								))}
							</div>
						)}
					</div>
					<div className="flex justify-between mt-4">
						<button
							className="text-primary-light font-semibold px-4 py-2 rounded hover:bg-primary-light/10"
							onClick={handleCancel}
							type="button"
						>
							CANCEL
						</button>
						<button
							className="text-primary-light font-semibold px-4 py-2 rounded hover:bg-primary-light/10"
							onClick={handleOk}
							type="button"
						>
							OK
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default TimePicker;
