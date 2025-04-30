import { useState } from 'react';
import { Image, Video, Upload, Trash2, Plus } from 'lucide-react';

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  title: string;
  description: string;
}

const UploadMedia = () => {
  const [photos, setPhotos] = useState<MediaItem[]>([
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

  const [videos, setVideos] = useState<MediaItem[]>([
    {
      id: '1',
      type: 'video',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      title: 'Gym Tour',
      description: 'Virtual tour of our facilities',
    },
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
    const files = e.target.files;
    if (!files) return;

    // In a real application, you would upload the files to a server
    // and get back the URLs. For now, we'll just create a preview.
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newItem: MediaItem = {
          id: Date.now().toString(),
          type,
          url: e.target?.result as string,
          title: file.name,
          description: '',
        };

        if (type === 'photo') {
          setPhotos((prev) => [...prev, newItem]);
        } else {
          setVideos((prev) => [...prev, newItem]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDelete = (id: string, type: 'photo' | 'video') => {
    if (type === 'photo') {
      setPhotos((prev) => prev.filter((item) => item.id !== id));
    } else {
      setVideos((prev) => prev.filter((item) => item.id !== id));
    }
  };

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
          <label className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Upload Photos
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={(e) => handleFileUpload(e, 'photo')}
            />
          </label>
        </div>

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
      </div>

      {/* Videos Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Video className="w-5 h-5" />
            Videos
          </h2>
          <label className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Upload Videos
            <input
              type="file"
              className="hidden"
              accept="video/*"
              multiple
              onChange={(e) => handleFileUpload(e, 'video')}
            />
          </label>
        </div>

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
      </div>
    </div>
  );
};

export default UploadMedia; 