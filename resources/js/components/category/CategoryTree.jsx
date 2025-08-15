import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../../api/services/categoryService';

export default function CategoryTree() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['public-categories'],
    queryFn: categoryService.getPublicCategories
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-2">
        {categories?.map(category => (
          <CategoryNode 
            key={category.id} 
            category={category} 
            depth={0} 
          />
        ))}
      </div>
    </DndProvider>
  );
}

function CategoryNode({ category, depth }) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <div className="group">
      <div className="flex items-center gap-2 py-1">
        <div style={{ paddingLeft: `${depth * 1.5}rem` }}>
          {category.children?.length > 0 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{category.name}</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              {category.events_count} events
            </span>
          </div>
        </div>
      </div>
      
      {isExpanded && category.children?.length > 0 && (
        <div className="ml-4 border-l border-gray-200 pl-4">
          {category.children.map(child => (
            <CategoryNode 
              key={child.id} 
              category={child} 
              depth={depth + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
}