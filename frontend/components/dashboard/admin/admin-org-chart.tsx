"use client";

import { useState, useRef, useEffect } from "react";
import { User, Shield, Headset, Code2 } from "lucide-react";
import { useGetAdmins } from "@/hooks/admin-hooks";
import { User as UserType } from "@/types/user";
import { AdminRole } from "@/types/form";
import Image from "next/image";
import { LoadingIndicator } from "@/components";

interface Admin {
	id: string;
	name: string;
	role: AdminRole;
	email: string;
	phone: string;
	avatar: string | null;
	position: string;
	children?: Admin[];
}

// Patch: Extend UserAdmin type locally to include supervisor_id
interface UserAdminWithSupervisor extends Omit<UserType['UserAdmin'], 'supervisor_id'> {
	supervisor_id?: string | null;
}

const roleIcons: Record<AdminRole, JSX.Element> = {
	SUPER_ADMIN: <Shield className="w-6 h-6" />,
	OPS_ADMIN: <User className="w-6 h-6" />,
	SUPPORT_AGENT: <Headset className="w-6 h-6" />,
	DEVELOPER: <Code2 className="w-6 h-6" />,
};

/**
 * Convert API user data to Admin interface
 */
const convertUserToAdmin = (user: UserType): Admin => {
	return {
		id: user.user_id,
		name: `${user.fname} ${user.lname}`,
		role: user.UserAdmin?.role as AdminRole || "SUPER_ADMIN",
		email: user.email,
		phone: user.phone,
		avatar: user.Avatar?.image_url || null,
		position: user.UserAdmin?.position || "Admin",
	};
};

/**
 * Build admin hierarchy from flat list
 */
const buildAdminHierarchy = (admins: UserType[]): Admin | null => {
	if (!admins || admins.length === 0) return null;

	// Find the SUPER_ADMIN
	const superAdmin = admins.find(admin => admin.UserAdmin?.role === "SUPER_ADMIN");
	if (!superAdmin) return null;

	const superAdminData = convertUserToAdmin(superAdmin);
	
	// Get all other admins as children
	const children = admins
		.filter(admin => admin.UserAdmin?.role !== "SUPER_ADMIN")
		.map(convertUserToAdmin);

	return {
		...superAdminData,
		children: children.length > 0 ? children : undefined,
	};
};

/**
 * Admin Card Component (Redesigned)
 */
