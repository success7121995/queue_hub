"use client";

import { useState } from "react";
// TODO: Enable when backend is ready
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table } from "@/components";
import { Column } from "@/components/common/table";
import LoadingIndicator from "@/components/common/loading-indicator";
import ExportBtn from "@/components/common/export-btn";
import { useDateTime } from "@/constant/datetime-provider";
import { Badge } from "@/components/ui/badge";
import { FileText, Edit2, Trash2, Eye, CheckCircle, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";

interface LegalDocument {
	id: string;
	title: string;
	type: "terms" | "privacy" | "cookie" | "gdpr" | "other";
	version: string;
	status: "draft" | "published" | "archived";
	content: string;
	effectiveDate?: string;
	expiryDate?: string;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
	lastPublishedAt?: string;
	lastPublishedBy?: string;
	requiresConsent: boolean;
	consentRequiredFrom: ("customers" | "merchants" | "admins")[];
}

interface LegalDocumentFormData {
	title: string;
	type: LegalDocument["type"];
	content: string;
	effectiveDate?: string;
	expiryDate?: string;
	requiresConsent: boolean;
	consentRequiredFrom: LegalDocument["consentRequiredFrom"];
}

const Legal = () => {
	const { formatDate } = useDateTime();
	const [isEditing, setIsEditing] = useState(false);
	const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);
	const [isPreviewing, setIsPreviewing] = useState(false);
	// TODO: Enable when backend is ready
	// const queryClient = useQueryClient();

	const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<LegalDocumentFormData>();
	const requiresConsent = watch("requiresConsent");

	// TODO: Enable when backend is ready
	/*
	const { data: documents, isLoading } = useQuery<LegalDocument[]>({
		queryKey: ['legal-documents'],
		queryFn: async () => {
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/legal`, {
				credentials: 'include',
			});
			if (!res.ok) throw new Error('Failed to fetch legal documents');
			return res.json();
		},
	});

	const createMutation = useMutation({
		mutationFn: async (data: LegalDocumentFormData) => {
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/legal`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(data),
			});
			if (!res.ok) throw new Error('Failed to create legal document');
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['legal-documents'] });
			reset();
			setIsEditing(false);
		},
	});

	const updateMutation = useMutation({
		mutationFn: async ({ id, data }: { id: string; data: LegalDocumentFormData }) => {
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/legal/${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(data),
			});
			if (!res.ok) throw new Error('Failed to update legal document');
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['legal-documents'] });
			reset();
			setIsEditing(false);
			setSelectedDocument(null);
		},
	});

	const publishMutation = useMutation({
		mutationFn: async (id: string) => {
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/legal/${id}/publish`, {
				method: 'POST',
				credentials: 'include',
			});
			if (!res.ok) throw new Error('Failed to publish legal document');
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['legal-documents'] });
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: string) => {
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/legal/${id}`, {
				method: 'DELETE',
				credentials: 'include',
			});
			if (!res.ok) throw new Error('Failed to delete legal document');
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['legal-documents'] });
		},
	});
	*/

	// Mock data for UI development
	const mockDocuments: LegalDocument[] = [
		{
			id: "LEGAL-001",
			title: "Terms of Service",
			type: "terms",
			version: "1.0.0",
			status: "published",
			content: "This is the terms of service content...",
			effectiveDate: "2024-03-01T00:00:00Z",
			createdBy: "ADMIN-001",
			createdAt: "2024-02-15T10:00:00Z",
			updatedAt: "2024-02-15T10:00:00Z",
			lastPublishedAt: "2024-03-01T00:00:00Z",
			lastPublishedBy: "ADMIN-001",
			requiresConsent: true,
			consentRequiredFrom: ["customers", "merchants"]
		},
		{
			id: "LEGAL-002",
			title: "Privacy Policy",
			type: "privacy",
			version: "1.0.0",
			status: "published",
			content: "This is the privacy policy content...",
			effectiveDate: "2024-03-01T00:00:00Z",
			createdBy: "ADMIN-001",
			createdAt: "2024-02-15T10:00:00Z",
			updatedAt: "2024-02-15T10:00:00Z",
			lastPublishedAt: "2024-03-01T00:00:00Z",
			lastPublishedBy: "ADMIN-001",
			requiresConsent: true,
			consentRequiredFrom: ["customers", "merchants", "admins"]
		}
	];

	// Use mock data instead of query data
	const documents = mockDocuments;
	const isLoading = false;

	// Mock handlers for UI development
	const handleCreate = async (data: LegalDocumentFormData) => {
		console.log('Create legal document:', data);
		reset();
		setIsEditing(false);
	};

	const handleUpdate = async (id: string, data: LegalDocumentFormData) => {
		console.log('Update legal document:', { id, data });
		reset();
		setIsEditing(false);
		setSelectedDocument(null);
	};

	const handlePublish = async (id: string) => {
		console.log('Publish legal document:', id);
	};

	const handleDelete = async (id: string) => {
		console.log('Delete legal document:', id);
	};

	const onSubmit = (data: LegalDocumentFormData) => {
		if (isEditing && selectedDocument) {
			handleUpdate(selectedDocument.id, data);
		} else {
			handleCreate(data);
		}
	};

	const getTypeBadge = (type: LegalDocument["type"]) => {
		const typeConfig = {
			terms: { color: "bg-blue-100 text-blue-800", label: "Terms of Service" },
			privacy: { color: "bg-purple-100 text-purple-800", label: "Privacy Policy" },
			cookie: { color: "bg-green-100 text-green-800", label: "Cookie Policy" },
			gdpr: { color: "bg-yellow-100 text-yellow-800", label: "GDPR" },
			other: { color: "bg-gray-100 text-gray-800", label: "Other" },
		};
		const config = typeConfig[type];
		return (
			<Badge className={config.color}>
				{config.label}
			</Badge>
		);
	};

	const getStatusBadge = (status: LegalDocument["status"]) => {
		const statusConfig = {
			draft: { color: "bg-gray-100 text-gray-800", icon: <FileText className="w-4 h-4" /> },
			published: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-4 h-4" /> },
			archived: { color: "bg-red-100 text-red-800", icon: <AlertCircle className="w-4 h-4" /> },
		};
		const config = statusConfig[status];
		return (
			<Badge className={`flex items-center gap-1 ${config.color}`}>
				{config.icon}
				{status.charAt(0).toUpperCase() + status.slice(1)}
			</Badge>
		);
	};

	const columns: Column<LegalDocument>[] = [
		{
			header: "Title",
			accessor: (row) => (
				<div>
					<div className="font-medium">{row.title}</div>
					<div className="text-sm text-gray-500">Version {row.version}</div>
				</div>
			),
		},
		{
			header: "Type",
			accessor: (row) => getTypeBadge(row.type),
		},
		{
			header: "Status",
			accessor: (row) => getStatusBadge(row.status),
		},
		{
			header: "Effective Date",
			accessor: (row) => row.effectiveDate ? formatDate(new Date(row.effectiveDate)) : "Not set",
		},
		{
			header: "Consent Required",
			accessor: (row) => (
				<div>
					{row.requiresConsent ? (
						<div className="flex flex-wrap gap-1">
							{row.consentRequiredFrom.map((role) => (
								<Badge key={role} className="bg-gray-100 text-gray-800">
									{role.charAt(0).toUpperCase() + role.slice(1)}
								</Badge>
							))}
						</div>
					) : (
						<span className="text-gray-500">No</span>
					)}
				</div>
			),
		},
		{
			header: "Last Updated",
			accessor: (row) => (
				<div>
					<div>{formatDate(new Date(row.updatedAt))}</div>
					<div className="text-sm text-gray-500">by {row.createdBy}</div>
				</div>
			),
		},
		{
			header: "Actions",
			accessor: (row) => (
				<div className="flex gap-2">
					<button
						onClick={() => {
							setSelectedDocument(row);
							setIsPreviewing(true);
						}}
						className="bg-primary-light text-white p-2 rounded-full hover:bg-primary-dark transition-colors"
					>
						<Eye className="w-4 h-4" />
					</button>
					{row.status === "draft" && (
						<button
							onClick={() => {
								setSelectedDocument(row);
								setIsEditing(true);
								reset(row);
							}}
							className="bg-primary-light text-white p-2 rounded-full hover:bg-primary-dark transition-colors"
						>
							<Edit2 className="w-4 h-4" />
						</button>
					)}
					{row.status === "draft" && (
						<button
							onClick={() => handlePublish(row.id)}
							className="bg-green-100 text-green-800 p-2 rounded-full hover:bg-green-200 transition-colors"
						>
							<CheckCircle className="w-4 h-4" />
						</button>
					)}
					{row.status === "draft" && (
						<button
							onClick={() => handleDelete(row.id)}
							className="bg-red-100 text-red-800 p-2 rounded-full hover:bg-red-200 transition-colors"
						>
							<Trash2 className="w-4 h-4" />
						</button>
					)}
				</div>
			),
		},
	];

	if (isLoading) {
		return <LoadingIndicator fullScreen />;
	}

	return (
		<div className="min-h-screen font-regular-eng p-8">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl text-primary-light font-bold">Legal Documents</h1>
				<div className="flex gap-4">
					<button
						onClick={() => {
							setIsEditing(true);
							setSelectedDocument(null);
							reset();
						}}
						className="bg-primary-light text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors"
					>
						Create Document
					</button>
					<ExportBtn data={documents} filename="legal-documents" />
				</div>
			</div>

			{isEditing && (
				<div className="bg-white rounded-lg shadow-md p-6 mb-8">
					<h2 className="text-xl font-semibold mb-4">
						{selectedDocument ? "Edit Legal Document" : "Create Legal Document"}
					</h2>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">Title</label>
								<input
									type="text"
									{...register("title", { required: "Title is required" })}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light"
								/>
								{errors.title && (
									<p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">Type</label>
								<select
									{...register("type", { required: "Type is required" })}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light"
								>
									<option value="terms">Terms of Service</option>
									<option value="privacy">Privacy Policy</option>
									<option value="cookie">Cookie Policy</option>
									<option value="gdpr">GDPR</option>
									<option value="other">Other</option>
								</select>
								{errors.type && (
									<p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">Effective Date</label>
								<input
									type="datetime-local"
									{...register("effectiveDate")}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">Expiry Date</label>
								<input
									type="datetime-local"
									{...register("expiryDate")}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light"
								/>
							</div>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">Content</label>
							<textarea
								{...register("content", { required: "Content is required" })}
								rows={10}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light"
							/>
							{errors.content && (
								<p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
							)}
						</div>
						<div className="space-y-4">
							<div className="flex items-center">
								<input
									type="checkbox"
									{...register("requiresConsent")}
									className="h-4 w-4 rounded border-gray-300 text-primary-light focus:ring-primary-light"
								/>
								<label className="ml-2 block text-sm text-gray-700">
									Requires User Consent
								</label>
							</div>
							{requiresConsent && (
								<div>
									<label className="block text-sm font-medium text-gray-700">Required From</label>
									<select
										multiple
										{...register("consentRequiredFrom", {
											required: requiresConsent ? "Please select at least one user type" : false,
										})}
										className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light"
									>
										<option value="customers">Customers</option>
										<option value="merchants">Merchants</option>
										<option value="admins">Admins</option>
									</select>
									{errors.consentRequiredFrom && (
										<p className="mt-1 text-sm text-red-600">{errors.consentRequiredFrom.message}</p>
									)}
								</div>
							)}
						</div>
						<div className="flex justify-end gap-4">
							<button
								type="button"
								onClick={() => {
									setIsEditing(false);
									setSelectedDocument(null);
									reset();
								}}
								className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								type="submit"
								className="px-4 py-2 bg-primary-light text-white rounded-md text-sm font-medium hover:bg-primary-dark"
							>
								{selectedDocument ? "Update" : "Create"}
							</button>
						</div>
					</form>
				</div>
			)}

			{isPreviewing && selectedDocument && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							<div className="flex justify-between items-start mb-4">
								<div>
									<h2 className="text-2xl font-bold text-gray-900">{selectedDocument.title}</h2>
									<div className="text-sm text-gray-500">
										Version {selectedDocument.version} • {getTypeBadge(selectedDocument.type)}
									</div>
								</div>
								<button
									onClick={() => {
										setIsPreviewing(false);
										setSelectedDocument(null);
									}}
									className="text-gray-400 hover:text-gray-500"
								>
									<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
							<div className="prose max-w-none">
								{selectedDocument.content}
							</div>
							{selectedDocument.effectiveDate && (
								<div className="mt-4 text-sm text-gray-500">
									Effective Date: {formatDate(new Date(selectedDocument.effectiveDate))}
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			<div className="w-full overflow-x-auto">
				<Table columns={columns} data={documents} />
			</div>
		</div>
	);
};

export default Legal; 