"use client";

import { useCallback, useEffect, useState } from 'react';
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
	onImageAdded?: (file: PreviewImage) => Promise<void>;
	onImageRemoved?: (id: string) => void;
	existingImage?: PreviewImage[];
	canRemove?: boolean;
	fontSize?: number;
	onImageClick?: (imageUrl: string, alt?: string) => void;
}

const ImageUploader = ({
	frameWidth = "100%",
	frameHeight = "300px",
	className = "",
	multiple = false,
	existingImage = [],
	onImageAdded,
	onImageRemoved,
	fontSize = 12,
	onImageClick,
	canRemove = true
}: ImageUploaderProps) => {
	const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);
	const existingImageIds = JSON.stringify(existingImage?.map(i => i.id));

	useEffect(() => {
		setPreviewImages(existingImage || []);
	}, [existingImageIds]);

	// Cleanup object URLs on unmount
	useEffect(() => {
		return () => {
			previewImages.forEach(image => {
				if (image.preview.startsWith('blob:')) {
					URL.revokeObjectURL(image.preview);
				}
			});
		};
	}, [previewImages]);

	const removeImage = useCallback((id: string, triggerCallback = true) => {
		const imageToRemove = previewImages.find(img => img.id === id);
		if (imageToRemove && imageToRemove.preview.startsWith('blob:')) {
			URL.revokeObjectURL(imageToRemove.preview);
		}
		
		setPreviewImages(prev => prev.filter(img => img.id !== id));
		
		if (triggerCallback && onImageRemoved) {
			onImageRemoved(id);
		}
	}, [previewImages, onImageRemoved]);

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

			if (!multiple) {
				setPreviewImages(currentPreviews => {
					currentPreviews.forEach(img => {
						if (img.preview.startsWith('blob:')) URL.revokeObjectURL(img.preview);
					});
					return newPreviewImages.slice(0, 1);
				});
			} else {
				setPreviewImages(currentPreviews => [...currentPreviews, ...newPreviewImages]);
			}

			if (onImageAdded) {
                for (const image of newPreviewImages) {
                    try {
                        await onImageAdded(image);
                    } catch (e) {
						console.error("Upload failed, removing preview for", image.id, e);
                        removeImage(image.id, false); // remove preview on failure
                    }
                }
			}
		} catch (error) {
			console.error('Error processing images:', error);
		}
	}, [multiple, onImageAdded, removeImage]);

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

	// For multiple mode, render uploader and images side by side
	if (multiple) {
		return (
			<div className={`w-full ${className}`}>
				<div className="flex flex-row flex-wrap gap-4 items-start">
					{/* Uploader */}
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
								<div 
									className={`w-full h-full ${onImageClick ? 'cursor-pointer hover:opacity-80 transition-opacity duration-200' : ''}`}
									onClick={() => onImageClick?.(img.preview, "Image preview")}
								>
									<Image
										src={img.preview}
										alt="Preview"
										fill
										sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
										className="object-cover rounded-lg shadow-md"
									/>
								</div>
								{canRemove && (
									<button
										type="button"
										onClick={() => removeImage(img.id)}
										className="absolute top-2 right-2 bg-white text-black rounded-full p-1 shadow hover:bg-red-500 hover:text-white transition z-10"
									>
										<X className="w-4 h-4" />
									</button>
								)}
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
						<div 
							className="absolute inset-0 z-10"
						>
							<Image
								src={previewImages[0].preview}
								alt="Preview"
								fill
								sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
								className="object-contain rounded-lg"
							/>
						</div>

						{canRemove && (
							<button
								type="button"
								onClick={e => {
									e.stopPropagation();
									removeImage(previewImages[0].id);
								}}
								className="absolute top-1 right-1 bg-white text-black rounded-full p-1 shadow hover:bg-red-500 hover:text-white transition z-40"
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