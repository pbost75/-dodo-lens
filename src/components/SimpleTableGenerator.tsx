'use client';

import React, { useState } from 'react';

interface DetectedItem {
  id: string;
  name: string;
  action: 'prendre' | 'laisser';
  volume: number;
  confidence: number;
}

interface Props {
  phrases: string[];
}

export const SimpleTableGenerator: React.FC<Props> = ({ phrases }) => {
  const [items, setItems] = useState<DetectedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Analyse simple des phrases pour extraire les objets
  const analyzePhrasesForObjects = (phrases: string[]): DetectedItem[] => {
    const detectedItems: DetectedItem[] = [];
    let itemId = 1;

    // Dictionnaire d'objets avec leurs volumes estimés (en m³)
    const objectVolumes: { [key: string]: number } = {
      'canapé': 1.5,
      'table': 0.8,
      'chaise': 0.2,
      'télé': 0.15,
      'téléviseur': 0.15,
      'tv': 0.15,
      'meuble': 0.5,
      'armoire': 2.0,
      'lit': 1.2,
      'frigo': 1.0,
      'réfrigérateur': 1.0,
      'four': 0.3,
      'micro-ondes': 0.05,
      'lampe': 0.02,
      'pot': 0.01,
      'plante': 0.03,
      'bureau': 0.8,
      'commode': 0.6,
      'étagère': 0.4,
      'bibliothèque': 1.0,
      'lave-linge': 0.8,
      'lave-vaisselle': 0.6,
      'aspirateur': 0.1,
      'table à repasser': 0.05,
      'fer à repasser': 0.01
    };

    phrases.forEach(phrase => {
      const lowerPhrase = phrase.toLowerCase();
      
      // Détecter l'action (prendre ou laisser)
      const isPrendre = /\b(prends?|prendre|emporte|récupère|veux|garde)\b/.test(lowerPhrase);
      const isLaisser = /\b(laisse|laisser|abandonne|ne.*pas|veux pas)\b/.test(lowerPhrase);
      
      // Chercher des objets dans la phrase
      Object.keys(objectVolumes).forEach(object => {
        const regex = new RegExp(`\\b${object}s?\\b`, 'gi');
        
        if (regex.test(lowerPhrase)) {
          // Déterminer l'action basée sur le contexte local autour du mot
          const objectIndex = lowerPhrase.indexOf(object);
          const contextBefore = lowerPhrase.substring(Math.max(0, objectIndex - 50), objectIndex);
          const contextAfter = lowerPhrase.substring(objectIndex, Math.min(lowerPhrase.length, objectIndex + 50));
          const context = contextBefore + ' ' + contextAfter;
          
          let action: 'prendre' | 'laisser' = 'prendre'; // Par défaut
          let confidence = 0.7;
          
          // Analyser le contexte proche de l'objet
          if (/\b(prends?|prendre|emporte|récupère|veux|garde)\b.*$/.test(contextBefore) ||
              /^\b.*(prends?|prendre|emporte|récupère|veux|garde)\b/.test(contextAfter)) {
            action = 'prendre';
            confidence = 0.9;
          } else if (/\b(laisse|laisser|abandonne|ne.*pas|veux pas)\b.*$/.test(contextBefore) ||
                     /^\b.*(laisse|laisser|abandonne|ne.*pas|veux pas)\b/.test(contextAfter)) {
            action = 'laisser';
            confidence = 0.9;
          } else if (isPrendre && !isLaisser) {
            action = 'prendre';
            confidence = 0.8;
          } else if (isLaisser && !isPrendre) {
            action = 'laisser';
            confidence = 0.8;
          }
          
          // Éviter les doublons
          const exists = detectedItems.find(item => 
            item.name.toLowerCase() === object && item.action === action
          );
          
          if (!exists) {
            detectedItems.push({
              id: `item-${itemId++}`,
              name: object.charAt(0).toUpperCase() + object.slice(1),
              action,
              volume: objectVolumes[object],
              confidence
            });
          }
        }
      });
    });

    return detectedItems;
  };

  const generateTable = async () => {
    setIsProcessing(true);
    
    // Simuler un délai de traitement IA
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const analyzedItems = analyzePhrasesForObjects(phrases);
    setItems(analyzedItems);
    setIsProcessing(false);
  };

  const clearTable = () => {
    setItems([]);
  };

  const toggleItemAction = (itemId: string) => {
    setItems(items.map(item => 
      item.id === itemId 
        ? { ...item, action: item.action === 'prendre' ? 'laisser' : 'prendre' }
        : item
    ));
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  // Calculer le volume des objets à prendre
  const volumeToPack = items
    .filter(item => item.action === 'prendre')
    .reduce((sum, item) => sum + item.volume, 0);

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">📋 Génération de tableau d'objets</h3>
      
      {/* Informations sur les phrases */}
      <div className="mb-6 p-4 bg-gray-50 border rounded-lg">
        <div className="text-sm text-gray-600 mb-2">
          📝 Phrases à analyser : <strong>{phrases.length}</strong>
        </div>
        {phrases.length > 0 && (
          <div className="text-xs text-gray-500 max-h-20 overflow-y-auto">
            {phrases.slice(-3).map((phrase, index) => (
              <div key={index}>• {phrase.substring(0, 100)}{phrase.length > 100 ? '...' : ''}</div>
            ))}
            {phrases.length > 3 && <div className="italic">... et {phrases.length - 3} autre(s)</div>}
          </div>
        )}
      </div>
      
      {/* Contrôles */}
      <div className="space-y-3">
        {phrases.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            Utilisez d'abord la reconnaissance vocale pour capturer des phrases
          </div>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={generateTable}
              disabled={isProcessing}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isProcessing ? '🤖 Analyse IA en cours...' : '🧠 Analyser et générer le tableau'}
            </button>
            
            {items.length > 0 && (
              <button
                onClick={clearTable}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                🗑️ Effacer
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Tableau des objets détectés */}
      {items.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium mb-4">
            🎯 Objets détectés ({items.length}) - Volume à déménager : <strong>{volumeToPack.toFixed(2)} m³</strong>
          </h4>
          
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleItemAction(item.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.action === 'prendre' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {item.action === 'prendre' ? '✅ À prendre' : '❌ À laisser'}
                  </button>
                  
                  <span className="font-medium">{item.name}</span>
                  
                  <span className="text-sm text-gray-600">
                    {item.volume} m³
                  </span>
                  
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.confidence > 0.8 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {Math.round(item.confidence * 100)}%
                  </span>
                </div>
                
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
          
          {/* Résumé */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {items.filter(item => item.action === 'prendre').length}
                </div>
                <div className="text-sm text-green-700">À prendre</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {items.filter(item => item.action === 'laisser').length}
                </div>
                <div className="text-sm text-gray-700">À laisser</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {volumeToPack.toFixed(1)} m³
                </div>
                <div className="text-sm text-blue-700">Volume total</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Instructions */}
      <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-yellow-800 font-medium mb-2">💡 Comment ça marche :</div>
        <div className="text-yellow-700 text-sm space-y-1">
          <div>• L'IA analyse vos phrases pour détecter les objets mentionnés</div>
          <div>• Elle détermine si vous voulez les prendre ou les laisser</div>
          <div>• Cliquez sur les badges pour changer l'action (prendre ↔ laisser)</div>
          <div>• Le volume est calculé automatiquement pour votre déménagement</div>
        </div>
      </div>
    </div>
  );
};
