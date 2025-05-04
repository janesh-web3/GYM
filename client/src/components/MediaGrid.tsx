import React, { useState } from 'react';
import { Eye, Edit2, Trash2, Video, Image } from 'lucide-react';
import { MediaItem } from '../lib/services/mediaService';

interface MediaGridProps {
  items: MediaItem[];
  onEdit?: (item: MediaItem) => void;
  onDelete?: (item: MediaItem) => void;
  onView?: (item: MediaItem) => void;
  emptyMessage?: string;
  containerClassName?: string;
  gridClassName?: string;
  itemClassName?: string;
  maxHeight?: string;
}

const MediaGrid: React.FC<MediaGridProps> = ({
  items,
  onEdit,
  onDelete,
  onView,
  emptyMessage = 'No media available',
  containerClassName = '',
  gridClassName = '',
  itemClassName = '',
  maxHeight = '600px'
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  if (!items || items.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-gray-50 border border-dashed border-gray-300 rounded-md ${containerClassName}`}>
        {items.length === 0 ? (
          <>
            {items[0]?.type === 'video' ? <Video className="w-12 h-12 text-gray-400 mb-2" /> : <Image className="w-12 h-12 text-gray-400 mb-2" />}
            <p className="text-gray-500">{emptyMessage}</p>
          </>
        ) : (
          <p className="text-gray-500">{emptyMessage}</p>
        )}
      </div>
    );
  }

  return (
    <div className={`overflow-auto ${maxHeight ? `max-h-[${maxHeight}]` : ''} ${containerClassName}`}>
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ${gridClassName}`}>
        {items.map((item) => (
          <div
            key={item._id || item.url}
            className={`relative group rounded-lg overflow-hidden border border-gray-200 ${itemClassName}`}
            onMouseEnter={() => setHoveredItem(item._id || item.url)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {/* Render different media types */}
            {item.type === 'photo' ? (
              <div className="aspect-square">
                <img
                  src={item.url}
                  alt={item.caption || 'Media'}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : item.type === 'video' ? (
              <div className="aspect-video bg-black">
                <video 
                  src={item.url} 
                  className="w-full h-full object-contain"
                  controls={hoveredItem === (item._id || item.url)}
                  muted
                  playsInline
                >
                  Your browser does not support video playback.
                </video>
              </div>
            ) : (
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">Unsupported media</span>
              </div>
            )}

            {/* Caption */}
            {item.caption && (
              <div className="p-2 text-sm truncate text-gray-700 border-t border-gray-200 bg-white">
                {item.caption}
              </div>
            )}

            {/* Hover overlay with actions */}
            <div
              className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-2 transition-opacity ${
                hoveredItem === (item._id || item.url) ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {onView && (
                <button
                  type="button"
                  onClick={() => onView(item)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  title="View"
                >
                  <Eye className="w-4 h-4 text-gray-700" />
                </button>
              )}
              
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4 text-gray-700" />
                </button>
              )}
              
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(item)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaGrid; 