"use client";

import { useState, useEffect } from "react";
import Table, { type Column } from "@/components/common/table";
import Tag from "@/components/common/tag";
import NumberCard from "@/components/common/number-card";
import { Users, Plus, Edit, Trash2, Power } from "lucide-react";
import { useDateTime } from "@/constant/datetime-provider";
import { useForm } from "react-hook-form";
// TODO: Enable when backend is ready
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Define types based on database schema
type QueueStatus = 'ONLINE' | 'OFFLINE' | 'PAUSED';

interface Queue {
	queue_id: string;
	branch_id: string;
	queue_name: string;
	tags?: string[];
	queue_status: QueueStatus;
	created_at: string;
	updated_at: string;
}

interface QueueFormData {
	queue_name: string;
	tags: string;
}

const stats = [
	{ label: "Total Customer Served Today", value: 45 },
	{ label: "Total Queues", value: 4 },
	{ label: "Current Queue Volume", value: 7 },
];

// // Mock data based on database schema
// const queueData: Queue[] = [
// 	{
// 		queue_id: "1",
// 		branch_id: "1",
// 		queue_name: "A",
// 		tags: ["3-4 Persons"],
// 		queue_status: 'ONLINE',
// 	},
// 	{
// 		queue_id: "2",
// 		branch_id: "1",
// 		queue_name: "B",
// 		tags: ["1-2 Persons"],
// 		queue_status: 'ONLINE',
// 	},
// 	{
// 		queue_id: "3",
// 		branch_id: "1",
// 		queue_name: "Reserved",
// 		tags: ["Reserved", "Express", "5-8 Persons"],
// 		queue_status: 'ONLINE',
// 	},
// 	{
// 		queue_id: "4",
// 		branch_id: "1",
// 		queue_name: "C",
// 		tags: ["1-4 Persons"],
// 		queue_status: 'ONLINE',
// 	},
// ];

// API functions
const fetchQueues = async (): Promise<Queue[]> => {
	// TODO: Replace with actual API call
	return [
		{
			queue_id: 'Q1',
			branch_id: 'B1',
			queue_name: 'Demo Queue 1',
			tags: ['tag1', 'tag2'],
			queue_status: 'ONLINE',
			created_at: '2024-03-01T10:00:00Z',
			updated_at: '2024-03-01T12:00:00Z',
		},
	];
};

const createQueue = async (data: QueueFormData): Promise<Queue> => {
	// TODO: Replace with actual API call
	const newQueue: Queue = {
		queue_id: Math.random().toString(36).substring(2, 9),
		branch_id: 'B1',
		queue_name: data.queue_name,
		tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
		queue_status: 'ONLINE',
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	};
	return newQueue;
};

const updateQueue = async ({ queue_id, data }: { queue_id: string; data: QueueFormData }): Promise<Queue> => {
	// TODO: Replace with actual API call
	const updatedQueue: Queue = {
		queue_id,
		branch_id: 'B1',
		queue_name: data.queue_name,
		tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
		queue_status: 'ONLINE',
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	};
	return updatedQueue;
};

const deleteQueue = async (queue_id: string): Promise<void> => {
	// TODO: Replace with actual API call
	console.log('Deleting queue:', queue_id);
};

const updateQueueStatus = async ({ queue_id, data }: { queue_id: string; data: QueueFormData }): Promise<Queue> => {
	// TODO: Replace with actual API call
	const updatedQueue: Queue = {
		queue_id,
		branch_id: 'B1',
		queue_name: data.queue_name,
		tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
		queue_status: 'OFFLINE',
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	};
	return updatedQueue;
};

