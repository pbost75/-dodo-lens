'use client';

import React, { useState, useRef } from 'react';

export const AudioTest: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
    console.log(`🎙️ AUDIO TEST: ${message}`);
  };

  const startAudioTest = async () => {
    try {
      setError(null);
      setLogs([]);
      setAudioBlob(null);
      chunksRef.current = [];

      addLog('🎙️ Demande permission audio...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100,
          channelCount: 1
        }
      });

      addLog(`✅ Permission accordée. Tracks audio: ${stream.getAudioTracks().length}`);
      
      if (stream.getAudioTracks().length === 0) {
        throw new Error('Aucun track audio trouvé');
      }

      const audioTrack = stream.getAudioTracks()[0];
      addLog(`🎚️ Audio track: ${audioTrack.label}, état: ${audioTrack.readyState}`);
      addLog(`🔧 Settings: ${JSON.stringify(audioTrack.getSettings())}`);

      // Test des formats supportés
      const formats = ['audio/webm;codecs=opus', 'audio/webm', 'audio/wav', 'audio/mp4'];
      let selectedFormat = '';
      
      for (const format of formats) {
        if (MediaRecorder.isTypeSupported(format)) {
          selectedFormat = format;
          addLog(`✅ Format sélectionné: ${format}`);
          break;
        } else {
          addLog(`❌ Format non supporté: ${format}`);
        }
      }

      if (!selectedFormat) {
        selectedFormat = ''; // Auto-détection
        addLog('⚠️ Aucun format spécifique supporté, auto-détection');
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedFormat || undefined
      });

      addLog(`📹 MediaRecorder créé. État: ${mediaRecorder.state}`);
      addLog(`🎬 MIME type utilisé: ${mediaRecorder.mimeType}`);

      mediaRecorder.ondataavailable = (event) => {
        addLog(`📦 Data available: ${event.data.size} bytes`);
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        addLog(`⏹️ Enregistrement arrêté. Chunks: ${chunksRef.current.length}`);
        
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: selectedFormat || 'audio/webm' });
          addLog(`💾 Blob créé: ${blob.size} bytes, type: ${blob.type}`);
          setAudioBlob(blob);
        } else {
          addLog('❌ Aucun chunk audio collecté !');
          setError('Aucun chunk audio collecté');
        }

        // Nettoyer le stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        addLog(`❌ Erreur MediaRecorder: ${event}`);
        setError(`Erreur MediaRecorder: ${event}`);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collecter toutes les secondes
      setIsRecording(true);
      
      addLog('🎬 Enregistrement démarré !');

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      addLog(`❌ Erreur: ${errorMsg}`);
      setError(errorMsg);
    }
  };

  const stopAudioTest = () => {
    if (mediaRecorderRef.current && isRecording) {
      addLog('⏹️ Arrêt de l\'enregistrement...');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audioBlob) {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.play().catch(err => {
        addLog(`❌ Erreur lecture: ${err.message}`);
      });
      addLog('🔊 Lecture audio...');
    }
  };

  const downloadAudio = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audio-test-${Date.now()}.webm`;
      a.click();
      addLog('📥 Téléchargement démarré');
    }
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="text-lg font-semibold mb-4">🎙️ Test Audio Isolé</h3>
      
      <div className="space-y-4">
        {/* Contrôles */}
        <div className="flex space-x-2">
          {!isRecording ? (
            <button
              onClick={startAudioTest}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              🎙️ Démarrer test audio
            </button>
          ) : (
            <button
              onClick={stopAudioTest}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              ⏹️ Arrêter
            </button>
          )}
          
          {audioBlob && (
            <>
              <button
                onClick={playAudio}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                🔊 Écouter
              </button>
              <button
                onClick={downloadAudio}
                className="bg-purple-600 text-white px-4 py-2 rounded"
              >
                📥 Télécharger
              </button>
            </>
          )}
        </div>

        {/* Status */}
        {isRecording && (
          <div className="bg-green-50 border border-green-200 p-3 rounded">
            <div className="text-green-800 font-medium">🎙️ Enregistrement en cours...</div>
            <div className="text-green-600 text-sm">Parlez dans le microphone !</div>
          </div>
        )}

        {/* Résultat */}
        {audioBlob && (
          <div className="bg-blue-50 border border-blue-200 p-3 rounded">
            <div className="text-blue-800 font-medium">✅ Audio enregistré !</div>
            <div className="text-blue-600 text-sm">
              Taille: {audioBlob.size} bytes | Type: {audioBlob.type}
            </div>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-3 rounded">
            <div className="text-red-800 font-medium">❌ Erreur</div>
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <div>
            <div className="font-medium text-sm mb-2">📋 Logs détaillés :</div>
            <div className="bg-gray-900 text-green-400 text-xs p-3 rounded max-h-40 overflow-y-auto font-mono">
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
