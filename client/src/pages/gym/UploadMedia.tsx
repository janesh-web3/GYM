import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Image, Video, Upload, Trash2, Plus, Loader, X, Edit2, CheckCircle, Building2, AlertCircle, Eye } from 'lucide-react';
import { gymService, branchService } from '../../lib/services';
import { MediaItem } from '../../lib/services/mediaService';
import mediaService from '../../lib/services/mediaService';
import { useAuth } from '../../context/AuthContext';
import { showSuccess, showError, showLoading, updateToast } from '../../utils/toast';
import MediaDropzone from '../../components/MediaDropzone';
import MediaGrid from '../../components/MediaGrid';

interface FilePreview {
  file: File;
  preview: string;
  type: 'photo' | 'video';
  error?: string;
}

interface GymResponse {
  _id: string;
  gymName: string;
  photos?: MediaItem[];
  videos?: MediaItem[];
  [key: string]: any;
}

interface BranchResponse {
  _id: string;
  branchName: string;
  gymId: string;
  photos?: MediaItem[];
  videos?: MediaItem[];
  [key: string]: any;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const UploadMedia = () => {
  const { user } = useAuth();
  const [entityType, setEntityType] = useState<'gym' | 'branch'>('gym');
  const [gymId, setGymId] = useState<string | null>(null);
  const [gymData, setGymData] = useState<GymResponse | null>(null);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [branchData, setBranchData] = useState<BranchResponse | null>(null);
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
  const [showUploadPreview, setShowUploadPreview] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [caption, setCaption] = useState("");
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const multipleFilesInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        setLoading(true);
        // Fetch gym data
        const gyms = await gymService.getAllGyms() as GymResponse[];
        if (gyms && gyms.length > 0) {
          const currentGymId = gyms[0]._id;
          setGymId(currentGymId);
          
          // Fetch gym details if gym is the selected entity
          if (entityType === 'gym') {
            const gymData = await gymService.getGymById(currentGymId) as GymResponse;
            setGymData(gymData);
            
            // Set photos and videos from the gym data
            setPhotos(gymData.photos?.map(photo => ({
              ...photo,
              type: 'photo'
            })) || []);
            
            setVideos(gymData.videos?.map(video => ({
              ...video,
              type: 'video'
            })) || []);
          }
          
          // Fetch branches for this gym
          const branchesData = await branchService.getAllBranches() as BranchResponse[];
          const gymBranches = branchesData.filter(branch => branch.gymId === currentGymId);
          setBranches(gymBranches);
          
          // Set default branch if available and branch is the selected entity
          if (gymBranches.length > 0 && entityType === 'branch') {
            const firstBranch = gymBranches[0];
            setBranchId(firstBranch._id);
            setBranchData(firstBranch);
            
            // Set photos and videos from the branch data
            setPhotos(firstBranch.photos?.map(photo => ({
              ...photo,
              type: 'photo'
            })) || []);
            
            setVideos(firstBranch.videos?.map(video => ({
              ...video,
              type: 'video'
            })) || []);
          }
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        showError('Failed to load media data');
        console.error('Error fetching data:', error);
      }
    };
    
