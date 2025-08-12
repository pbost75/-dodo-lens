'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Props {
  onPhrasesChange?: (phrases: string[]) => void;
}

export const SimpleSpeechTest: React.FC<Props> = ({ onPhrasesChange }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalResults, setFinalResults] = useState<string[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Vérifier le support du navigateur
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';
      recognition.maxAlternatives = 1;
      
      recognition.onstart = () => {
        console.log('🎙️ Reconnaissance vocale démarrée');
        setIsListening(true);
        setError(null);
      };
      
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript;
          
          if (result.isFinal) {
            finalTranscript += text;
          } else {
            interimTranscript += text;
          }
        }
        
        // Mettre à jour le transcript en temps réel
        setTranscript(finalTranscript + interimTranscript);
        
        // Ajouter les résultats finaux à la liste
        if (finalTranscript) {
          const newResults = [...finalResults, finalTranscript.trim()];
          setFinalResults(newResults);
          // Notifier le parent
          if (onPhrasesChange) {
            onPhrasesChange(newResults);
          }
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Erreur reconnaissance vocale:', event.error);
        setError(`Erreur: ${event.error}`);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        console.log('🎙️ Reconnaissance vocale arrêtée');
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setError('Reconnaissance vocale non supportée par ce navigateur');
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setError(null);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const clearResults = () => {
    setFinalResults([]);
    setTranscript('');
    // Notifier le parent
    if (onPhrasesChange) {
      onPhrasesChange([]);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">🎙️ Test Reconnaissance Vocale</h3>
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <div className="text-red-800 font-medium">❌ Non supporté</div>
          <div className="text-red-700 text-sm">
            Votre navigateur ne supporte pas la reconnaissance vocale. 
            Essayez avec Chrome ou Edge.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">🎙️ Test Reconnaissance Vocale</h3>
      
      {/* Zone de transcript en temps réel */}
      <div className="mb-6">
        <div className="bg-gray-50 border rounded-lg p-4 min-h-[100px]">
          <div className="text-sm text-gray-600 mb-2">
            {isListening ? '🎙️ En écoute...' : '⏸️ Arrêté'}
          </div>
          
          {transcript && (
            <div className="text-base">
              <strong>Transcript en cours :</strong><br />
              <span className="text-blue-600">{transcript}</span>
            </div>
          )}
          
          {!transcript && !isListening && (
            <div className="text-gray-400 italic">
              Cliquez sur "Démarrer" et parlez...
            </div>
          )}
        </div>
      </div>
      
      {/* Contrôles */}
      <div className="space-y-3">
        <div className="flex space-x-3">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`flex-1 px-6 py-3 rounded-lg transition-colors ${
              isListening 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isListening ? '⏹️ Arrêter écoute' : '🎙️ Démarrer écoute'}
          </button>
          
          {finalResults.length > 0 && (
            <button
              onClick={clearResults}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              🗑️ Effacer
            </button>
          )}
        </div>
      </div>
      
      {/* Résultats finaux */}
      {finalResults.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium mb-3">📝 Phrases détectées ({finalResults.length}) :</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {finalResults.map((result, index) => (
              <div key={index} className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                <span className="text-blue-600 font-mono">#{index + 1}</span>{' '}
                <span className="text-blue-800">{result}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Messages d'état */}
      {isListening && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <div className="text-green-800 font-medium">✅ Reconnaissance active</div>
          <div className="text-green-700 text-sm">
            Parlez clairement. Dites par exemple : "Je prends ce canapé, cette table je la laisse"
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <div className="text-red-800 font-medium">🔧 Erreur</div>
          <div className="text-red-700 text-sm">{error}</div>
        </div>
      )}
    </div>
  );
};
