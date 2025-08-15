import { useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function MediaGallery({ mediaItems, onUpdateOrder }) {
  const [items, setItems] = useState(mediaItems);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.media_id === active.id);
      const newIndex = items.findIndex(item => item.media_id === over.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      onUpdateOrder(newItems);
    }
  };

  return (
    <DndContext 
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={items.map(item => item.media_id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <SortableMediaItem 
              key={item.media_id} 
              item={item} 
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableMediaItem({ item }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.media_id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="border rounded-lg overflow-hidden cursor-move hover:shadow-md transition-shadow"
    >
      <div className="aspect-video bg-gray-100 flex items-center justify-center">
        {item.file_path.endsWith('.mp4') ? (
          <video src={item.file_path} className="w-full h-full object-cover" />
        ) : (
          <img 
            src={item.file_path} 
            alt={item.media_name} 
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-3 bg-white">
        <h3 className="font-medium truncate">{item.media_name}</h3>
        <p className="text-sm text-gray-500">Position: {item.order}</p>
      </div>
    </div>
  );
}