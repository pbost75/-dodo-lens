'use client';

import { useState } from 'react';

export default function DebugWhisperSimplePage() {
  const [logs, setLogs] = useState<string[]>([]);

  const log = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const time = new Date().toLocaleTimeString();
    const logEntry = `[${time}] ${message}`;
    setLogs(prev => [...prev, logEntry]);
    console.log(logEntry);
  };

  const clearLog = () => setLogs([]);

  const testFullAudio = async () => {
    try {
      log('🎙️ === DÉBUT TEST AUDIO MOBILE ===', 'info');
      
      // Demander permission microphone
      log('📱 Demande permission microphone...', 'info');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      log('✅ Permission accordée - Démarrage enregistrement 3 secondes', 'success');
      log('🗣️ PARLEZ MAINTENANT ! Dites quelques mots clairement...', 'warning');
      
      // Configuration enregistrement
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = '';
        }
      }
      
      log(`🎵 Format utilisé: ${mimeType || 'défaut navigateur'}`, 'info');
      
      const audioChunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
          log(`📦 Chunk: ${event.data.size} bytes`, 'info');
        }
      };
      
      mediaRecorder.onstop = async () => {
        log('⏹️ Fin enregistrement - Création blob...', 'info');
        
        const audioBlob = new Blob(audioChunks, { 
          type: mimeType || 'audio/webm' 
        });
        
        log(`📱 Audio créé: ${audioBlob.size} bytes, type: ${audioBlob.type}`, 'info');
        
        // Analyser le contenu
        const arrayBuffer = await audioBlob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const header = Array.from(uint8Array.slice(0, 16))
          .map(b => b.toString(16).padStart(2, '0'))
          .join(' ');
        log(`🔍 Header: ${header}`, 'info');
        
        const nonZeroBytes = uint8Array.filter(b => b !== 0).length;
        const contentRatio = nonZeroBytes / uint8Array.length;
        log(`📊 Contenu: ${(contentRatio * 100).toFixed(1)}% non-nul`, 
            contentRatio > 0.1 ? 'success' : 'warning');
        
        // Test direct avec Railway backend
        await testWithRailwayBackend(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start(250);
      
      setTimeout(() => {
        log('⏹️ Arrêt enregistrement...', 'info');
        mediaRecorder.stop();
      }, 3000);
      
    } catch (error) {
      log(`❌ Erreur: ${error instanceof Error ? error.message : 'Unknown'}`, 'error');
    }
  };

  const testWithRailwayBackend = async (audioBlob: Blob) => {
    try {
      log('🚀 === TEST DIRECT RAILWAY BACKEND ===', 'info');
      log('📤 Envoi vers backend production...', 'info');
      
      const formData = new FormData();
      formData.append('audioFile', audioBlob, 'mobile-test.webm');
      
      const startTime = Date.now();
      
      const response = await fetch('https://web-production-7b738.up.railway.app/api/dodo-lens/analyze-audio', {
        method: 'POST',
        body: formData
      });
      
      const responseTime = Date.now() - startTime;
      
      log(`📊 Status: ${response.status} (${responseTime}ms)`, 
          response.ok ? 'success' : 'error');
      
      const result = await response.text();
      log(`📝 Réponse (${result.length} chars):`, 'info');
      
      if (response.ok) {
        try {
          const jsonResult = JSON.parse(result);
          if (jsonResult.success && jsonResult.transcript) {
            log(`🎉 SUCCESS ! Transcript: "${jsonResult.transcript}"`, 'success');
            log(`💰 Coût: ${jsonResult.usage?.cost}€`, 'info');
            log(`⏱️ Processing: ${jsonResult.usage?.processing_time_ms}ms`, 'info');
            log(`📁 Taille: ${jsonResult.usage?.file_size} bytes`, 'info');
          } else {
            log(`❌ Pas de transcript. Réponse: ${JSON.stringify(jsonResult)}`, 'error');
          }
        } catch (e) {
          log(`❌ Réponse non-JSON: ${result}`, 'error');
        }
      } else {
        log(`❌ Erreur Railway: ${result}`, 'error');
        
        // Essayer de parser l'erreur
        try {
          const errorJson = JSON.parse(result);
          if (errorJson.error) {
            log(`💡 Détail: ${errorJson.error}`, 'warning');
            if (errorJson.details) {
              log(`🔍 Plus: ${errorJson.details}`, 'warning');
            }
          }
        } catch (e) {
          // Pas JSON
        }
      }
      
    } catch (error) {
      log(`❌ Erreur réseau: ${error instanceof Error ? error.message : 'Unknown'}`, 'error');
    }
  };

  return (
    <div className="p-4 font-mono bg-gray-900 text-white min-h-screen">
      <h1 className="text-xl font-bold mb-4">🔍 Debug Whisper Mobile - Test Direct</h1>
      
      <div className="bg-gray-800 p-3 mb-4 rounded border-l-4 border-blue-500">
        <strong>Test simplifié:</strong> Enregistre audio mobile et test direct avec Railway backend
      </div>
      
      <div className="space-x-2 mb-4">
        <button 
          onClick={testFullAudio}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
        >
          🎙️ Test Audio → Railway Direct
        </button>
        <button 
          onClick={clearLog}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
        >
          🗑️ Clear Log
        </button>
      </div>
      
      <div className="bg-gray-800 p-3 rounded max-h-96 overflow-y-auto space-y-1">
        {logs.map((logEntry, index) => (
          <div key={index} className="text-sm">
            {logEntry}
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-gray-400 text-sm">
            Logs d&apos;activité s&apos;afficheront ici...
          </div>
        )}
      </div>
    </div>
  );
}
