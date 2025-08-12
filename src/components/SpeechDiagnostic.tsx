'use client';

import React, { useState, useRef } from 'react';
import { mobileLog } from './MobileDebugPanel';

const SpeechDiagnostic: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);

  const addEvent = (event: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const eventLog = `${timestamp}: ${event}`;
    setEvents(prev => [...prev, eventLog]);
    mobileLog.info('🧪 ' + eventLog);
    console.log('🧪 DIAGNOSTIC:', eventLog);
  };

  const startTest = () => {
    addEvent('DÉBUT TEST DIAGNOSTIC');
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      addEvent('❌ Speech Recognition non disponible');
      return;
    }

    addEvent('✅ Speech Recognition disponible');
    
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    // Configuration minimale
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'fr-FR';
    recognition.maxAlternatives = 1;
    
    addEvent('⚙️ Configuration appliquée');

    // TOUS LES ÉVÉNEMENTS
    recognition.onstart = () => {
      addEvent('🟢 onstart - Reconnaissance DÉMARRÉE');
      setIsActive(true);
    };

    recognition.onend = () => {
      addEvent('🔴 onend - Reconnaissance TERMINÉE');
      setIsActive(false);
    };

    recognition.onerror = (event: any) => {
      addEvent(`❌ onerror - Erreur: ${event.error}`);
    };

    recognition.onspeechstart = () => {
      addEvent('🎤 onspeechstart - Parole détectée');
    };

    recognition.onspeechend = () => {
      addEvent('🔇 onspeechend - Fin de parole');
    };

    recognition.onsoundstart = () => {
      addEvent('🔊 onsoundstart - Son détecté');
    };

    recognition.onsoundend = () => {
      addEvent('🔇 onsoundend - Fin de son');
    };

    recognition.onaudiostart = () => {
      addEvent('🎧 onaudiostart - Audio capturé');
    };

    recognition.onaudioend = () => {
      addEvent('🎧 onaudioend - Fin audio');
    };

    recognition.onresult = (event: any) => {
      addEvent(`🎯 onresult - ${event.results.length} résultat(s)`);
      
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;
        const isFinal = result.isFinal;
        
        addEvent(`📝 Résultat ${i}: "${transcript}" (confiance: ${confidence?.toFixed(2) || 'N/A'}, final: ${isFinal})`);
      }
    };

    recognition.onnomatch = () => {
      addEvent('❓ onnomatch - Aucune correspondance trouvée');
    };

    // Démarrer
    try {
      addEvent('🚀 Tentative de démarrage...');
      recognition.start();
    } catch (err) {
      addEvent(`❌ Erreur démarrage: ${err}`);
    }
  };

  const stopTest = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      addEvent('⏹️ Arrêt manuel');
    }
  };

  const clearEvents = () => {
    setEvents([]);
    addEvent('🗑️ Logs effacés');
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="font-bold text-lg mb-3">🧪 Diagnostic Speech Recognition</h3>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={startTest}
          disabled={isActive}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isActive ? '🔴 En cours...' : '🟢 Démarrer Test'}
        </button>
        
        <button
          onClick={stopTest}
          disabled={!isActive}
          className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          ⏹️ Arrêter
        </button>
        
        <button
          onClick={clearEvents}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          🗑️ Clear
        </button>
      </div>

      <div className="bg-white border rounded p-3 h-64 overflow-y-auto">
        <div className="text-sm font-mono">
          {events.length === 0 ? (
            <div className="text-gray-500">Aucun événement pour le moment...</div>
          ) : (
            events.map((event, index) => (
              <div key={index} className="mb-1">
                {event}
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-600">
        <strong>Instructions:</strong> Cliquez "Démarrer Test", accordez les permissions, puis <strong>dites clairement "test" et attendez 3 secondes</strong>
      </div>
    </div>
  );
};

export default SpeechDiagnostic;
