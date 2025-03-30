import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';

interface TagListProps {
  tags: string[];
}

export default function TagList({ tags }: TagListProps) {
  if (!tags || tags.length === 0) return null;
  
  return (
    <div className="flex items-center flex-wrap gap-2">
      <span className="text-xs text-muted-foreground flex items-center">
        <Tag className="h-3 w-3 mr-1" />
        Etiketler:
      </span>
      {tags.map((tag, index) => (
        <Badge 
          key={index} 
          variant="secondary" 
          className="bg-secondary/20 hover:bg-secondary/30 cursor-pointer transition-colors"
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
} 