const AdminCard = ({ admin, onClick }: { admin: Admin; onClick: () => void }) => {
	return (
		<button
			type="button"
			className={`group relative flex flex-col items-center rounded-xl shadow-lg p-3 bg-gradient-to-br from-primary-light/90 to-primary-light/60 border border-primary-light/30 transition-all duration-200 hover:scale-[1.04] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-light w-40 min-h-[180px]`}
			onClick={onClick}
			tabIndex={0}
		>
			{/* Avatar */}
			{admin.avatar ? (
				<div className="w-12 h-12 rounded-full border-2 border-white shadow mb-2 overflow-hidden bg-white">
					<Image
						src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${admin.avatar}`}
						alt={admin.name}
						width={48}
						height={48}
						className="w-full h-full object-cover"
					/>
				</div>
			) : (
				<div className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-white shadow mb-2 overflow-hidden bg-white">
					<User className="w-8 h-8 text-primary-light" />
				</div>
			)}

			{/* Name and position */}
			<div className="flex flex-col items-center mb-1">
				<span className="font-bold text-base text-white drop-shadow-sm mb-0.5 flex items-center gap-1">
					{roleIcons[admin.role]}
					{admin.name}
				</span>
				<span className="text-xs text-primary-light/90 bg-white/80 px-1.5 py-0.5 rounded-full font-medium mb-0.5 shadow-sm">{admin.position}</span>
			</div>

			{/* Contact info */}
			<div className="flex flex-col items-center gap-0.5 mt-1 w-full">
				<span className="text-[8px] text-white/90 bg-primary-light/40 px-1.5 py-0.5 rounded shadow-sm w-fit">{admin.email}</span>
				<span className="text-[8px] text-white/90 bg-primary-light/40 px-1.5 py-0.5 rounded shadow-sm w-fit">{admin.phone}</span>
			</div>
		</button>
	);
};

/**
 * Admin Modal Component
 */
const AdminModal = ({ admin, open, onClose }: { admin: Admin | null; open: boolean; onClose: () => void }) => {
	if (!open || !admin) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
			<div className="bg-white rounded-2xl shadow-2xl p-10 min-w-[340px] relative border-2 border-primary-light animate-fade-in">
				<button
					className="absolute top-3 right-3 text-gray-400 hover:text-primary-light text-2xl font-bold"
					onClick={onClose}
				>
					×
				</button>
				<div className="flex flex-col items-center">
					{ admin.avatar ? (	
						<div className="w-24 h-24 rounded-full border-4 border-primary-light mb-3 overflow-hidden bg-white">
							<Image
								src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${admin.avatar}`}
								alt={admin.name}
								width={96}
								height={96}
								className="w-full h-full object-cover"
							/>
						</div>
					) : (
						<div className="w-24 h-24 flex items-center justify-center rounded-full border-4 border-primary-light mb-3 overflow-hidden bg-white">
							<User className="w-16 h-16 text-primary-light" />
						</div>
					)}
					<div className="flex items-center gap-2 mb-1">
						{roleIcons[admin.role]}
						<span className="font-bold text-xl text-primary-light drop-shadow">{admin.name}</span>
					</div>
					<span className="text-xs font-semibold uppercase tracking-wide mb-1 text-primary-light/80">{admin.role.replace("_", " ")}</span>
					<span className="text-sm mb-1 text-gray-700">{admin.position}</span>
					<span className="text-sm mb-1 text-gray-700">{admin.email}</span>
					<span className="text-sm mb-2 text-gray-700">{admin.phone}</span>
					<div className="text-xs text-gray-500 mt-2">More details can go here...</div>
				</div>
			</div>
		</div>
	);
};

// --- Helper: Build hierarchy tree from flat list using supervisor_id ---
interface AdminNode extends Admin {
	reports: AdminNode[];
}

function buildAdminTree(admins: UserType[]): AdminNode | undefined {
	// Map user_id to admin node
	const nodeMap: Record<string, AdminNode> = {};
	admins.forEach((user) => {
		const userAdmin = user.UserAdmin as UserAdminWithSupervisor | undefined;
		nodeMap[user.user_id] = {
			id: user.user_id,
			name: `${user.fname} ${user.lname}`,
			role: (userAdmin && (userAdmin as any).role) ? (userAdmin as any).role as AdminRole : "SUPER_ADMIN",
			email: user.email,
			phone: user.phone,
			avatar: user.Avatar?.image_url || null,
			position: (userAdmin && (userAdmin as any).position) ? (userAdmin as any).position : "Admin",
			reports: [],
		};
	});
	// Assign reports to supervisors
	let root: AdminNode | undefined = undefined;
	admins.forEach((user) => {
		const userAdmin = user.UserAdmin as UserAdminWithSupervisor | undefined;
		const supervisorId = userAdmin?.supervisor_id;
		if (supervisorId && nodeMap[supervisorId]) {
			nodeMap[supervisorId].reports.push(nodeMap[user.user_id]);
		} else if (!supervisorId) {
			root = nodeMap[user.user_id];
		}
	});
	return root;
}

