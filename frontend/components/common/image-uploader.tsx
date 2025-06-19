"use client";

import { useCallback, useEffect, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import Compressor from 'compressorjs';
import { X } from 'lucide-react';

export interface PreviewImage {
	id: string;
	file: File;
	preview: string;
}

interface ImageUploaderProps {
	frameWidth?: string | number;
	frameHeight?: string | number;
	className?: string;
	multiple?: boolean;
	onUploadComplete?: (files: PreviewImage[]) => void;
	existingImage?: PreviewImage[];
	removeImage?: (id: string) => void;
	fontSize?: number;
}

const ImageUploader = ({
	frameWidth = "100%",
	frameHeight = "300px",
	className = "",
	multiple = false,
	existingImage = [],
	onUploadComplete,
	fontSize = 12
}: ImageUploaderProps) => {
	const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);

	useEffect(() => {
		if (existingImage.length > 0) {
			setPreviewImages(existingImage);
		}
	}, [existingImage]);

	// Cleanup object URLs on unmount
	useEffect(() => {
		return () => {
			previewImages.forEach(image => {
				URL.revokeObjectURL(image.preview);
			});
		};
	}, [previewImages]);

	/**
	 * Compress the image to the maximum width and height of 1920px
	 * @param file - The file to compress
	 * @returns The compressed file
	 */
	const compressImage = (file: File): Promise<File> => {
		return new Promise((resolve, reject) => {
			new Compressor(file, {
				quality: 0.8,
				maxWidth: 1920,
				maxHeight: 1920,
				success(result) {
					resolve(new File([result], file.name, {
						type: result.type,
						lastModified: Date.now(),
					}));
				},
				error(err) {
					reject(err);
				},
			});
		});
	};

	/**
	 * On drop, compress the image to the maximum width and height of 1920px
	 * @param acceptedFiles - The files to compress
	 */
	const onDrop = useCallback(async (acceptedFiles: File[]) => {
		try {
			const compressedFiles = await Promise.all(
				acceptedFiles.map(file => compressImage(file))
			);

			const newPreviewImages = compressedFiles.map(file => ({
				id: Math.random().toString(36).substring(7),
				file,
				preview: URL.createObjectURL(file),
			}));

			if (multiple) {
				setPreviewImages(prev => [...prev, ...newPreviewImages]);
				onUploadComplete?.([...previewImages, ...newPreviewImages]);
			} else {
				// Cleanup previous image
				previewImages.forEach(img => URL.revokeObjectURL(img.preview));
				const newImage = newPreviewImages[0];
				setPreviewImages([newImage]);
				onUploadComplete?.([newImage]);
			}
		} catch (error) {
			console.error('Error processing images:', error);
		}
	}, [onUploadComplete, multiple, previewImages]);

	/**
	 * Use the useDropzone hook to handle the drop event
	 * @returns The root props, input props, and is drag active
	 */
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			'image/jpeg': [],
			'image/png': [],
		},
		multiple,
	});

	/**
	 * Remove the image from the preview images
	 * @param id - The id of the image to remove
	 */
	const removeImage = (id: string) => {
		if (multiple) {
			setPreviewImages(prev => prev.filter(img => img.id !== id));
		} else {
			setPreviewImages([]);
		}

		/**
		 * Remove the image from the preview images
		 * @param id - The id of the image to remove
		 */
		setPreviewImages(prev => {
			const imageToRemove = prev.find(img => img.id === id);
			if (imageToRemove) {
				URL.revokeObjectURL(imageToRemove.preview);
			}
			return prev.filter(img => img.id !== id);
		});
	};

	// Track last uploaded image IDs
	const lastUploadedIdsRef = useRef<string[]>([]);
	const [hasChanged, setHasChanged] = useState(false);

	// Compare previewImages with last uploaded
	useEffect(() => {
		const currentIds = previewImages.map(img => img.id).sort().join(',');
		const lastIds = lastUploadedIdsRef.current.sort().join(',');
		setHasChanged(currentIds !== lastIds && previewImages.length > 0);
	}, [previewImages]);

	const handleUpload = () => {
		lastUploadedIdsRef.current = previewImages.map(img => img.id);
		setHasChanged(false);
		// You can call onUploadComplete here if you want to trigger upload
		if (onUploadComplete) onUploadComplete(previewImages);
	};

	// For multiple mode, render uploader and images side by side
	if (multiple) {
		return (
			<div className={`w-full ${className}`}>
				<div className="flex flex-col lg:flex-row flex-wrap gap-4 items-start">
					{/* Uploader */}
					<div>
						<div
							{...getRootProps()}
							className={`relative border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors flex-shrink-0`
								+ (isDragActive ? ' border-primary-light bg-primary-light/10' : ' border-gray-300 hover:border-primary-light')}
							style={{
								width: typeof frameWidth === "number" ? `${frameWidth}px` : frameWidth,
								height: typeof frameHeight === "number" ? `${frameHeight}px` : frameHeight,
								minWidth: 200,
								minHeight: 200,
							}}
						>
							<input {...getInputProps()} className="z-20 relative" />
							<div className="relative z-20 h-full flex flex-col items-center justify-center text-center pointer-events-none">
								<p className="text-gray-600 mb-2" style={{ fontSize: fontSize }}>
									{isDragActive ? 'Drop the image here' : 'Drag & drop or click to upload image'}
								</p>
								<p className="text-sm text-gray-500" style={{ fontSize: fontSize - 2 }}>Supports JPEG, PNG</p>
							</div>
						</div>
					</div>

					<button
						disabled={!hasChanged}
						onClick={handleUpload}
						className={`border px-4 py-2 rounded-md text-sm transition-all duration-200 ml-0 mt-4 lg:mt-0 lg:ml-0
						${hasChanged
							? 'border-primary-light text-primary-light hover:bg-primary-light hover:text-white'
							: 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'}`}
					>
						Upload
					</button>
		
					{/* Images Preview */}
					<div className="flex flex-row flex-wrap gap-4">
						{previewImages.map((img) => (
							<div
								key={img.id}
								className="relative group flex-shrink-0"
								style={{
									width: typeof frameWidth === "number" ? `${frameWidth * 0.8}px` : frameWidth,
									height: typeof frameHeight === "number" ? `${frameHeight * 0.8}px` : frameHeight,
								}}
							>
								<Image
									src={img.preview}
									alt="Preview"
									fill
									className="object-cover rounded-lg shadow-md"
								/>
								<button
									type="button"
									onClick={() => removeImage(img.id)}
									className="absolute top-2 right-2 bg-white text-black rounded-full p-1 shadow hover:bg-red-500 hover:text-white transition z-10"
								>
									<X className="w-4 h-4" />
								</button>
							</div>
						))}
					</div>
				</div>
			</div>
		);
		
	}
	

	// Single mode
	return (
		<div className={`w-full ${className}`}>
			<div
				{...getRootProps()}
				className={`relative border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors
					${isDragActive ? 'border-primary-light bg-primary-light/10' : 'border-gray-300 hover:border-primary-light'}`}
				style={{ width: frameWidth, height: frameHeight }}
			>
				<input {...getInputProps()} className="z-20 relative" />
				
				{/* Single image preview (overlay, but allow interaction below) */}
				{previewImages.length > 0 && !multiple && (
					<>
						<div className="absolute inset-0 z-10 pointer-events-none">
							<Image
								src={previewImages[0].preview}
								alt="Preview"
								fill
								className="object-contain rounded-lg"
							/>
						</div>

						{removeImage && (
							<button
								type="button"
								onClick={e => {
									e.stopPropagation();
									removeImage(previewImages[0].id);
								}}
								className="absolute top-1 right-1 bg-white text-black rounded-full p-1 shadow hover:bg-red-500 hover:text-white transition z-50"
							>
								<X className="w-5 h-5" />
							</button>
						)}
					</>			
				)}
				
				{/* Dropzone label (always interactive) */}
				
				{!(previewImages.length > 0 && !multiple) && (
				<div className="relative z-20 h-full flex flex-col items-center justify-center text-center pointer-events-none">
					<p className="text-gray-600 mb-2" style={{ fontSize: fontSize }}>
					{isDragActive ? 'Drop the image here' : 'Drag & drop or click to upload image'}
					</p>
					<p className="text-sm text-gray-500" style={{ fontSize: fontSize - 2 }}>Supports JPEG, PNG</p>
				</div>
				)}
			</div>
		</div>
	);
};

export default ImageUploader;