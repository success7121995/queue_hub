"use client";

import { useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

interface ImagePreviewModalProps {
	isOpen: boolean;
	onClose: () => void;
	imageUrl: string;
	alt?: string;
}

const ImagePreviewModal = ({ isOpen, onClose, imageUrl, alt = "Image preview" }: ImagePreviewModalProps) => {
	// Handle escape key
	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
			// Prevent body scroll when modal is open
			document.body.style.overflow = 'hidden';
		}

		return () => {
			document.removeEventListener('keydown', handleEscape);
			document.body.style.overflow = 'unset';
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div 
			className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
			onClick={onClose}
		>
			<div 
				className="relative max-w-[90vw] max-h-[90vh] bg-white rounded-lg shadow-xl"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Close button */}
				<button
					onClick={onClose}
					className="absolute top-4 right-4 z-10 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 hover:text-gray-600 rounded-full p-2 shadow-lg transition-all duration-200"
				>
					<X className="w-6 h-6" />
				</button>

				{/* Image */}
				<div className="relative w-full h-full">
					<Image
						src={imageUrl}
						alt={alt}
						width={800}
						height={600}
						className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
						style={{ maxWidth: '90vw' }}
					/>
				</div>
			</div>
		</div>
	);
};

export default ImagePreviewModal; 