'use client';

import React, { useState, useRef } from 'react';

interface Props {
  onVideoRecorded?: (blob: Blob) => void;
}

export const SimpleVideoTest: React.FC<Props> = ({ onVideoRecorded }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordedBlobs, setRecordedBlobs] = useState<Blob[]>([]);
  const [recordingStatus, setRecordingStatus] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const requestPermissions = async () => {
    try {
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: true
      });
      
      streamRef.current = stream;
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
    } catch (err) {
      console.error('Erreur permissions:', err);
      setError('Impossible d\'accéder à la caméra/microphone');
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setHasPermission(null);
      setIsRecording(false);
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    
    try {
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);
      
      const chunks: Blob[] = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        setRecordedBlobs(chunks);
        const videoBlob = new Blob(chunks, { type: 'video/webm' });
        setRecordingStatus(`Vidéo enregistrée ! Taille: ${(chunks.reduce((size, blob) => size + blob.size, 0) / 1024 / 1024).toFixed(2)} MB`);
        
        // Notifier le parent
        if (onVideoRecorded) {
          onVideoRecorded(videoBlob);
        }
      };
      
      mediaRecorderRef.current.start(1000); // Collecter des données toutes les secondes
      setIsRecording(true);
      setRecordingStatus('🎬 Enregistrement en cours...');
      
    } catch (err) {
      console.error('Erreur MediaRecorder:', err);
      setError('Enregistrement non supporté par ce navigateur');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const downloadVideo = () => {
    if (recordedBlobs.length === 0) return;
    
    const blob = new Blob(recordedBlobs, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dodo-lens-test-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">📹 Test Caméra & Microphone</h3>
        
        {/* Zone vidéo */}
        <div className="aspect-video bg-black rounded-lg mb-4 relative">
          <video
            ref={videoRef}
            className="w-full h-full object-cover rounded-lg"
            playsInline
            muted
          />
          
          {hasPermission === null && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <div className="text-4xl mb-2">📹</div>
                <div>Cliquez pour activer la caméra</div>
              </div>
            </div>
          )}
          
          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">REC</span>
            </div>
          )}
        </div>
        
        {/* Contrôles */}
        <div className="space-y-3">
          {hasPermission === null && (
            <button
              onClick={requestPermissions}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🎬 Demander les permissions
            </button>
          )}
          
          {hasPermission === true && (
            <div className="space-y-3">
              <div className="flex space-x-3">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex-1 px-6 py-3 rounded-lg transition-colors ${
                    isRecording 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isRecording ? '⏹️ Arrêter enregistrement' : '🎬 Démarrer enregistrement'}
                </button>
                
                <button
                  onClick={stopCamera}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  disabled={isRecording}
                >
                  📷 Arrêter caméra
                </button>
              </div>
              
              {recordedBlobs.length > 0 && (
                <button
                  onClick={downloadVideo}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📥 Télécharger la vidéo
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Statut */}
        {hasPermission === true && (
          <div className="mt-4 space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <div className="text-green-800 font-medium">✅ Caméra et microphone autorisés</div>
              <div className="text-green-700 text-sm">
                Vous pouvez maintenant enregistrer des vidéos !
              </div>
            </div>
            
            {recordingStatus && (
              <div className={`p-3 border rounded ${
                isRecording 
                  ? 'bg-red-50 border-red-200' 
                  : recordedBlobs.length > 0 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className={`font-medium ${
                  isRecording 
                    ? 'text-red-800' 
                    : recordedBlobs.length > 0 
                    ? 'text-blue-800' 
                    : 'text-gray-800'
                }`}>
                  {recordingStatus}
                </div>
              </div>
            )}
          </div>
        )}
        
        {hasPermission === false && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <div className="text-red-800 font-medium">❌ Permissions refusées</div>
            <div className="text-red-700 text-sm">
              Veuillez autoriser l'accès à la caméra et au microphone dans les paramètres de votre navigateur.
            </div>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <div className="text-red-800 font-medium">🔧 Erreur technique</div>
            <div className="text-red-700 text-sm">{error}</div>
          </div>
        )}
      </div>
    </div>
  );
};
