"use client";

import { useState, useEffect } from "react";
import Table, { type Column } from "@/components/common/table";
import type { UserMerchant } from "@/types/user";
import { Edit2, Trash2, User, MapPin, X } from "lucide-react";
import { useDateTime } from "@/constant/datetime-provider";
import { useGetEmployees, useAssignBranches, useUpdateEmployee, useDeleteEmployee } from "@/hooks/user-hooks";
import { useAuth } from "@/hooks/auth-hooks";
import { useBranches } from "@/hooks/merchant-hooks";
import { LoadingIndicator } from "@/components";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { EditEmployeeModal } from "./edit-employee-modal";
import { EditEmployeeFormFields } from "@/types/form";
import { EmployeesResponse } from "@/types/response";
import { ConfirmationModal } from "@/components/common/confirmation-modal";

interface Branch {
	branch_id: string;
	branch_name: string;
}

interface AssignBranchModalProps {
	isOpen: boolean;
	onClose: () => void;
	employee: UserMerchant | null;
	availableBranches: Branch[];
	onAssign: (staffId: string, branchIds: string[]) => Promise<void>;
}

const AssignBranchModal: React.FC<AssignBranchModalProps> = ({
	isOpen,
	onClose,
	employee,
	availableBranches,
	onAssign
}) => {
	const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	// Initialize selected branches with current assignments
	useEffect(() => {
		if (employee) {
			const currentBranchIds = employee.UserMerchantOnBranch.map(umb => umb.Branch.branch_id);
			setSelectedBranches(currentBranchIds);
		}
	}, [employee]);

	const handleSave = async () => {
		if (!employee) return;
		
		setIsLoading(true);
		try {
			await onAssign(employee.staff_id, selectedBranches);
			onClose();
		} catch (error) {
			console.error('Failed to assign branches:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleBranchToggle = (branchId: string) => {
		setSelectedBranches(prev => 
			prev.includes(branchId)
				? prev.filter(id => id !== branchId)
				: [...prev, branchId]
		);
	};

	if (!isOpen || !employee) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-bold text-primary-light">
						Assign Branches to {employee.User?.fname} {employee.User?.lname}
					</h2>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<div className="mb-4">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Select Branches
					</label>
					<div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-2">
						{availableBranches.map((branch) => (
							<label key={branch.branch_id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
								<input
									type="checkbox"
									checked={selectedBranches.includes(branch.branch_id)}
									onChange={() => handleBranchToggle(branch.branch_id)}
									className="mr-3 h-4 w-4 text-primary-light focus:ring-primary-light border-gray-300 rounded"
								/>
								<span className="text-sm text-gray-700">{branch.branch_name}</span>
							</label>
						))}
					</div>
				</div>

				<div className="flex justify-end gap-3">
					<button
						onClick={onClose}
						className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
						disabled={isLoading}
					>
						Cancel
					</button>
					<button
						onClick={handleSave}
						disabled={isLoading}
						className="px-4 py-2 bg-primary-light text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
					>
						{isLoading ? 'Saving...' : 'Save'}
					</button>
				</div>
			</div>
		</div>
	);
};

const ManageUsers = () => {
	const { data: employeesData, isLoading, error } = useGetEmployees();
	const { data: currentUser } = useAuth();
	const merchantId = currentUser?.user?.UserMerchant?.merchant_id;
	const currentUserRole = currentUser?.user?.UserMerchant?.role;
	const { data: branchesData } = useBranches(merchantId as string, currentUser?.user?.UserMerchant?.user_id, { 
		enabled: !!merchantId 
	});
	const { formatDate } = useDateTime();
	const employees = employeesData?.result;
	const availableBranches = branchesData?.branches || [];
	const queryClient = useQueryClient();
	
	const [assignModalOpen, setAssignModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedEmployee, setSelectedEmployee] = useState<UserMerchant | null>(null);

	// Assign branches mutation
	const assignBranchesMutation = useAssignBranches({
		onSuccess: () => {
			// Invalidate and refetch employees data to show updated assignments
			queryClient.invalidateQueries({ queryKey: ['user', 'employees'] });
		},
		onError: (error) => {
			console.error('Failed to assign branches:', error);
			// You could add a toast notification here
		}
	});

	// Delete employee mutation
	const deleteEmployeeMutation = useDeleteEmployee({
		onMutate: async (deletedUserId: string) => {
			// Cancel any outgoing refetches (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({ queryKey: ['user', 'employees'] });

			// Snapshot the previous value
			const previousEmployees = queryClient.getQueryData<EmployeesResponse>(['user', 'employees']);

			// Optimistically update to the new value
			if (previousEmployees) {
				queryClient.setQueryData<EmployeesResponse>(['user', 'employees'], {
					...previousEmployees,
					result: previousEmployees.result.filter(
						(employee) => employee.user_id !== deletedUserId
					),
				});
			}

			// Return a context object with the snapshotted value
			return { previousEmployees };
		},
		// If the mutation fails, use the context returned from onMutate to roll back
		onError: (err, deletedUserId, context: unknown) => {
			const { previousEmployees } = context as { previousEmployees: EmployeesResponse | undefined };
			if (previousEmployees) {
				queryClient.setQueryData<EmployeesResponse>(['user', 'employees'], previousEmployees);
			}
			console.error('Failed to delete employee:', err);
		},
	});

	// Update employee mutation
	const updateEmployeeMutation = useUpdateEmployee({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user', 'employees'] });
			setEditModalOpen(false);
			setSelectedEmployee(null);
		},
		onError: (error) => {
			console.error('Failed to update employee:', error);
			// You could add a toast notification here
		}
	});

	const columns: Column<UserMerchant>[] = [
		{
			header: "Name",
			accessor: (row) => {
				const user = row.User;
				if (!user) return <div className="flex items-center gap-3"><div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600">N/A</div><span>N/A</span></div>;
				
				const name = `${user.fname.charAt(0).toUpperCase()}${user.fname.slice(1)} ${user.lname.toUpperCase()}`;
				
				if (user.Avatar?.image_url) {
					// Construct full URL for avatar image
					const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5500';
					const imageUrl = user.Avatar.image_url.startsWith('http') 
						? user.Avatar.image_url 
						: `${backendUrl}${user.Avatar.image_url}`;
					
					return (
						<div className="flex items-center gap-3">
							<Image
								src={imageUrl} 
								alt={name}
								width={38}
								height={38}
								className="rounded-full object-cover"
								onError={(e) => {
									const target = e.target as HTMLImageElement;
									target.style.display = 'none';
									const parent = target.parentElement;
									if (parent) {
										const initials = `${user.fname?.charAt(0) || ''}${user.lname?.charAt(0) || ''}`.toUpperCase();
										const fallback = document.createElement('div');
										fallback.className = 'w-[38px] h-[38px] bg-primary-light rounded-full flex items-center justify-center text-white font-semibold';
										fallback.textContent = initials || '?';
										parent.appendChild(fallback);
									}
								}}
							/>
							<span className="font-medium">{name}</span>
						</div>
					);
				} else {
					const initials = `${user.fname?.charAt(0) || ''}${user.lname?.charAt(0) || ''}`.toUpperCase();
					return (
						<div className="flex items-center gap-3">
							<div className="w-[38px] h-[38px] bg-primary-light rounded-full flex items-center justify-center text-white font-semibold">
								{initials || <User className="w-4 h-4" />}
							</div>
							<span className="font-medium">{name}</span>
						</div>
					);
				}
			},
			sortable: true,
		},
		{
			header: "Username",
			accessor: (row) => row.User?.username || 'N/A',
			sortable: true,
		},
		{
			header: "Email",
			accessor: (row) => row.User?.email || 'N/A',
			sortable: true,
		},
		{
			header: "Phone",
			accessor: (row) => row.User?.phone || 'N/A',
			sortable: true,
		},
		{
			header: "Position",
			accessor: "position",
			sortable: true,
		},
		{
			header: "Role",
			accessor: "role",
			sortable: true,
		},
		{
			header: "Assigned Branches",
			accessor: (row) => {
				const branchNames = row.UserMerchantOnBranch.map(umb => umb.Branch.branch_name);
				return branchNames.length > 0 ? branchNames.join(', ') : 'None assigned';
			},
			sortable: true,
		},
		{
			header: "Joined Date",
			accessor: (row) => formatDate(row.join_at),
			sortable: true,
		},
		{
			header: "Actions",
			accessor: (row) => renderActions(row),
			sortable: false,
		}
	];

	const handleEdit = (employee: UserMerchant) => {
		// Prevent users from editing themselves (except OWNER)
		if (currentUserRole !== 'OWNER' && employee.user_id === currentUser?.user?.UserMerchant?.user_id) {
			alert("You cannot edit your own account. Please contact an administrator.");
			return;
		}
		
		// Strict role-based access control: MANAGER cannot edit OWNER
		if (currentUserRole === 'MANAGER' && employee.role === 'OWNER') {
			return; // Do nothing - early return
		}
		
		if (employee.role === 'Frontline') {
			// TODO: Replace with a more user-friendly notification
			alert("Cannot edit an employee with the Frontline role.");
			return;
		}
		setSelectedEmployee(employee);
		setEditModalOpen(true);
	};

	const handleDelete = (employee: UserMerchant) => {
		// Prevent users from deleting themselves
		if (employee.user_id === currentUser?.user?.UserMerchant?.user_id) {
			alert("You cannot delete your own account.");
			return;
		}
		
		// Strict role-based access control: MANAGER cannot delete OWNER
		if (currentUserRole === 'MANAGER' && employee.role === 'OWNER') {
			return; // Do nothing - early return
		}
		
		if (employee.role === 'OWNER') {
			// TODO: Replace with a more user-friendly notification
			alert("Cannot delete an employee with the OWNER role.");
			return;
		}
		if (employee.role === 'Frontline') {
			// TODO: Replace with a more user-friendly notification
			alert("Cannot delete an employee with the Frontline role.");
			return;
		}
		setSelectedEmployee(employee);
		setDeleteModalOpen(true);
	};

	const handleConfirmDelete = () => {
		if (selectedEmployee) {
			deleteEmployeeMutation.mutate(selectedEmployee.user_id);
			setDeleteModalOpen(false);
			setSelectedEmployee(null);
		}
	};

	const handleAssignBranch = (employee: UserMerchant) => {
		// Prevent users from assigning branches to themselves (except OWNER)
		if (currentUserRole !== 'OWNER' && employee.user_id === currentUser?.user?.UserMerchant?.user_id) {
			alert("You cannot modify your own branch assignments. Please contact an administrator.");
			return;
		}
		
		// Strict role-based access control: MANAGER cannot assign branches to OWNER
		if (currentUserRole === 'MANAGER' && employee.role === 'OWNER') {
			return; // Do nothing - early return
		}
		
		setSelectedEmployee(employee);
		setAssignModalOpen(true);
	};

	const handleAssignBranches = async (staff_id: string, branch_ids: string[]) => {
		await assignBranchesMutation.mutateAsync({ staff_id, branch_ids });
	};

	const handleSaveEmployee = (data: EditEmployeeFormFields) => {
		if (!selectedEmployee) return;
		updateEmployeeMutation.mutate({ staffId: selectedEmployee.staff_id, data });
	};

	// Function to determine row styling based on access control
	const getRowClassName = (employee: UserMerchant) => {
		const isManagerBlocked = currentUserRole === 'MANAGER' && employee.role === 'OWNER';
		const isSelfBlocked = currentUserRole !== 'OWNER' && employee.user_id === currentUser?.user?.UserMerchant?.user_id;
		return (isManagerBlocked || isSelfBlocked) ? 'opacity-50 bg-gray-50 hover:bg-gray-100' : '';
	};

	const renderActions = (employee: UserMerchant) => {
		const isSelf = employee.user_id === currentUser?.user?.user_id;
		const isManagerBlocked = currentUserRole === 'MANAGER' && employee.role === 'OWNER';
		const isSelfBlocked = isSelf && currentUserRole !== 'OWNER';

		return (
			<div className="flex items-center gap-2">
				{/* Edit button */}
				{isSelfBlocked ? (
					<button
						className="p-1 rounded-full opacity-50 cursor-not-allowed"
						title="You cannot edit your own account"
						disabled
					>
						<Edit2 className="w-4 h-4 text-gray-400" />
					</button>
				) : !isManagerBlocked && (
					<button
						onClick={() => handleEdit(employee)}
						className="p-1 hover:bg-primary-light/20 rounded-full transition-colors"
						title="Edit"
					>
						<Edit2 className="w-4 h-4 text-primary-light" />
					</button>
				)}

				{/* Assign Branch button */}
				{isSelfBlocked ? (
					<button
						className="p-1 rounded-full opacity-50 cursor-not-allowed"
						title="You cannot assign your own branches"
						disabled
					>
						<MapPin className="w-4 h-4 text-gray-400" />
					</button>
				) : !isManagerBlocked && (
					<button
						onClick={() => handleAssignBranch(employee)}
						className="p-1 hover:bg-blue-500/20 rounded-full transition-colors"
						title="Assign Branch"
					>
						<MapPin className="w-4 h-4 text-blue-500" />
					</button>
				)}

				{/* Delete button */}
				{isSelfBlocked ? (
					<button
						className="p-1 rounded-full opacity-50 cursor-not-allowed"
						title="You cannot delete your own account"
						disabled
					>
						<Trash2 className="w-4 h-4 text-gray-400" />
					</button>
				) : !isManagerBlocked && (
					<button
						onClick={() => handleDelete(employee)}
						className="p-1 hover:bg-red-500/20 rounded-full transition-colors"
						title="Delete"
					>
						<Trash2 className="w-4 h-4 text-red-500" />
					</button>
				)}
			</div>
		);
	};

	if (isLoading) {
		return <LoadingIndicator />;
	}

	if (error) {
		return <div className="flex justify-center items-center h-screen text-red-500 font-bold text-2xl font-regular-eng">Error: {error.message}</div>;
	}

	return (
		<div className="min-h-screen font-regular-eng p-8">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl text-primary-light font-bold">Manage Employees</h1>
				<button
					className="bg-primary-light text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors"
					onClick={() => {/* TODO: Implement add employee */}}
				>
					Add Employee
				</button>
			</div>

			<Table
				columns={columns}
				data={employees || []}
				getRowClassName={getRowClassName}
			/>

			<AssignBranchModal
				isOpen={assignModalOpen}
				onClose={() => {
					setAssignModalOpen(false);
					setSelectedEmployee(null);
				}}
				employee={selectedEmployee}
				availableBranches={availableBranches}
				onAssign={handleAssignBranches}
			/>

			<EditEmployeeModal
				isOpen={editModalOpen}
				onClose={() => {
					setEditModalOpen(false);
					setSelectedEmployee(null);
				}}
				employee={selectedEmployee}
				onSave={handleSaveEmployee}
				isLoading={updateEmployeeMutation.isPending}
			/>

			<ConfirmationModal
				isOpen={deleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				onConfirm={handleConfirmDelete}
				title="Delete Employee"
				message={`Are you sure you want to delete ${selectedEmployee?.User?.fname || ''} ${selectedEmployee?.User?.lname || ''}? This action cannot be undone.`}
				isLoading={deleteEmployeeMutation.isPending}
				confirmText="Delete"
			/>
		</div>
	);
};

export default ManageUsers;