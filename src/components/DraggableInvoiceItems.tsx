import React, { useState } from 'react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import type { InvoiceItem } from '../types';

interface DraggableInvoiceItemsProps {
  items: InvoiceItem[];
  onUpdateItems: (items: InvoiceItem[]) => void;
  onAddItem: () => void;
  onDeleteItem: (id: string) => void;
  onUpdateItem: (id: string, field: keyof InvoiceItem, value: string | number) => void;
}

export const DraggableInvoiceItems: React.FC<DraggableInvoiceItemsProps> = ({
  items,
  onUpdateItems,
  onAddItem,
  onDeleteItem,
  onUpdateItem,
}) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Create a custom drag image
    const dragElement = e.currentTarget as HTMLElement;
    const rect = dragElement.getBoundingClientRect();
    const dragImage = dragElement.cloneNode(true) as HTMLElement;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.width = `${rect.width}px`;
    dragImage.style.opacity = '0.8';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, rect.width / 2, 20);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedItem && draggedItem !== itemId) {
      setDragOverItem(itemId);
    }
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent, targetItemId: string) => {
    e.preventDefault();
    setDragOverItem(null);

    if (!draggedItem || draggedItem === targetItemId) return;

    const draggedIndex = items.findIndex(item => item.id === draggedItem);
    const targetIndex = items.findIndex(item => item.id === targetItemId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newItems = [...items];
    const [draggedItemObj] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItemObj);

    onUpdateItems(newItems);
  };

  const handleTouchStart = (e: React.TouchEvent, itemId: string) => {
    // For mobile touch devices
    const touch = e.touches[0];
    const element = e.currentTarget as HTMLElement;
    
    // Add visual feedback
    element.style.opacity = '0.5';
    element.style.transform = 'scale(0.95)';
    
    // Store touch position for move detection
    const touchData = {
      itemId,
      startX: touch.clientX,
      startY: touch.clientY,
      element,
    };
    
    (element as any).dataset.touchData = JSON.stringify(touchData);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const element = e.currentTarget as HTMLElement;
    const touchData = JSON.parse((element as any).dataset.touchData || '{}');
    
    if (!touchData.itemId) return;

    const deltaX = Math.abs(touch.clientX - touchData.startX);
    const deltaY = Math.abs(touch.clientY - touchData.startY);
    
    // Only start dragging if moved enough
    if (deltaX > 10 || deltaY > 10) {
      element.style.opacity = '0.8';
      element.style.transform = 'scale(1.05)';
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const element = e.currentTarget as HTMLElement;
    
    // Reset visual feedback
    element.style.opacity = '1';
    element.style.transform = 'scale(1)';
    element.removeAttribute('data-touch-data');
    
    // For mobile, you could implement a reorder modal or use a library like react-sortable-hoc
    // For now, we'll just provide visual feedback
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Invoice Items</h3>
        <button
          onClick={onAddItem}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, item.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, item.id)}
            onTouchStart={(e) => handleTouchStart(e, item.id)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`
              bg-white border rounded-lg transition-all duration-200
              ${draggedItem === item.id ? 'opacity-50 scale-95' : ''}
              ${dragOverItem === item.id ? 'border-blue-400 shadow-lg' : 'border-gray-200'}
              ${draggedItem && draggedItem !== item.id ? 'transform' : ''}
              hover:shadow-md cursor-move
            `}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Drag Handle */}
                <div className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 transition-colors">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Item Number */}
                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                  {index + 1}
                </div>

                {/* Item Content */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* Description */}
                  <div className="sm:col-span-6">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => onUpdateItem(item.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Item description"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => onUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Rate */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Rate
                    </label>
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => onUpdateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Total */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Total
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 font-medium">
                      ${(item.quantity * item.rate).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <div className="flex items-center">
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">No items added yet. Click "Add Item" to get started.</p>
          </div>
        )}
      </div>

      {/* Drag Instructions */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Drag and drop items to reorder them. Works on both desktop and mobile devices.
        </p>
      </div>
    </div>
  );
};
