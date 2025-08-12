'use client';

import { useState, useRef, useCallback } from 'react';
import { VideoSegment } from '@/types';

interface UseVideoRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  startRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => Promise<VideoSegment | null>;
  error: string | null;
}

export const useVideoRecorder = (): UseVideoRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      // Demander les permissions caméra et micro
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Caméra arrière par défaut
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });

      streamRef.current = stream;
      
      // Afficher le stream dans la vidéo
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Configurer MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(1000); // Collecter des données toutes les secondes
      setIsRecording(true);
      setIsPaused(false);
      
    } catch (err) {
      console.error('Erreur démarrage enregistrement:', err);
      setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  }, []);

  const stopRecording = useCallback((): Promise<VideoSegment | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const duration = Date.now() - startTimeRef.current;
        
        const videoSegment: VideoSegment = {
          id: `video-${Date.now()}`,
          blob,
          duration,
          timestamp: new Date(),
          items: []
        };

        // Nettoyer les ressources
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }

        setIsRecording(false);
        setIsPaused(false);
        chunksRef.current = [];
        
        resolve(videoSegment);
      };

      mediaRecorderRef.current.stop();
    });
  }, []);

  return {
    isRecording,
    isPaused,
    videoRef,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    error
  };
};