const ManageQueueEntries = () => {
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null);
	const { formatDate } = useDateTime();
	// TODO: Enable when backend is ready
	// const queryClient = useQueryClient();

	// Form handling
	const createForm = useForm<QueueFormData>({
		defaultValues: {
			queue_name: '',
			tags: '',
		},
	});

	const editForm = useForm<QueueFormData>({
		defaultValues: {
			queue_name: '',
			tags: '',
		},
	});

	// TODO: Enable when backend is ready
	// const { data: queues = [], isLoading } = useQuery({
	// 	queryKey: ['queues'],
	// 	queryFn: fetchQueues,
	// });
	const queues = [
		{ queue_id: 'Q1', queue_name: 'Demo Queue 1', tags: ['tag1', 'tag2'], status: 'ONLINE' as QueueStatus, branch_id: 'B1', queue_status: 'ONLINE' as QueueStatus, created_at: '2024-03-01T10:00:00Z', updated_at: '2024-03-01T12:00:00Z' },
		{ queue_id: 'Q2', queue_name: 'Demo Queue 2', tags: ['tag3'], status: 'OFFLINE' as QueueStatus, branch_id: 'B1', queue_status: 'OFFLINE' as QueueStatus, created_at: '2024-03-02T10:00:00Z', updated_at: '2024-03-02T12:00:00Z' }
	];
	const isLoading = false;

	// TODO: Enable when backend is ready
	// const createMutation = useMutation({
	// 	mutationFn: createQueue,
	// 	onSuccess: () => {
	// 		queryClient.invalidateQueries({ queryKey: ['queues'] });
	// 		setIsCreateModalOpen(false);
	// 		createForm.reset();
	// 	},
	// 	onError: (error) => {
	// 		console.error('Create queue error:', error);
	// 	},
	// });
	const onCreateSubmit = (data: QueueFormData) => {
		// TODO: Enable when backend is ready
		// createMutation.mutate(data);
		console.log('Create queue:', data);
		setIsCreateModalOpen(false);
		createForm.reset();
	};

	// TODO: Enable when backend is ready
	// const updateMutation = useMutation({
	// 	mutationFn: updateQueue,
	// 	onSuccess: () => {
	// 		queryClient.invalidateQueries({ queryKey: ['queues'] });
	// 		setSelectedQueue(null);
	// 		editForm.reset();
	// 	},
	// 	onError: (error) => {
	// 		console.error('Update queue error:', error);
	// 	},
	// });
	const onEditSubmit = (data: QueueFormData) => {
		// TODO: Enable when backend is ready
		// updateMutation.mutate({ queue_id: selectedQueue.queue_id, data });
		if (!selectedQueue) return;
		console.log('Edit queue:', { queue_id: selectedQueue.queue_id, data });
		setSelectedQueue(null);
		editForm.reset();
	};

	// TODO: Enable when backend is ready
	// const deleteMutation = useMutation({
	// 	mutationFn: deleteQueue,
	// 	onSuccess: () => {
	// 		queryClient.invalidateQueries({ queryKey: ['queues'] });
	// 	},
	// 	onError: (error) => {
	// 		console.error('Delete queue error:', error);
	// 	},
	// });
	const handleDelete = (queue_id: string) => {
		// TODO: Enable when backend is ready
		// deleteMutation.mutate(queue_id);
		console.log('Delete queue:', queue_id);
	};

	// TODO: Enable when backend is ready
	// const statusMutation = useMutation({
	// 	mutationFn: updateQueueStatus,
	// 	onSuccess: () => {
	// 		queryClient.invalidateQueries({ queryKey: ['queues'] });
	// 	},
	// 	onError: (error) => {
	// 		console.error('Update status error:', error);
	// 	},
	// });
	const handleStatusUpdate = (queue_id: string, status: QueueStatus) => {
		// TODO: Enable when backend is ready
		// statusMutation.mutate({ queue_id, status });
		console.log('Update status:', { queue_id, status });
	};

	// Queue management handlers
	const handleStatusChange = (queue: Queue, newStatus: QueueStatus) => {
		handleStatusUpdate(queue.queue_id, newStatus);
	};

	const handleDeleteQueue = (queue: Queue) => {
		if (window.confirm('Are you sure you want to delete this queue?')) {
			handleDelete(queue.queue_id);
		}
	};

	// Update edit form when queue is selected
	useEffect(() => {
		if (selectedQueue) {
			editForm.reset({
				queue_name: selectedQueue.queue_name,
				tags: selectedQueue.tags?.join(', ') || '',
			});
		}
	}, [selectedQueue, editForm]);

	/**
	 * Columns for the table
	 */
	const columns: Column<Queue>[] = [
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
						row.queue_status === 'ONLINE' ? 'bg-green-500' : 
						row.queue_status === 'PAUSED' ? 'bg-yellow-500' : 'bg-gray-500'
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
					{(row.tags || []).map((tag) => (
						<Tag key={tag} tagName={tag} />
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
	const renderActions = (row: Queue) => (
		<div className="flex gap-2">
			<button 
				onClick={() => handleStatusChange(row, row.queue_status === 'ONLINE' ? 'OFFLINE' : 'ONLINE')}
				className={`flex items-center gap-1 px-3 py-1 rounded border ${
					row.queue_status === 'ONLINE' 
						? 'border-red-500 text-red-500 hover:bg-red-50' 
						: 'border-green-500 text-green-500 hover:bg-green-50'
				}`}
			>
				<Power size={16} />
				{row.queue_status === 'ONLINE' ? 'Close' : 'Open'}
			</button>
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
		</div>
	);

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
				{isLoading ? (
					<div className="flex justify-center items-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light"></div>
					</div>
				) : (
					<Table
						columns={columns}
						data={queues}
						renderActions={renderActions}
					/>
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
										minLength: { value: 2, message: 'Queue name must be at least 2 characters' }
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
										minLength: { value: 2, message: 'Queue name must be at least 2 characters' }
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