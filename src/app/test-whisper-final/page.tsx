'use client';

import { useState, useRef } from 'react';

export default function TestWhisperFinal() {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('🔄 Prêt pour test - Parlez après avoir cliqué sur "Démarrer"');
  const [result, setResult] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logEntry]);
    console.log(logEntry);
  };

  const updateStatus = (message: string) => {
    setStatus(message);
  };

  const startRecording = async () => {
    addLog('🎙️ Demande accès microphone...');
    updateStatus('🎙️ Accès microphone...');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      addLog('✅ Microphone accessible');
      updateStatus('🔴 Enregistrement en cours...');
      
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          addLog(`📦 Chunk reçu: ${event.data.size} bytes`);
        }
      };
      
      mediaRecorder.onstop = () => {
        addLog('⏹️ Enregistrement arrêté');
        sendAudioToRailway();
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      
    } catch (error: any) {
      addLog(`❌ Erreur microphone: ${error.message}`);
      updateStatus('❌ Erreur accès microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      setIsRecording(false);
      updateStatus('📤 Envoi vers Railway...');
    }
  };

  const sendAudioToRailway = async () => {
    addLog('📤 Préparation envoi vers Railway...');
    
    try {
      // Créer blob audio
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      addLog(`📊 Audio créé: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
      
      // Préparer FormData
      const formData = new FormData();
      formData.append('audioFile', audioBlob, 'mobile-test.webm');
      
      addLog('🚀 Envoi vers Railway backend...');
      
      // Envoi direct vers Railway
      const response = await fetch('https://web-production-7b738.up.railway.app/api/dodo-lens/analyze-audio', {
        method: 'POST',
        body: formData
      });
      
      addLog(`📡 Réponse Railway: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const result = await response.json();
        addLog('✅ Succès Railway!');
        
        setResult(
          `🎉 TRANSCRIPTION RÉUSSIE!\n\n` +
          `📝 Texte: "${result.transcript}"\n\n` +
          `📊 Stats:\n` +
          `- Taille fichier: ${result.usage.file_size} bytes\n` +
          `- Temps: ${result.usage.processing_time_ms}ms\n` +
          `- Coût: €${result.usage.cost}\n` +
          `- Longueur: ${result.usage.transcript_length} caractères`
        );
        
        updateStatus('🎉 Transcription réussie!');
      } else {
        const errorText = await response.text();
        addLog(`❌ Erreur Railway: ${errorText}`);
        updateStatus('❌ Erreur Railway');
        
        setResult(`❌ Erreur:\n${errorText}`);
      }
      
    } catch (error: any) {
      addLog(`❌ Erreur envoi: ${error.message}`);
      updateStatus('❌ Erreur envoi');
      
      setResult(`❌ Erreur: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-green-400 text-center mb-8">
            🎯 Test Whisper Railway Direct
          </h1>
          
          <div className={`p-4 rounded-lg mb-6 font-semibold ${
            status.includes('✅') || status.includes('🎉') ? 'bg-green-600' :
            status.includes('❌') ? 'bg-red-600' :
            status.includes('🔴') ? 'bg-red-600' :
            status.includes('📤') ? 'bg-yellow-600' :
            'bg-blue-600'
          }`}>
            {status}
          </div>
          
          <div className="space-y-4 mb-6">
            <button
              onClick={startRecording}
              disabled={isRecording}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors"
            >
              🎙️ Démarrer Enregistrement
            </button>
            
            <button
              onClick={stopRecording}
              disabled={!isRecording}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors"
            >
              ⏹️ Arrêter et Envoyer
            </button>
          </div>
          
          {result && (
            <div className="bg-gray-700 p-4 rounded-lg mb-6">
              <pre className="whitespace-pre-wrap font-mono text-sm">{result}</pre>
            </div>
          )}
          
          <div className="bg-black p-4 rounded-lg max-h-80 overflow-y-auto">
            <h3 className="text-green-400 font-semibold mb-2">📋 Logs:</h3>
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono text-gray-300 mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