// --- Helper: Render tree with connectors ---
function AdminTree({ node, onCardClick }: { node: AdminNode; onCardClick: (admin: Admin) => void }) {
	const hasChildren = node.reports.length > 0;
	const parentRef = useRef<HTMLDivElement>(null);
	const childRefs = useRef<(HTMLDivElement | null)[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);
	const [lines, setLines] = useState<{
		vertical: { x1: number; y1: number; x2: number; y2: number }[];
		horizontal: { x1: number; y1: number; x2: number; y2: number } | null;
	}>({ vertical: [], horizontal: null });

	// Helper to recalculate lines
	const recalcLines = () => {
		if (!hasChildren) return;
		const containerRect = containerRef.current?.getBoundingClientRect();
		const parentRect = parentRef.current?.getBoundingClientRect();
		const childRects = childRefs.current.map(ref => ref?.getBoundingClientRect());
		if (!containerRect || !parentRect || childRects.some(r => !r)) return;

		const parentCenterX = parentRect.left + parentRect.width / 2 - containerRect.left;
		const parentBottomY = parentRect.bottom - containerRect.top;
		const childCenters = childRects.map(childRect => ({
			x: childRect!.left + childRect!.width / 2 - containerRect.left,
			y: childRect!.top - containerRect.top,
		}));

		let horizontal: { x1: number; y1: number; x2: number; y2: number } | null = null;
		let horizontalY = null;
		if (childCenters.length > 1) {
			// Place the horizontal connector at the midpoint between parent bottom and child top
			const minChildY = Math.min(...childCenters.map(c => c.y));
			horizontalY = parentBottomY + (minChildY - parentBottomY) / 2;
			horizontal = {
				x1: childCenters[0].x,
				y1: horizontalY,
				x2: childCenters[childCenters.length - 1].x,
				y2: horizontalY,
			};
		}

		const vertical: { x1: number; y1: number; x2: number; y2: number }[] = [];
		if (childCenters.length > 1 && horizontal) {
			// Parent to horizontal
			vertical.push({
				x1: parentCenterX,
				y1: parentBottomY,
				x2: parentCenterX,
				y2: horizontal.y1,
			});
			// Horizontal to each child
			childCenters.forEach(center => {
				vertical.push({
					x1: center.x,
					y1: horizontal!.y1,
					x2: center.x,
					y2: center.y,
				});
			});
		} else if (childCenters.length === 1) {
			// Direct line from parent to only child
			vertical.push({
				x1: parentCenterX,
				y1: parentBottomY,
				x2: childCenters[0].x,
				y2: childCenters[0].y,
			});
		}

		// Deep compare with previous state to avoid infinite loop
		const isSameLine = (a: any, b: any) => a && b && a.x1 === b.x1 && a.y1 === b.y1 && a.x2 === b.x2 && a.y2 === b.y2;
		const verticalSame =
			vertical.length === lines.vertical.length &&
			vertical.every((v, i) => isSameLine(v, lines.vertical[i]));
		const horizontalSame = isSameLine(horizontal, lines.horizontal);
		if (!verticalSame || !horizontalSame) {
			setLines({ vertical, horizontal });
		}
	};

	// Use ResizeObserver to watch for DOM changes
	useEffect(() => {
		if (!hasChildren) return;
		const parent = parentRef.current;
		const children = childRefs.current.filter(Boolean) as HTMLDivElement[];
		const container = containerRef.current;
		if (!parent || !container || children.length !== node.reports.length) return;

		recalcLines(); // Initial calculation

		const resizeObserver = new (window as any).ResizeObserver(() => {
			recalcLines();
		});
		resizeObserver.observe(parent);
		children.forEach(child => resizeObserver.observe(child));
		resizeObserver.observe(container);

		window.addEventListener('resize', recalcLines);

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener('resize', recalcLines);
		};
		// eslint-disable-next-line
	}, [hasChildren, node.reports.length]);

	return (
		<div ref={containerRef} className="flex flex-col items-center relative w-full">
			<div ref={parentRef} className="z-10">
				<AdminCard admin={node} onClick={() => onCardClick(node)} />
			</div>
			{hasChildren && (
				<div className="relative w-full flex flex-col items-center" style={{ minHeight: 60 }}>
					{/* SVG lines beneath cards */}
					<svg
						className="absolute z-0 pointer-events-none"
						style={{ left: 0, top: -180, width: '100%', height: '100%', overflow: 'visible', position: 'absolute' }}
					>
						{/* Horizontal connector */}
						{lines.horizontal && (
							<line
								x1={lines.horizontal.x1}
								y1={lines.horizontal.y1}
								x2={lines.horizontal.x2}
								y2={lines.horizontal.y2}
								stroke="#FFA94D"
								strokeWidth={2}
							/>
						)}
						{/* Vertical connectors */}
						{lines.vertical.map((line, idx) => (
							<line
								key={idx}
								x1={line.x1}
								y1={line.y1}
								x2={line.x2}
								y2={line.y2}
								stroke="#FFA94D"
								strokeWidth={2}
							/>
						))}
					</svg>
					{/* Children row */}
					<div className="flex flex-row justify-center items-start w-full gap-4 mt-4">
						{node.reports.map((child, idx) => (
							<div
								key={child.id}
								ref={el => { childRefs.current[idx] = el; }}
								className="flex flex-col items-center z-10"
								style={{ minWidth: 140, minHeight: 190 }}
							>
								<AdminTree node={child} onCardClick={onCardClick} />
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

const MIN_ZOOM = 1.0;
const MAX_ZOOM = 2.0;
const ZOOM_STEP = 0.1;

const AdminOrgChart = () => {
	const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const { data: adminsData, isLoading: isAdminsLoading, error: adminsError } = useGetAdmins();

	// --- Zoom and Pan State ---
	const [zoom, setZoom] = useState(1.0);
	const [offset, setOffset] = useState({ x: 0, y: 0 });
	const [dragging, setDragging] = useState(false);
	const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);
	const chartWrapperRef = useRef<HTMLDivElement>(null);
	const chartContentRef = useRef<HTMLDivElement>(null);
	const lastTouchDistance = useRef<number | null>(null);
	const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);

	// --- Mouse Wheel Zoom (native event for passive: false) ---
	useEffect(() => {
		const element = chartWrapperRef.current;
		if (!element) return;
		const handleWheel = (e: WheelEvent) => {
			if (e.ctrlKey || e.metaKey) return; // Let browser handle pinch-to-zoom
			e.preventDefault();
			let newZoom = zoom - e.deltaY * 0.0015;
			newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
			if (newZoom !== zoom) setZoom(newZoom);
		};
		element.addEventListener('wheel', handleWheel, { passive: false });
		return () => {
			element.removeEventListener('wheel', handleWheel);
		};
	}, [zoom]);

	// --- Mouse Drag Pan ---
	const handleMouseDown = (e: React.MouseEvent) => {
		if (e.button !== 0) return;
		setDragging(true);
		setLastPos({ x: e.clientX, y: e.clientY });
	};
	const handleMouseMove = (e: React.MouseEvent) => {
		if (!dragging || !lastPos) return;
		setOffset(prev => ({
			x: prev.x + (e.clientX - lastPos.x),
			y: prev.y + (e.clientY - lastPos.y),
		}));
		setLastPos({ x: e.clientX, y: e.clientY });
	};
	const handleMouseUp = () => {
		setDragging(false);
		setLastPos(null);
	};

	// --- Touch Pan & Pinch Zoom ---
	const handleTouchStart = (e: React.TouchEvent) => {
		if (e.touches.length === 1) {
			setDragging(true);
			setLastPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
		} else if (e.touches.length === 2) {
			setDragging(false);
			lastTouchDistance.current = Math.hypot(
				e.touches[0].clientX - e.touches[1].clientX,
				e.touches[0].clientY - e.touches[1].clientY
			);
			lastTouchCenter.current = {
				x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
				y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
			};
		}
	};
	const handleTouchMove = (e: React.TouchEvent) => {
		if (e.touches.length === 1 && dragging && lastPos) {
			setOffset(prev => ({
				x: prev.x + (e.touches[0].clientX - lastPos.x),
				y: prev.y + (e.touches[0].clientY - lastPos.y),
			}));
			setLastPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
		} else if (e.touches.length === 2 && lastTouchDistance.current && lastTouchCenter.current) {
			const newDistance = Math.hypot(
				e.touches[0].clientX - e.touches[1].clientX,
				e.touches[0].clientY - e.touches[1].clientY
			);
			let newZoom = zoom * (newDistance / lastTouchDistance.current);
			newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
			setZoom(newZoom);
			lastTouchDistance.current = newDistance;
			const newCenter = {
				x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
				y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
			};
			setOffset(prev => ({
				x: prev.x + (newCenter.x - lastTouchCenter.current!.x),
				y: prev.y + (newCenter.y - lastTouchCenter.current!.y),
			}));
			lastTouchCenter.current = newCenter;
		}
	};
	const handleTouchEnd = (e: React.TouchEvent) => {
		setDragging(false);
		setLastPos(null);
		lastTouchDistance.current = null;
		lastTouchCenter.current = null;
	};

	// --- Prevent text/image selection while dragging ---
	useEffect(() => {
		if (dragging) {
			document.body.style.userSelect = "none";
			document.body.style.cursor = "grabbing";
		} else {
			document.body.style.userSelect = "";
			document.body.style.cursor = "";
		}
		return () => {
			document.body.style.userSelect = "";
			document.body.style.cursor = "";
		};
	}, [dragging]);

	// --- Center chart on load or data change ---
	useEffect(() => {
		if (!chartWrapperRef.current || !chartContentRef.current) return;
		const wrapper = chartWrapperRef.current;
		const content = chartContentRef.current;
		const wrapperRect = wrapper.getBoundingClientRect();
		const contentRect = content.getBoundingClientRect();
		setOffset({
			x: (wrapperRect.width - contentRect.width) / 2,
			y: (wrapperRect.height - contentRect.height) / 2,
		});
	}, [adminsData]);

	const handleCardClick = (admin: Admin) => {
		setSelectedAdmin(admin);
		setModalOpen(true);
	};

	const handleClose = () => {
		setModalOpen(false);
		setSelectedAdmin(null);
	};

	if (isAdminsLoading) {
		return (
			<div className="flex flex-col items-center py-10">
				<LoadingIndicator text="Loading admin data..." />
			</div>
		);
	}

	if (adminsError) {
		return (
			<div className="flex flex-col items-center py-10">
				<div className="text-lg font-semibold text-red-600 mb-4">Error loading admin data</div>
				<div className="text-sm text-gray-500">{adminsError.message}</div>
			</div>
		);
	}

	const root = buildAdminTree(adminsData?.result || []);

	if (!root) {
		return (
			<div className="flex flex-col items-center py-10">
				<div className="text-lg font-semibold text-gray-600 mb-4">No admin data available</div>
			</div>
		);
	}

	return (
		<div
			ref={chartWrapperRef}
			className="flex flex-col items-center py-10 font-regular-eng w-full h-[80vh] relative overflow-hidden select-none"
			style={{ touchAction: 'none', background: 'inherit' }}
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			onMouseLeave={handleMouseUp}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
		>
			{/* Zoom Controls */}
			<div
				className="absolute right-6 top-1/2 -translate-y-1/2 z-30 bg-white rounded-2xl shadow-lg flex flex-col items-center w-14 py-3 select-none"
				style={{ userSelect: 'none' }}
			>
				<button
					aria-label="Zoom in"
					className="w-10 h-10 flex items-center justify-center text-3xl text-gray-600 hover:text-primary-light focus:outline-none"
					onClick={() => setZoom(z => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)))}
					disabled={zoom >= MAX_ZOOM}
				>
					<span className="pointer-events-none select-none">+</span>
				</button>
				<div className="w-8 h-px bg-gray-200 my-2" />
				<button
					aria-label="Zoom out"
					className="w-10 h-10 flex items-center justify-center text-3xl text-gray-600 hover:text-primary-light focus:outline-none"
					onClick={() => setZoom(z => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)))}
					disabled={zoom <= MIN_ZOOM}
				>
					<span className="pointer-events-none select-none">-</span>
				</button>
			</div>
			<div
				ref={chartContentRef}
				style={{
					transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
					transformOrigin: '0 0',
					transition: dragging ? 'none' : 'transform 0.2s cubic-bezier(.4,2,.6,1)',
					willChange: 'transform',
					minWidth: 800,
					minHeight: 600,
				}}
			>
				<AdminTree node={root} onCardClick={handleCardClick} />
			</div>
			{/* Modal */}
			<AdminModal admin={selectedAdmin} open={modalOpen} onClose={handleClose} />
		</div>
	);
};

export default AdminOrgChart; 