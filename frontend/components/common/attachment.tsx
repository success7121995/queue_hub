"use client";

import { X } from 'lucide-react';

interface AttachmentProps {
    files: File[];
    onRemove: (file: File) => void;
}

const Attachment = ({ files, onRemove }: AttachmentProps) => {
    if (!files || files.length === 0) return null;
    console.log(files);
    return (
        <div className="space-y-2 mt-2">
            {files.map((file) => (
                <div key={file.name + file.size} className="flex items-center justify-between bg-surface border border-border rounded px-3 py-2">
                    <span className="truncate text-sm text-gray-700">{file.name}</span>
                    <button
                        type="button"
                        className="ml-2 text-gray-400 hover:text-red-500 p-1 rounded-full"
                        onClick={() => onRemove(file)}
                        aria-label="Remove attachment"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default Attachment;