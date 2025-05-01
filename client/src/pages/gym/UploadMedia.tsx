import { useState, useEffect, ChangeEvent } from 'react';
import { Image, Video, Upload, Trash2, Plus, Loader } from 'lucide-react';
import { gymService } from '../../lib/services';
import { useAuth } from '../../context/AuthContext';
import { showSuccess, showError, showLoading, updateToast } from '../../utils/toast';

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  title: string;
  description: string;
}

interface GymResponse {
  _id: string;
  name: string;
  [key: string]: any;
}

const UploadMedia = () => {
  const { user } = useAuth();
  const [gymId, setGymId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);

  useEffect(() => {
    const fetchGymMedia = async () => {
      try {
        setLoading(true);
        // In a real app, we'd fetch the gym ID associated with this owner
        const gyms = await gymService.getAllGyms() as GymResponse[];
        if (gyms && gyms.length > 0) {
          setGymId(gyms[0]._id);
          
          // In a real app, we would fetch the media from the API
          // For now, we'll use some sample data
          setPhotos([
            {
              id: '1',
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
              title: 'Gym Interior',
              description: 'Main workout area with modern equipment',
            },
            {
              id: '2',
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f',
              title: 'Cardio Section',
              description: 'State-of-the-art cardio machines',
            },
          ]);
          
          setVideos([
            {
              id: '1',
              type: 'video',
              url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
              title: 'Gym Tour',
              description: 'Virtual tour of our facilities',
            },
          ]);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        showError('Failed to load gym media');
        console.error('Error fetching gym media:', error);
      }
    };
    
    if (user) {
      fetchGymMedia();
    }
  }, [user]);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
    const files = e.target.files;
    if (!files || !gymId) return;

    setUploading(true);
    const toastId = showLoading(`Uploading ${type}s...`);

    try {
      // In a real application, you would upload the files to a server
      // and get back the URLs. For now, we'll just create a preview.
      const uploadedItems: MediaItem[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        // Create a promise to handle the file reading
        const fileReadPromise = new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
        
        const fileUrl = await fileReadPromise;
        
        // In a real app, we would call an API endpoint to upload the file
        // await gymService.uploadMedia(gymId, file, type);
        
        // For demo purposes, we'll create a new media item locally
        const newItem: MediaItem = {
          id: Date.now().toString() + i,
          type,
          url: fileUrl,
          title: file.name,
          description: '',
        };
        
        uploadedItems.push(newItem);
      }
      
      // Update the state with new items
      if (type === 'photo') {
        setPhotos(prev => [...prev, ...uploadedItems]);
      } else {
        setVideos(prev => [...prev, ...uploadedItems]);
      }
      
      setUploading(false);
      updateToast(toastId, `${uploadedItems.length} ${type}(s) uploaded successfully!`, 'success');
    } catch (error) {
      setUploading(false);
      updateToast(toastId, `Failed to upload ${type}s.`, 'error');
      console.error(`Error uploading ${type}s:`, error);
    }
  };

  const handleDelete = async (id: string, type: 'photo' | 'video') => {
    if (!gymId) return;
    
    const toastId = showLoading(`Deleting ${type}...`);
    
    try {
      // In a real app, we would call an API to delete the media
      // await gymService.deleteMedia(gymId, id, type);
      
      // Update local state
      if (type === 'photo') {
        setPhotos(prev => prev.filter(item => item.id !== id));
      } else {
        setVideos(prev => prev.filter(item => item.id !== id));
      }
      
      updateToast(toastId, `${type} deleted successfully!`, 'success');
    } catch (error) {
      updateToast(toastId, `Failed to delete ${type}.`, 'error');
      console.error(`Error deleting ${type}:`, error);
    }
  };

  const handleUpdateMedia = async (id: string, type: 'photo' | 'video', title: string, description: string) => {
    if (!gymId) return;
    
    const toastId = showLoading(`Updating ${type} information...`);
    
    try {
      // In a real app, we would call an API to update the media
      // await gymService.updateMedia(gymId, id, { title, description }, type);
      
      // Update local state
      if (type === 'photo') {
        setPhotos(prev => prev.map(item => 
          item.id === id ? { ...item, title, description } : item
        ));
      } else {
        setVideos(prev => prev.map(item => 
          item.id === id ? { ...item, title, description } : item
        ));
      }
      
      updateToast(toastId, `${type} information updated!`, 'success');
    } catch (error) {
      updateToast(toastId, `Failed to update ${type} information.`, 'error');
      console.error(`Error updating ${type}:`, error);
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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Media Management</h1>
      </div>

      {/* Photos Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Image className="w-5 h-5" />
            Photos
          </h2>
          <label className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 cursor-pointer disabled:opacity-50">
            {uploading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Photos
              </>
            )}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              disabled={uploading}
              onChange={(e) => handleFileUpload(e, 'photo')}
            />
          </label>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Image className="w-12 h-12 mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">No photos uploaded yet</p>
            <label className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Add Photos
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={(e) => handleFileUpload(e, 'photo')}
              />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(photo.id, 'photo')}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-2">
                  <h3 className="font-medium text-gray-900">{photo.title}</h3>
                  <p className="text-sm text-gray-500">{photo.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Videos Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Video className="w-5 h-5" />
            Videos
          </h2>
          <label className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 cursor-pointer disabled:opacity-50">
            {uploading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Videos
              </>
            )}
            <input
              type="file"
              className="hidden"
              accept="video/*"
              multiple
              disabled={uploading}
              onChange={(e) => handleFileUpload(e, 'video')}
            />
          </label>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Video className="w-12 h-12 mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">No videos uploaded yet</p>
            <label className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Add Videos
              <input
                type="file"
                className="hidden"
                accept="video/*"
                multiple
                onChange={(e) => handleFileUpload(e, 'video')}
              />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="relative group">
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                  {video.url.includes('youtube.com') ? (
                    <iframe
                      src={video.url}
                      title={video.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={video.url}
                      controls
                      className="w-full h-full"
                    />
                  )}
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(video.id, 'video')}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-2">
                  <h3 className="font-medium text-gray-900">{video.title}</h3>
                  <p className="text-sm text-gray-500">{video.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadMedia; 