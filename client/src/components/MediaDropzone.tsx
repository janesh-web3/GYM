import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image, Video, File, AlertCircle, Loader } from 'lucide-react';
import { validateMediaFile } from '../lib/services/mediaService';

interface FilePreview {
  file: File;
  preview: string;
  type: 'photo' | 'video' | 'unknown';
  error?: string;
}

interface MediaDropzoneProps {
  onFilesSelected: (files: FilePreview[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  className?: string;
  multiple?: boolean;
  disabled?: boolean;
  allowedTypes?: ('photo' | 'video')[];
  label?: string;
  uploading?: boolean;
}

const MediaDropzone: React.FC<MediaDropzoneProps> = ({
  onFilesSelected,
  accept = 'image/*,video/*',
  maxFiles = 10,
  maxSize,
  className = '',
  multiple = true,
  disabled = false,
  allowedTypes = ['photo', 'video'],
  label = 'Drag & drop files here, or click to browse',
  uploading = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createFilePreview = useCallback((file: File): FilePreview => {
    const isPhoto = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const type = isPhoto ? 'photo' : isVideo ? 'video' : 'unknown';
    
    // Check if file type is allowed
    if (!allowedTypes.includes(type as 'photo' | 'video')) {
      return {
        file,
        preview: '',
        type,
        error: `Only ${allowedTypes.join(' and ')} files are allowed`
      };
    }
    
    // Validate with mediaService utility
    const validation = validateMediaFile(file, type as 'photo' | 'video');
    if (!validation.valid) {
      return {
        file,
        preview: '',
        type,
        error: validation.error
      };
    }
    
    // Create preview
    const preview = isPhoto || isVideo ? URL.createObjectURL(file) : '';
    
    return {
      file,
      preview,
      type: type as 'photo' | 'video',
      error: undefined
    };
  }, [allowedTypes]);

  const processFiles = useCallback((files: FileList | File[]) => {
    if (disabled || uploading) return;
    
    const fileArray = Array.from(files);
    
    // Check if too many files were selected
    if (multiple && maxFiles && fileArray.length > maxFiles) {
      setDragError(`Too many files selected. Maximum allowed is ${maxFiles}.`);
      return;
    }
    
    // Create file previews
    const filePreviews = fileArray.map(createFilePreview);
    
    // Call callback with the file previews
    onFilesSelected(filePreviews);
    
    // Clear any previous errors
    setDragError(null);
  }, [disabled, uploading, multiple, maxFiles, createFilePreview, onFilesSelected]);

  const handleClick = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || uploading) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || uploading) return;
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled || uploading) return;
    
    const { files } = e.dataTransfer;
    if (!files || files.length === 0) return;
    
    processFiles(files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!files || files.length === 0) return;
    
    processFiles(files);
    
    // Reset file input value to allow selecting the same file again
    e.target.value = '';
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors
          ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:bg-gray-50'}
          ${disabled || uploading ? 'opacity-60 cursor-not-allowed' : ''}
        `}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader className="w-10 h-10 text-primary-500 animate-spin mb-3" />
            <p className="text-gray-500 text-center">Uploading files...</p>
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-700 font-medium mb-1">{label}</p>
            <p className="text-gray-500 text-sm text-center">
              {allowedTypes.includes('photo') && allowedTypes.includes('video') 
                ? 'JPG, PNG, GIF, MP4 or MOV' 
                : allowedTypes.includes('photo') 
                  ? 'JPG, PNG or GIF' 
                  : 'MP4 or MOV'}
            </p>
            {maxSize && (
              <p className="text-gray-500 text-sm mt-1">
                Max size: {maxSize / (1024 * 1024)}MB
              </p>
            )}
          </>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || uploading}
        />
      </div>
      
      {dragError && (
        <div className="mt-2 text-sm text-red-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {dragError}
        </div>
      )}
    </div>
  );
};

export default MediaDropzone; 