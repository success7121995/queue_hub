"use client";

import { useState, useEffect } from "react";
import Table, { type Column } from "@/components/common/table";
import Tag from "@/components/common/tag";
import NumberCard from "@/components/common/number-card";
import { Users, Plus, Edit, Trash2, Power } from "lucide-react";
import { useDateTime } from "@/constant/datetime-provider";
import { useForm } from "react-hook-form";
import { connectSocket, disconnectSocket, onQueueStatusChange, onQueueCreated, onQueueUpdated, onQueueDeleted, openOrCloseQueue } from "@/lib/socket";
import {
	useQueues,
	useCreateQueue,
	useUpdateQueue,
	useDeleteQueue,
	useSwitchBranch,
	queueKeys,
} from "@/hooks/merchant-hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/auth-hooks";
import LoadingIndicator from "@/components/common/loading-indicator";
import { Queue, QueueWithTags, Tag as QueueTag } from "@/types/queue";

// Define types based on database schema
type QueueStatus = 'OPEN' | 'CLOSED';

// Payload type for creating/updating queues
interface QueuePayload {
	queue_name: string;
	tags?: string;
}

const stats = [
	{ label: "Total Customer Served Today", value: 45 },
	{ label: "Total Queues", value: 4 },
		{ label: "Current Queue Volume", value: 7 },
	];

	const ManageQueueEntries = () => {
	const { data: currentUser } = useAuth();
		const queryClient = useQueryClient();
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [selectedQueue, setSelectedQueue] = useState<QueueWithTags | null>(null);
	const [hasAttemptedAutoSelect, setHasAttemptedAutoSelect] = useState(false);
	const { formatDate } = useDateTime();
	const createMutation = useCreateQueue();
	const updateMutation = useUpdateQueue();
	const deleteMutation = useDeleteQueue();
	const switchBranchMutation = useSwitchBranch();
	const { data: queuesData, isLoading: isLoadingQueue, refetch } = useQueues(currentUser?.user?.UserMerchant?.selected_branch_id);

	const userRole = currentUser?.user?.UserMerchant?.role;

	// Check if any mutations are pending
	const isAnyMutationPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || switchBranchMutation.isPending;

	// Connect to socket when component mounts
	useEffect(() => {
		connectSocket();

		const unregisterStatus = onQueueStatusChange(({ queueId, status }) => {
			refetch();
		});

		const unregisterCreated = onQueueCreated(({ message }) => {
			console.log('Queue created:', message);
			refetch();
		});

		const unregisterUpdated = onQueueUpdated(({ queueId, message }) => {
			console.log('Queue updated:', queueId, message);
			refetch();
		});

		const unregisterDeleted = onQueueDeleted(({ queueId, message }) => {
			console.log('Queue deleted:', queueId, message);
			refetch();
		});

		return () => {
			unregisterStatus();
			unregisterCreated();
			unregisterUpdated();
			unregisterDeleted();
			disconnectSocket();
		};
	}, [refetch]);

	// Form handling	
	const createForm = useForm<QueuePayload>({
		defaultValues: {
			queue_name: '',
			tags: '',
		},
	});

	const editForm = useForm<QueuePayload>({
		defaultValues: {
			queue_name: '',
			tags: '',
		},
	});

	/**
	 * Create a new queue
	 * @param data - The form data
	 */
	const onCreateSubmit = (data: QueuePayload) => {
		// Check if user has a selected branch
		const selectedBranchId = currentUser?.user?.UserMerchant?.selected_branch_id;
		
		if (!selectedBranchId) {
			// If no branch is selected, try to select the first available branch
			const availableBranches = currentUser?.user?.UserMerchant?.UserMerchantOnBranch || [];
			
			if (availableBranches.length > 0) {
				const firstBranchId = availableBranches[0].branch_id;
				
				// Switch to the first available branch first, then create the queue
				switchBranchMutation.mutate(firstBranchId, {
					onSuccess: (switchData) => {
						// Update the auth data with the new user data
						queryClient.setQueryData(['auth'], {
							success: true,
							user: switchData.user
						});
						
						// Now create the queue
						const payload = {
							queue_name: data.queue_name,
							tags: data.tags || '',
						};
						
						createMutation.mutate(payload as any, {
							onSuccess: async () => {
								setIsCreateModalOpen(false);
								createForm.reset();
								refetch();
							},
							onError: (error) => {
								console.error('Create queue error:', error);
							},
						});
					},
					onError: (error) => {
						console.error('Failed to switch branch:', error);
					}
				});
				return;
			} else {
				console.error('No branches available for this user');
				return;
			}
		}
		
		// If branch is already selected, create the queue directly
		const payload = {
			queue_name: data.queue_name,
			tags: data.tags || '',
		};
		
		createMutation.mutate(payload as any, {
			onSuccess: async () => {
				setIsCreateModalOpen(false);
				createForm.reset();
				refetch();
			},
			onError: (error) => {
				console.error('Create queue error:', error);
			},
		});
	};

	/**
	 * Update a queue
	 * @param data - The form data
	 */
	const onEditSubmit = (data: QueuePayload) => {
		if (!selectedQueue) return;

		const payload = {
			queue_name: data.queue_name,
			tags: data.tags,
		};

		updateMutation.mutate(
			{ queue_id: selectedQueue.queue_id, data: payload as any },
			{
			  onSuccess: async () => {
				setSelectedQueue(null);
				editForm.reset();
				refetch();
			  },
			  onError: (error) => {
				console.error('Update queue error:', error);
			  },
			}
		);
	};

	/**
	 * Open or close a queue
	 * @param queue_id - The queue ID
	 * @param status - The new status 
	 */
	const handleOpenOrClose = (queue_id: string, status: QueueStatus) => {
		// Optimistically update the UI
			queryClient.setQueryData(queueKeys.list(currentUser?.user?.branch_id as string), (oldData: any) => {
			if (!oldData) return oldData;
			return oldData.map((queue: QueueWithTags) => 
				queue.queue_id === queue_id 
					? { ...queue, queue_status: status }
					: queue
			);
		});

		// Send the status change to the server
		openOrCloseQueue(queue_id, status);
	};

	/**
	 * Delete a queue
	 * @param queue_id - The queue ID
	 */
	const handleDelete = (queue_id: string) => {
		deleteMutation.mutate(queue_id, {
			onSuccess: async () => {
				refetch();
			},
			onError: (error) => {
				console.error('Delete queue error:', error);
			},
		});
	};

	const handleDeleteQueue = (queue: QueueWithTags) => {
		if (window.confirm('Are you sure you want to delete this queue?')) {
			handleDelete(queue.queue_id);
		}
	};

	// Update edit form when queue is selected
	useEffect(() => {
		if (selectedQueue) {
			editForm.reset({
				queue_name: selectedQueue.queue_name,
				tags: selectedQueue.tags?.map((tag: QueueTag) => tag.tag_name).join(', ') || '',
			});
		}
	}, [selectedQueue, editForm]);

	// Check if user has a selected branch
	const selectedBranchId = currentUser?.user?.UserMerchant?.selected_branch_id;
	const availableBranches = currentUser?.user?.UserMerchant?.UserMerchantOnBranch || [];

	// Show loading indicator for initial data fetch or any pending mutations
	// Only show loading if we have a selected branch and are actually loading queue data
	if (selectedBranchId && (isLoadingQueue || isAnyMutationPending)) {
		return <LoadingIndicator fullScreen={true} text="Loading queues..." />;
	}
	
	if (!selectedBranchId) {
		if (availableBranches.length === 0) {
			return (
				<div className="font-regular-eng p-8 min-h-screen">
					<div className="flex justify-center items-center h-64">
						<div className="text-center">
							<h2 className="text-2xl font-bold text-gray-700 mb-4">No Branches Available</h2>
							<p className="text-gray-600 mb-4">You don't have access to any branches. Please contact your administrator.</p>
						</div>
					</div>
				</div>
			);
		} else if (!hasAttemptedAutoSelect) {
			// Auto-select the first available branch only once
			setHasAttemptedAutoSelect(true);
			const firstBranchId = availableBranches[0].branch_id;
			switchBranchMutation.mutate(firstBranchId, {
				onSuccess: (switchData) => {
					// Update the auth data with the new user data
					queryClient.setQueryData(['auth'], {
						success: true,
						user: switchData.user
					});
					// Invalidate queries to refresh data
					queryClient.invalidateQueries();
				},
				onError: (error) => {
					console.error('Failed to switch branch:', error);
					setHasAttemptedAutoSelect(false); // Reset so user can try again
				}
			});
			
			return (
				<div className="font-regular-eng p-8 min-h-screen">
					<div className="flex justify-center items-center h-64">
						<div className="text-center">
							<LoadingIndicator />
							<p className="text-gray-600 mt-4">Setting up your branch access...</p>
						</div>
					</div>
				</div>
			);
		} else {
			// If we've already attempted auto-selection but still no branch, show an error
			return (
				<div className="font-regular-eng p-8 min-h-screen">
					<div className="flex justify-center items-center h-64">
						<div className="text-center">
							<h2 className="text-2xl font-bold text-gray-700 mb-4">Branch Selection Failed</h2>
							<p className="text-gray-600 mb-4">Unable to automatically select a branch. Please refresh the page or contact support.</p>
							<button
								onClick={() => window.location.reload()}
								className="px-4 py-2 bg-primary-light text-white rounded-lg hover:bg-primary-light/90 transition-colors"
							>
								Refresh Page
							</button>
						</div>
					</div>
				</div>
			);
		}
	}

	/**
	 * Columns for the table
	 */
	const columns: Column<QueueWithTags>[] = [
		{ 
			header: "Name", 
			accessor: "queue_name", 
			priority: 3, 
			sortable: true 
		},
		{ 
			header: "Status", 
			accessor: (row) => (
				<div className="flex items-center gap-2">
					<div className={`w-2 h-2 rounded-full ${
						row.queue_status === 'OPEN' ? 'bg-green-500' : 
						row.queue_status === 'CLOSED' ? 'bg-red-500' : 'bg-gray-500'
					}`} />
					<span>{row.queue_status}</span>
				</div>
			), 
			priority: 2, 
			sortable: true 
		},
		{ 
			header: "Created At", 
			accessor: (row) => formatDate(new Date(row.created_at)) || 'N/A', 
			priority: 2, 
			sortable: true 
		},
		{ 
			header: "Updated At", 
			accessor: (row) => formatDate(new Date(row.updated_at)) || 'N/A', 
			priority: 2, 
			sortable: true 
		},
		{
			header: "Tags",
			accessor: (row) => (
				<div className="flex flex-wrap gap-2">
					{row.tags?.map((tag) => (
						<Tag key={tag.tag_id} tagName={tag.tag_name} />
					))}
				</div>
			),
			priority: 1,
			sortable: false,
		},
	];

	/**
	 * Render actions for each queue
	 */
	const renderActions = (row: QueueWithTags) => {
		const isFrontline = userRole === 'FRONTLINE';
		return (
			<div className="flex gap-2">
				<button 
					onClick={() => handleOpenOrClose(row.queue_id, row.queue_status === 'OPEN' ? 'CLOSED' : 'OPEN')}
					className={`flex items-center gap-1 px-3 py-1 rounded border ${
						row.queue_status === 'OPEN' 
							? 'border-red-500 text-red-500 hover:bg-red-50' 
							: 'border-green-500 text-green-500 hover:bg-green-50'
					}`}
				>
					<Power size={16} />
					{row.queue_status === 'OPEN' ? 'Close' : 'Open'}
				</button>
				{!isFrontline && (
					<>
						<button 
							onClick={() => setSelectedQueue(row)}
							className="flex items-center gap-1 px-3 py-1 rounded border border-primary-light text-primary-light hover:bg-primary-light/10"
						>
							<Edit size={16} />
							Edit
						</button>
						<button 
							onClick={() => handleDeleteQueue(row)}
							className="flex items-center gap-1 px-3 py-1 rounded border border-red-500 text-red-500 hover:bg-red-50"
						>
							<Trash2 size={16} />
							Delete
						</button>
					</>
				)}
			</div>
		);
	};

	return (
		<div className="font-regular-eng p-8 min-h-screen">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl text-primary-light font-bold">Manage Queue Entries</h1>
				<button
					onClick={() => setIsCreateModalOpen(true)}
					className="flex items-center gap-2 px-4 py-2 bg-primary-light text-white rounded-lg hover:bg-primary-light/90 transition-colors"
				>
					<Plus size={20} />
					Create Queue
				</button>
			</div>

			<div className="flex flex-wrap gap-12 mb-8">
				{stats.map((stat) => (
					<NumberCard 
						key={stat.label} 
						title={stat.label} 
						value={stat.value} 
						icon={<Users size={32} className="text-primary-light" />} 
					/>
				))}
			</div>

			<div className="bg-white p-4 rounded-lg shadow-sm">
				{queuesData && queuesData.length > 0 ? (
					<Table
						columns={columns}
						data={queuesData}
						renderActions={renderActions}
						loading={false}
					/>
				) : (
					<div className="flex flex-col items-center justify-center py-12">
						<Users size={48} className="text-gray-400 mb-4" />
						<h3 className="text-lg font-semibold text-gray-600 mb-2">No Queues Found</h3>
						<p className="text-gray-500 text-center mb-6">
							You haven't created any queues yet. Create your first queue to get started.
						</p>
						<button
							onClick={() => setIsCreateModalOpen(true)}
							className="flex items-center gap-2 px-4 py-2 bg-primary-light text-white rounded-lg hover:bg-primary-light/90 transition-colors"
						>
							<Plus size={20} />
							Create Your First Queue
						</button>
					</div>
				)}
			</div>

			{/* Create Queue Modal */}
			{isCreateModalOpen && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-md">
						<h2 className="text-xl font-bold mb-4">Create New Queue</h2>
						<form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Queue Name
								</label>
								<input
									{...createForm.register('queue_name', { 
										required: 'Queue name is required',
										minLength: { value: 1, message: 'Queue name is required' }
									})}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
									placeholder="Enter queue name"
								/>
								{createForm.formState.errors.queue_name && (
									<p className="mt-1 text-sm text-red-600">
										{createForm.formState.errors.queue_name.message}
									</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Tags
								</label>
								<input
									{...createForm.register('tags')}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
									placeholder="Enter tags (comma separated)"
									value={createForm.watch('tags')}
									onChange={e => createForm.setValue('tags', e.target.value)}
								/>
							</div>
							<div className="flex justify-end gap-2 mt-6">
								<button
									type="button"
									onClick={() => {
										setIsCreateModalOpen(false);
										createForm.reset();
									}}
									className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={false}
									className="px-4 py-2 bg-primary-light text-white rounded-md hover:bg-primary-light/90 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Create
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Edit Queue Modal */}
			{selectedQueue && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-md">
						<h2 className="text-xl font-bold mb-4">Edit Queue</h2>
						<form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Queue Name
								</label>
								<input
									{...editForm.register('queue_name', { 
										required: 'Queue name is required',
										minLength: { value: 1, message: 'Queue name is required' }
									})}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
								/>
								{editForm.formState.errors.queue_name && (
									<p className="mt-1 text-sm text-red-600">
										{editForm.formState.errors.queue_name.message}
									</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Tags
								</label>
								<input
									{...editForm.register('tags')}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light"
									placeholder="Enter tags (comma separated)"
									value={editForm.watch('tags')}
									onChange={e => editForm.setValue('tags', e.target.value)}
								/>
							</div>
							<div className="flex justify-end gap-2 mt-6">
								<button
									type="button"
									onClick={() => {
										setSelectedQueue(null);
										editForm.reset();
									}}
									className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={false}
									className="px-4 py-2 bg-primary-light text-white rounded-md hover:bg-primary-light/90 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Save Changes
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default ManageQueueEntries;