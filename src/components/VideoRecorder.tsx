'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useVideoRecorder } from '@/hooks/useVideoRecorder';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { AIService } from '@/services/aiService';
import { DetectedItem, VideoSegment } from '@/types';
import { useAnalytics } from '@/services/analytics';

interface VideoRecorderProps {
  onItemsDetected: (items: DetectedItem[]) => void;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({ onItemsDetected }) => {
  const [items, setItems] = useState<DetectedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  
  const { trackEvent } = useAnalytics();
  const aiService = new AIService();
  
  const {
    isRecording,
    isPaused,
    videoRef,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    error: videoError
  } = useVideoRecorder();
  
  const {
    isListening,
    transcript,
    confidence,
    startListening,
    stopListening,
    results,
    error: speechError,
    isSupported: speechSupported
  } = useSpeechRecognition();

  // Démarrer la session
  const handleStartSession = async () => {
    trackEvent('session_started');
    setSessionStarted(true);
    
    // Démarrer l'enregistrement vidéo et la reconnaissance vocale
    await startRecording();
    startListening();
  };

  // Pause/Reprendre
  const handlePauseResume = () => {
    if (isPaused) {
      resumeRecording();
      startListening();
      trackEvent('recording_resumed');
    } else {
      pauseRecording();
      stopListening();
      trackEvent('recording_paused');
    }
  };

  // Arrêter et traiter
  const handleStop = async () => {
    setIsProcessing(true);
    trackEvent('recording_stopped');
    
    try {
      // Arrêter l'enregistrement
      const videoSegment = await stopRecording();
      stopListening();
      
      if (videoSegment) {
        await processVideoSegment(videoSegment);
      }
    } catch (error) {
      console.error('Erreur lors de l\'arrêt:', error);
    } finally {
      setIsProcessing(false);
      setSessionStarted(false);
    }
  };

  // Traiter le segment vidéo
  const processVideoSegment = async (videoSegment: VideoSegment) => {
    try {
      trackEvent('video_processing_started', { 
        duration: videoSegment.duration,
        transcriptLength: transcript.length 
      });
      
      // Extraire une frame de la vidéo
      const frameData = await aiService.extractVideoFrame(videoSegment.blob);
      
      // Analyser la vidéo et l'audio en parallèle
      const [videoItems, audioItems] = await Promise.all([
        aiService.analyzeVideoFrame(frameData),
        aiService.analyzeAudioTranscript(transcript)
      ]);
      
      // Combiner les résultats
      const analysisResult = await aiService.combineAnalysis(videoItems, audioItems);
      
      setItems(analysisResult.items);
      onItemsDetected(analysisResult.items);
      
      trackEvent('video_processing_completed', {
        itemsDetected: analysisResult.items.length,
        confidence: analysisResult.confidence,
        processingTime: analysisResult.processingTime
      });
      
    } catch (error) {
      console.error('Erreur traitement vidéo:', error);
      trackEvent('video_processing_error', { error: error instanceof Error ? error.message : String(error) });
    }
  };

  // État des permissions
  const [permissions, setPermissions] = useState({
    camera: false,
    microphone: false
  });

  useEffect(() => {
    // Vérifier les permissions au chargement
    const checkPermissions = async () => {
      try {
        const camera = await navigator.permissions.query({ name: 'camera' as PermissionName });
        const microphone = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        
        setPermissions({
          camera: camera.state === 'granted',
          microphone: microphone.state === 'granted'
        });
      } catch (error) {
        console.log('Permissions API non supportée');
      }
    };
    
    checkPermissions();
  }, []);

  if (!speechSupported) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-lg font-semibold text-red-600 mb-2">
          Reconnaissance vocale non supportée
        </h3>
        <p className="text-gray-600">
          Votre navigateur ne supporte pas la reconnaissance vocale. 
          Essayez avec Chrome ou Edge.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Interface vidéo */}
      <Card className="relative overflow-hidden">
        <div className="aspect-video bg-black relative">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          
          {/* Overlay d'état */}
          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">
                {isPaused ? 'EN PAUSE' : 'ENREGISTREMENT'}
              </span>
            </div>
          )}
          
          {/* Transcript en temps réel */}
          {isListening && transcript && (
            <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm text-white p-3 rounded">
              <div className="text-sm opacity-75 mb-1">Transcript en temps réel :</div>
              <div className="text-base">{transcript}</div>
              {confidence > 0 && (
                <div className="text-xs opacity-75 mt-1">
                  Confiance: {Math.round(confidence * 100)}%
                </div>
              )}
            </div>
          )}
          
          {/* Loader de traitement */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                <div className="text-lg font-semibold">Analyse IA en cours...</div>
                <div className="text-sm opacity-75">Traitement de votre vidéo</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Contrôles */}
        <div className="p-4 border-t bg-gray-50">
          {!sessionStarted ? (
            <Button 
              onClick={handleStartSession}
              variant="primary" 
              size="lg" 
              className="w-full"
            >
              🎬 Commencer l'enregistrement
            </Button>
          ) : (
            <div className="flex space-x-3">
              <Button
                onClick={handlePauseResume}
                variant="secondary"
                disabled={isProcessing}
              >
                {isPaused ? '▶️ Reprendre' : '⏸️ Pause'}
              </Button>
              
              <Button
                onClick={handleStop}
                variant="destructive"
                disabled={isProcessing}
                className="flex-1"
              >
                ⏹️ Arrêter et analyser
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Erreurs */}
      {(videoError || speechError) && (
        <Card className="p-4 border-red-200 bg-red-50">
          <h4 className="text-red-800 font-medium mb-2">Erreur détectée</h4>
          {videoError && <p className="text-red-700 text-sm">📹 {videoError}</p>}
          {speechError && <p className="text-red-700 text-sm">🎙️ {speechError}</p>}
        </Card>
      )}

      {/* Informations de session */}
      {sessionStarted && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${isRecording ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                Vidéo: {isRecording ? (isPaused ? 'En pause' : 'En cours') : 'Arrêtée'}
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${isListening ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                Audio: {isListening ? 'En écoute' : 'Arrêté'}
              </div>
            </div>
            
            {results.length > 0 && (
              <div className="text-blue-700">
                {results.length} phrase{results.length > 1 ? 's' : ''} détectée{results.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Conseils d'utilisation */}
      {!sessionStarted && (
        <Card className="p-4 bg-gray-50">
          <h4 className="font-medium mb-2">💡 Conseils pour une meilleure détection</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Filmez en tenant votre téléphone horizontalement</li>
            <li>• Parlez clairement en décrivant ce que vous voulez déménager</li>
            <li>• Dites "je prends ce canapé" ou "j'ignore cette table"</li>
            <li>• Assurez-vous d'avoir un bon éclairage</li>
            <li>• Vous pouvez mettre en pause et reprendre à tout moment</li>
          </ul>
        </Card>
      )}
    </div>
  );
};
