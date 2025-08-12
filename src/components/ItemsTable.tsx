'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DetectedItem } from '@/types';
import { useAnalytics } from '@/services/analytics';

interface ItemsTableProps {
  items: DetectedItem[];
  onItemsChange: (items: DetectedItem[]) => void;
}

export const ItemsTable: React.FC<ItemsTableProps> = ({ items, onItemsChange }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const { trackEvent } = useAnalytics();

  // Calculer le volume total
  const totalVolume = items.reduce((sum, item) => sum + (item.volume * item.quantity), 0);

  // Mettre à jour un item
  const updateItem = (id: string, updates: Partial<DetectedItem>) => {
    const updatedItems = items.map(item => 
      item.id === id 
        ? { ...item, ...updates, isEdited: true }
        : item
    );
    onItemsChange(updatedItems);
    trackEvent('item_edited', { itemId: id, field: Object.keys(updates)[0] });
  };

  // Supprimer un item
  const deleteItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    onItemsChange(updatedItems);
    trackEvent('item_deleted', { itemId: id });
  };

  // Ajouter un nouvel item
  const addItem = () => {
    const newItem: DetectedItem = {
      id: `manual-${Date.now()}`,
      name: 'Nouvel objet',
      category: 'divers',
      quantity: 1,
      volume: 0.1,
      confidence: 1.0,
      detectionMethod: 'manual',
      isEdited: false
    };
    
    onItemsChange([...items, newItem]);
    setEditingId(newItem.id);
    trackEvent('item_added_manually');
  };

  // Composant pour éditer un item
  const EditableItem: React.FC<{ item: DetectedItem }> = ({ item }) => {
    const isEditing = editingId === item.id;
    
    if (isEditing) {
      return (
        <div className="grid grid-cols-4 gap-2 p-3 bg-blue-50 border border-blue-200 rounded">
          <input
            type="text"
            value={item.name}
            onChange={(e) => updateItem(item.id, { name: e.target.value })}
            className="col-span-2 px-2 py-1 border rounded text-sm"
            placeholder="Nom de l'objet"
          />
          
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
            min="1"
            className="px-2 py-1 border rounded text-sm text-center"
          />
          
          <div className="flex items-center space-x-1">
            <input
              type="number"
              value={item.volume}
              onChange={(e) => updateItem(item.id, { volume: parseFloat(e.target.value) || 0.1 })}
              min="0.1"
              step="0.1"
              className="px-2 py-1 border rounded text-sm w-16"
            />
            <span className="text-xs text-gray-500">m³</span>
          </div>
          
          <div className="col-span-4 flex justify-end space-x-2 mt-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => setEditingId(null)}
            >
              ✅ Valider
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteItem(item.id)}
            >
              🗑️ Supprimer
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div 
        className="grid grid-cols-4 gap-2 p-3 hover:bg-gray-50 border rounded cursor-pointer transition-colors"
        onClick={() => setEditingId(item.id)}
      >
        <div className="col-span-2 flex items-center">
          <span className="font-medium">{item.name}</span>
          <div className="ml-2 flex items-center space-x-1">
            {/* Badge de méthode de détection */}
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
              item.detectionMethod === 'video' 
                ? 'bg-blue-100 text-blue-800' 
                : item.detectionMethod === 'audio'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {item.detectionMethod === 'video' ? '📹' : item.detectionMethod === 'audio' ? '🎙️' : '✏️'}
            </span>
            
            {/* Score de confiance */}
            {item.confidence < 1 && (
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                item.confidence > 0.8 
                  ? 'bg-green-100 text-green-800'
                  : item.confidence > 0.6
                  ? 'bg-yellow-100 text-yellow-800'  
                  : 'bg-red-100 text-red-800'
              }`}>
                {Math.round(item.confidence * 100)}%
              </span>
            )}
            
            {/* Indicateur d'édition */}
            {item.isEdited && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Modifié
              </span>
            )}
          </div>
        </div>
        
        <div className="text-center font-medium">
          {item.quantity}
        </div>
        
        <div className="text-right">
          <span className="font-medium">{(item.volume * item.quantity).toFixed(1)} m³</span>
          <div className="text-xs text-gray-500">
            ({item.volume}m³ × {item.quantity})
          </div>
        </div>
      </div>
    );
  };

  if (items.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="text-gray-400 mb-4">
          <div className="text-4xl mb-2">📋</div>
          <div className="text-lg">Aucun objet détecté</div>
          <div className="text-sm">Filmez votre intérieur pour commencer</div>
        </div>
        
        <Button onClick={addItem} variant="outline">
          ➕ Ajouter un objet manuellement
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête du tableau */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            📋 Objets détectés ({items.length})
          </h3>
          <Button 
            onClick={addItem}
            variant="outline"
            size="sm"
          >
            ➕ Ajouter
          </Button>
        </div>
        
        {/* Headers */}
        <div className="grid grid-cols-4 gap-2 pb-2 border-b text-sm font-medium text-gray-600">
          <div className="col-span-2">Objet</div>
          <div className="text-center">Quantité</div>
          <div className="text-right">Volume</div>
        </div>
      </Card>

      {/* Liste des items */}
      <div className="space-y-2">
        {items.map(item => (
          <Card key={item.id}>
            <EditableItem item={item} />
          </Card>
        ))}
      </div>

      {/* Résumé total */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-blue-900">
              📊 Volume total estimé
            </div>
            <div className="text-sm text-blue-700">
              {items.length} objet{items.length > 1 ? 's' : ''} • 
              Confiance moyenne: {items.length > 0 ? Math.round((items.reduce((sum, item) => sum + item.confidence, 0) / items.length) * 100) : 0}%
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-900">
              {totalVolume.toFixed(1)} m³
            </div>
            <div className="text-sm text-blue-700">
              {totalVolume < 5 ? 'Petit déménagement' : totalVolume < 15 ? 'Déménagement moyen' : 'Gros déménagement'}
            </div>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-4 bg-gray-50">
        <div className="text-sm text-gray-600">
          <div className="font-medium mb-2">💡 Instructions :</div>
          <ul className="space-y-1">
            <li>• Cliquez sur un objet pour l'éditer</li>
            <li>• Modifiez le nom, la quantité ou le volume</li>
            <li>• Utilisez le bouton "➕ Ajouter" pour ajouter des objets oubliés</li>
            <li>• Les badges indiquent comment l'objet a été détecté</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};