    if (user) {
      fetchEntities();
    }
  }, [user, entityType]);

  const handleEntityTypeChange = (type: 'gym' | 'branch') => {
    setEntityType(type);
    setPhotos([]);
    setVideos([]);
    setEditingMedia(null);
  };

  const handleBranchChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedBranchId = e.target.value;
    setBranchId(selectedBranchId);
    
    if (selectedBranchId) {
      setLoading(true);
      try {
        const branchData = await branchService.getBranchById(selectedBranchId) as BranchResponse;
        setBranchData(branchData);
        
        // Set photos and videos from the branch data
        setPhotos(branchData.photos?.map(photo => ({
          ...photo,
          type: 'photo'
        })) || []);
        
        setVideos(branchData.videos?.map(video => ({
          ...video,
          type: 'video'
        })) || []);
        
        setLoading(false);
      } catch (error) {
        setLoading(false);
        showError('Failed to load branch media');
        console.error('Error fetching branch media:', error);
      }
    }
  };

  const getEntityId = () => {
    return entityType === 'gym' ? gymId : branchId;
  };

  const handlePhotoUploadClick = () => {
    photoInputRef.current?.click();
  };

  const handleVideoUploadClick = () => {
    videoInputRef.current?.click();
  };

  const validateFile = (file: File, type: 'photo' | 'video'): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { 
        valid: false, 
        error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`
      };
    }
    
    // Check file type
    const allowedTypes = type === 'photo' ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES;
    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: `Unsupported format. Allowed: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}`
      };
    }
    
    return { valid: true };
  };

  const createFilePreview = (file: File): FilePreview => {
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const type = isImage ? 'photo' : 'video';
    
    // Validate the file
    const validation = validateFile(file, type);
    
    // Create the object URL for preview
    const preview = validation.valid ? URL.createObjectURL(file) : '';
    
    return {
      file,
      preview,
      type,
      error: validation.error
    };
  };

  const handleMultipleFilesSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const filePreviews: FilePreview[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const filePreview = createFilePreview(files[i]);
      filePreviews.push(filePreview);
    }
    
    setSelectedFiles(filePreviews);
    setShowUploadPreview(true);
    
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  };

  const removeSelectedFile = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(selectedFiles[index].preview);
    
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    
    if (selectedFiles.length === 1) {
      setShowUploadPreview(false);
    }
  };

  const handleBulkUpload = async () => {
    const entityId = getEntityId();
    if (!entityId || selectedFiles.length === 0) return;
    
    setUploading(true);
    const toastId = showLoading(`Uploading ${selectedFiles.length} file(s)...`);
    
    try {
      // Separate images and videos
      const imageFiles = selectedFiles
        .filter(item => item.type === 'photo' && !item.error)
        .map(item => item.file);
      
      const videoFiles = selectedFiles
        .filter(item => item.type === 'video' && !item.error)
        .map(item => item.file);
      
      const newPhotos: MediaItem[] = [];
      const newVideos: MediaItem[] = [];
      
      // Upload images if any
      if (imageFiles.length > 0) {
        try {
          const photoResults = await mediaService.uploadMultipleMediaFiles(
            imageFiles, 
            'photo', 
            entityId, 
            entityType
          );
          newPhotos.push(...photoResults);
        } catch (error) {
          console.error('Error uploading photos:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error uploading photos';
          showError(errorMessage);
        }
      }
      
      // Upload videos if any
      if (videoFiles.length > 0) {
        try {
          const videoResults = await mediaService.uploadMultipleMediaFiles(
            videoFiles, 
            'video', 
            entityId, 
            entityType
          );
          newVideos.push(...videoResults);
        } catch (error) {
          console.error('Error uploading videos:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error uploading videos';
          showError(errorMessage);
        }
      }
      
      // Update state
      setPhotos(prev => [...prev, ...newPhotos]);
      setVideos(prev => [...prev, ...newVideos]);
      
      // Clean up previews
      selectedFiles.forEach(file => URL.revokeObjectURL(file.preview));
      setSelectedFiles([]);
      setShowUploadPreview(false);
      
      const totalUploaded = newPhotos.length + newVideos.length;
      if (totalUploaded > 0) {
        updateToast(toastId, `Successfully uploaded ${totalUploaded} file(s)!`, 'success');
      } else {
        updateToast(toastId, 'No files were uploaded. Please try again.', 'error');
      }
    } catch (error) {
      console.error(`Error during bulk upload:`, error);
      updateToast(toastId, `An error occurred during upload: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setUploading(false);
    }
  };
  
  const openMediaPreview = (item: MediaItem) => {
    setPreviewItem(item);
  };
  
  const closeMediaPreview = () => {
    setPreviewItem(null);
  };

  const handleDelete = async (item: MediaItem) => {
    const entityId = getEntityId();
    if (!entityId || !item._id || !item.public_id) return;
    
    const toastId = showLoading(`Deleting ${item.type}...`);
    
    try {
      // Delete from Cloudinary via our backend
      await mediaService.deleteMedia(item.public_id, entityId, item._id, entityType);
      
      // Update local state
      if (item.type === 'photo') {
        setPhotos(prev => prev.filter(photo => photo._id !== item._id));
      } else {
        setVideos(prev => prev.filter(video => video._id !== item._id));
      }
      
      updateToast(toastId, `Successfully deleted ${item.type}!`, 'success');
    } catch (error) {
      console.error(`Error deleting ${item.type}:`, error);
      updateToast(toastId, `Failed to delete ${item.type}: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleEditCaption = (item: MediaItem) => {
    setEditingMedia(item);
    setCaption(item.caption || '');
  };

  const handleSaveCaption = async () => {
    if (!editingMedia || !gymId) return;
    
    const toastId = showLoading(`Updating caption...`);
    
    try {
      // Make API request to update the caption
      // Example endpoint structure: /api/gyms/{gymId}/media/{mediaId}
      const endpoint = `/api/gyms/${gymId}/media/${editingMedia._id}`;
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ caption }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update caption. Status: ${response.status}`);
      }
      
      // Update local state
      if (editingMedia.type === 'photo') {
        setPhotos(prev => prev.map(photo => 
          photo._id === editingMedia._id ? { ...photo, caption } : photo
        ));
      } else {
        setVideos(prev => prev.map(video => 
          video._id === editingMedia._id ? { ...video, caption } : video
        ));
      }
      
      updateToast(toastId, `Caption updated successfully!`, 'success');
    } catch (error) {
      console.error(`Error updating caption:`, error);
      updateToast(toastId, `Failed to update caption: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      
      // For development/demo purposes - simulate successful update
      if (process.env.NODE_ENV !== 'production') {
        // Update local state
        if (editingMedia.type === 'photo') {
          setPhotos(prev => prev.map(photo => 
            photo._id === editingMedia._id ? { ...photo, caption } : photo
          ));
        } else {
          setVideos(prev => prev.map(video => 
            video._id === editingMedia._id ? { ...video, caption } : video
          ));
        }
        
        updateToast(toastId, `Demo mode: Updated caption`, 'success');
      }
    } finally {
      setEditingMedia(null);
      setCaption('');
    }
  };

  // Maintain the original function for compatibility
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
    const files = e.target.files;
    const entityId = getEntityId();
    if (!files || !entityId) return;

    setUploading(true);
    const toastId = showLoading(`Uploading ${files.length} ${type}(s)...`);

    try {
      const uploadedItems: MediaItem[] = [];
      
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate the file
        const validation = validateFile(file, type);
        if (!validation.valid) {
          showError(validation.error || `Invalid file`);
          continue;
        }
        
        try {
          // Upload to Cloudinary via our backend
          const result = await mediaService.uploadMediaFile(file, type, entityId, entityType);
          
          uploadedItems.push({
            _id: Date.now().toString() + i, // Temporary ID until we refresh from server
            type,
            url: result.url,
            public_id: result.public_id,
            caption: file.name
          });
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          showError(`Failed to upload ${file.name}`);
        }
      }
      
      // Update state with new media
      if (type === 'photo') {
        setPhotos(prev => [...prev, ...uploadedItems]);
      } else {
        setVideos(prev => [...prev, ...uploadedItems]);
      }
      
      // Reset the file input
      if (type === 'photo' && photoInputRef.current) {
        photoInputRef.current.value = '';
      } else if (type === 'video' && videoInputRef.current) {
        videoInputRef.current.value = '';
      }
      
      if (uploadedItems.length > 0) {
        updateToast(toastId, `Successfully uploaded ${uploadedItems.length} ${type}(s)!`, 'success');
      } else {
        updateToast(toastId, `No ${type}s were uploaded. Please try again.`, 'error');
      }
    } catch (error) {
      console.error(`Error during ${type} upload:`, error);
      updateToast(toastId, `An error occurred during upload: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Media Gallery</h1>
      
      {/* Entity Type Selector */}
      <div className="mb-6">
        <div className="bg-white shadow-md rounded-md p-4">
          <h2 className="text-lg font-semibold mb-3">Select Media Source</h2>
          <div className="flex gap-4">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                entityType === 'gym' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
              onClick={() => handleEntityTypeChange('gym')}
            >
              <Building2 size={18} />
              Main Gym
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                entityType === 'branch' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
              onClick={() => handleEntityTypeChange('branch')}
            >
              <Building2 size={18} />
              Branch
            </button>
          </div>
          
          {entityType === 'branch' && (
            <div className="mt-4">
              <label htmlFor="branch-select" className="block text-sm font-medium text-gray-700 mb-1">
                Select Branch
              </label>
              <select
                id="branch-select"
                value={branchId || ''}
                onChange={handleBranchChange}
                className="w-full max-w-xs p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                {branches.length === 0 ? (
                  <option value="">No branches available</option>
                ) : (
                  branches.map(branch => (
                    <option key={branch._id} value={branch._id}>
                      {branch.branchName}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Media Gallery</h1>
            <p className="text-gray-600 mt-1">Showcase your gym with photos and videos</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => multipleFilesInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Upload Media
              <input
                ref={multipleFilesInputRef}
                type="file"
                accept={[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(',')}
                multiple
                hidden
                onChange={handleMultipleFilesSelect}
              />
            </button>
            
            {/* Upload Controls */}
            <div className="mt-8 mb-6">
              <MediaDropzone 
                onFilesSelected={(files) => {
                  // Convert from MediaDropzone FilePreview to our local FilePreview type
                  const convertedFiles = files.map(file => ({
                    file: file.file,
                    preview: file.preview,
                    type: file.type === 'unknown' ? 'photo' : file.type as 'photo' | 'video',
                    error: file.error
                  }));
                  setSelectedFiles(convertedFiles);
                  setShowUploadPreview(true);
                }}
                uploading={uploading}
                allowedTypes={['photo', 'video']}
                maxFiles={20}
                className="mb-4"
              />
              
              {/* Legacy buttons for backward compatibility */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handlePhotoUploadClick}
                  disabled={uploading}
                  className="inline-flex items-center px-4 py-2 border border-primary-500 text-primary-600 rounded-md hover:bg-primary-50 transition-colors disabled:border-gray-400 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <Image className="w-4 h-4 mr-2" />
                  Photos Only
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept={ALLOWED_IMAGE_TYPES.join(',')}
                    multiple
                    hidden
                    onChange={(e) => handleFileUpload(e, 'photo')}
                  />
                </button>
                
                <button
                  onClick={handleVideoUploadClick}
                  disabled={uploading}
                  className="inline-flex items-center px-4 py-2 border border-primary-500 text-primary-600 rounded-md hover:bg-primary-50 transition-colors disabled:border-gray-400 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Videos Only
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept={ALLOWED_VIDEO_TYPES.join(',')}
                    multiple
                    hidden
                    onChange={(e) => handleFileUpload(e, 'video')}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* File Preview Section */}
        {showUploadPreview && selectedFiles.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Selected Files</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    selectedFiles.forEach(file => URL.revokeObjectURL(file.preview));
                    setSelectedFiles([]);
                    setShowUploadPreview(false);
                  }}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkUpload}
                  disabled={uploading || selectedFiles.every(file => !!file.error)}
                  className="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <span className="flex items-center">
                      <Loader className="w-3 h-3 mr-1 animate-spin" />
                      Uploading...
                    </span>
                  ) : (
                    `Upload ${selectedFiles.filter(f => !f.error).length} Files`
                  )}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <div className={`aspect-square rounded-md overflow-hidden border ${file.error ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                    {file.error ? (
                      <div className="flex flex-col items-center justify-center h-full p-2">
                        <AlertCircle className="w-8 h-8 text-red-500 mb-1" />
                        <p className="text-xs text-red-600 text-center">{file.error}</p>
                      </div>
                    ) : file.type === 'photo' ? (
                      <img 
                        src={file.preview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="relative w-full h-full bg-gray-100 flex items-center justify-center">
                        <Video className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => removeSelectedFile(index)}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-gray-200 hover:bg-red-50 hover:border-red-300"
                  >
                    <X className="w-4 h-4 text-gray-600 hover:text-red-600" />
                  </button>
                  
                  <div className="mt-1 text-xs truncate text-gray-600 text-center">
                    {file.file.name.length > 20 
                      ? `${file.file.name.substring(0, 20)}...` 
                      : file.file.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photos Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Photos</h2>
            <span className="text-sm text-gray-500">{photos.length} item{photos.length !== 1 ? 's' : ''}</span>
          </div>
          
          {photos.length === 0 ? (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-gray-900 font-medium mb-1">No photos yet</h3>
              <p className="text-gray-500 mb-4">Upload photos to showcase your gym</p>
              <button
                onClick={handlePhotoUploadClick}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Photos
              </button>
            </div>
          ) : (
            <MediaGrid
              items={photos}
              onView={openMediaPreview}
              onEdit={handleEditCaption}
              onDelete={handleDelete}
            />
          )}
        </div>

        {/* Videos Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Videos</h2>
            <span className="text-sm text-gray-500">{videos.length} item{videos.length !== 1 ? 's' : ''}</span>
          </div>
          
          {videos.length === 0 ? (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-gray-900 font-medium mb-1">No videos yet</h3>
              <p className="text-gray-500 mb-4">Upload videos to showcase your gym activities</p>
              <button
                onClick={handleVideoUploadClick}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Videos
              </button>
            </div>
          ) : (
            <MediaGrid
              items={videos}
              onView={openMediaPreview}
              onEdit={handleEditCaption}
              onDelete={handleDelete}
            />
          )}
        </div>

        {/* Caption Edit Modal */}
        {editingMedia && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Caption</h3>
                <button
                  onClick={() => setEditingMedia(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-1">
                  Caption
                </label>
                <input
                  type="text"
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Add a caption..."
                  autoFocus
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setEditingMedia(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCaption}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Media Preview Modal */}
        {previewItem && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
            onClick={closeMediaPreview}
          >
            <div 
              className="max-w-4xl w-full max-h-[90vh] overflow-auto bg-white rounded-lg shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-medium">
                  {previewItem.caption || (previewItem.type === 'photo' ? 'Photo' : 'Video')}
                </h3>
                <button
                  onClick={closeMediaPreview}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-4">
                {previewItem.type === 'photo' ? (
                  <img 
                    src={previewItem.url} 
                    alt={previewItem.caption || 'Full size preview'} 
                    className="w-full h-auto mx-auto"
                  />
                ) : (
                  <video 
                    src={previewItem.url} 
                    controls 
                    className="w-full h-auto mx-auto"
                    autoPlay
                  ></video>
                )}
              </div>
              
              {previewItem.caption && (
                <div className="px-4 pb-4">
                  <p className="text-gray-700">{previewItem.caption}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadMedia; 