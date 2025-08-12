'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { SpeechResult } from '@/types';

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  confidence: number;
  startListening: () => void;
  stopListening: () => void;
  results: SpeechResult[];
  error: string | null;
  isSupported: boolean;
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [results, setResults] = useState<SpeechResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  // Vérifier le support du navigateur
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    
    if (SpeechRecognition) {
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
          const transcript = result[0].transcript;
          
          if (result.isFinal) {
            finalTranscript += transcript;
            
            // Ajouter le résultat final
            const speechResult: SpeechResult = {
              transcript: transcript.trim(),
              confidence: result[0].confidence || 0,
              timestamp: Date.now(),
              isFinal: true
            };
            
            setResults(prev => [...prev, speechResult]);
            
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Mettre à jour le transcript actuel
        setTranscript(finalTranscript + interimTranscript);
        
        // Mettre à jour la confiance avec le dernier résultat
        if (event.results.length > 0) {
          const lastResult = event.results[event.results.length - 1];
          setConfidence(lastResult[0].confidence || 0);
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
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Reconnaissance vocale non supportée par ce navigateur');
      return;
    }
    
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setError(null);
      setResults([]);
      recognitionRef.current.start();
    }
  }, [isSupported, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  return {
    isListening,
    transcript,
    confidence,
    startListening,
    stopListening,
    results,
    error,
    isSupported
  };
};
