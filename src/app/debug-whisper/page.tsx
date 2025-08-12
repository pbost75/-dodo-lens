'use client';

import { useState } from 'react';

export default function DebugWhisperPage() {
  const [logs, setLogs] = useState<string[]>([]);

  const log = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const time = new Date().toLocaleTimeString();
    const logEntry = `[${time}] ${message}`;
    setLogs(prev => [...prev, logEntry]);
    console.log(logEntry);
  };

  const clearLog = () => setLogs([]);

  const testBackendConnectivity = async () => {
    try {
      log('📡 Test connectivité backend...', 'info');
      
      const response = await fetch('https://273121d609ea.ngrok-free.app/debug-audio', {
        method: 'OPTIONS'
      });
      
      log(`✅ Backend accessible: ${response.status}`, 'success');
      
    } catch (error) {
      log(`❌ Erreur connectivité: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const startFullTest = async () => {
    try {
      log('🎙️ === DÉBUT TEST COMPLET ===', 'info');
      
      // Test permissions et capabilities
      await testMediaCapabilities();
      
      // Enregistrement audio
      await recordAudioSample();
      
    } catch (error) {
      log(`❌ Erreur test complet: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const testMediaCapabilities = async () => {
    log('🔍 Test capabilities navigateur...', 'info');
    
    // Détection navigateur
    const userAgent = navigator.userAgent;
    log(`📱 UserAgent: ${userAgent}`, 'info');
    
    // Support MediaRecorder
    if (!window.MediaRecorder) {
      log('❌ MediaRecorder non supporté !', 'error');
      return;
    }
    log('✅ MediaRecorder supporté', 'success');
    
    // Formats supportés
    const formats = [
      'audio/webm',
      'audio/webm;codecs=opus', 
      'audio/mp4',
      'audio/mpeg',
      'audio/wav'
    ];
    
    formats.forEach(format => {
      const supported = MediaRecorder.isTypeSupported(format);
      log(`${supported ? '✅' : '❌'} Format ${format}: ${supported}`, 
          supported ? 'success' : 'warning');
    });
  };

  const recordAudioSample = async () => {
    try {
      log('🎙️ Demande permission microphone...', 'info');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      log('✅ Permission accordée', 'success');
      
      // Détecter le meilleur format supporté
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = '';
          }
        }
      }
      
      log(`🎵 Format sélectionné: ${mimeType || 'défaut navigateur'}`, 'info');
      
      const audioChunks: Blob[] = [];
      const recordingStartTime = Date.now();
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
          log(`📦 Chunk reçu: ${event.data.size} bytes`, 'info');
        }
      };
      
      mediaRecorder.onstop = async () => {
        const recordingDuration = Date.now() - recordingStartTime;
        log(`⏹️ Enregistrement terminé en ${recordingDuration}ms`, 'info');
        
        const audioBlob = new Blob(audioChunks, { 
          type: mimeType || 'audio/webm' 
        });
        
        log(`📱 Blob créé:`, 'info');
        log(`   - Taille: ${audioBlob.size} bytes`, 'info');
        log(`   - Type: ${audioBlob.type}`, 'info');
        log(`   - Durée est.: ${recordingDuration}ms`, 'info');
        
        // Analyse détaillée du blob
        await analyzeAudioBlob(audioBlob);
        
        // Test envoi au backend
        await testWhisperWithRealAudio(audioBlob);
        
        // Arrêter le stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      log('📹 Démarrage enregistrement 5 secondes...', 'warning');
      log('🗣️ PARLEZ MAINTENANT ! Dites quelque chose clairement...', 'warning');
      
      mediaRecorder.start(250);
      
      // Arrêter après 5 secondes
      setTimeout(() => {
        log('⏹️ Arrêt enregistrement...', 'info');
        mediaRecorder.stop();
      }, 5000);
      
    } catch (error) {
      log(`❌ Erreur enregistrement: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const analyzeAudioBlob = async (blob: Blob) => {
    try {
      log('🔬 Analyse détaillée du blob audio...', 'info');
      
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      log(`📊 Analyse binaire:`, 'info');
      log(`   - Taille totale: ${uint8Array.length} bytes`, 'info');
      
      // Examiner les premiers bytes
      const header = Array.from(uint8Array.slice(0, 16))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(' ');
      log(`   - Header (16 bytes): ${header}`, 'info');
      
      // Détection format
      if (uint8Array[0] === 0x1A && uint8Array[1] === 0x45) {
        log(`   - Format détecté: WebM/Matroska`, 'success');
      } else if (uint8Array[0] === 0x52 && uint8Array[1] === 0x49) {
        log(`   - Format détecté: WAV/RIFF`, 'success');
      } else if (uint8Array[0] === 0x66 && uint8Array[1] === 0x74) {
        log(`   - Format détecté: MP4`, 'success');
      } else {
        log(`   - Format non identifié`, 'warning');
      }
      
      // Vérifier contenu
      const nonZeroBytes = uint8Array.filter(b => b !== 0).length;
      const contentRatio = nonZeroBytes / uint8Array.length;
      log(`   - Ratio contenu non-nul: ${(contentRatio * 100).toFixed(1)}%`, 
          contentRatio > 0.1 ? 'success' : 'warning');
      
      if (contentRatio < 0.1) {
        log(`⚠️ ATTENTION: Audio semble vide ou très silencieux !`, 'warning');
      }
      
    } catch (error) {
      log(`❌ Erreur analyse blob: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const testWhisperWithRealAudio = async (audioBlob: Blob) => {
    try {
      log('🔗 === TEST DEBUG BACKEND LOCAL ===', 'info');
      log('📤 Envoi au serveur debug local...', 'info');
      
      const formData = new FormData();
      formData.append('audioFile', audioBlob, 'mobile-audio.webm');
      
      const startTime = Date.now();
      
      const response = await fetch('https://273121d609ea.ngrok-free.app/debug-audio', {
        method: 'POST',
        body: formData
      });
      
      const responseTime = Date.now() - startTime;
      
      log(`📊 Status: ${response.status} (${responseTime}ms)`, 
          response.ok ? 'success' : 'error');
      
      const result = await response.text();
      log(`📝 Réponse brute (${result.length} chars):`, 'info');
      
      if (response.ok) {
        try {
          const jsonResult = JSON.parse(result);
          log(`🎉 SUCCESS ! Analyse reçue`, 'success');
          log(`📊 Détails: ${JSON.stringify(jsonResult.analysis, null, 2)}`, 'info');
          
          if (jsonResult.analysis?.recommendations?.length > 0) {
            log(`⚠️ Recommandations:`, 'warning');
            jsonResult.analysis.recommendations.forEach((rec: string) => {
              log(`   - ${rec}`, 'warning');
            });
          }
        } catch (e) {
          log('❌ Réponse non-JSON valide', 'error');
          log(`Contenu: ${result}`, 'error');
        }
      } else {
        log(`❌ Erreur serveur debug: ${result}`, 'error');
      }
      
    } catch (error) {
      log(`❌ Erreur réseau: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  return (
    <div className="p-4 font-mono bg-gray-900 text-white min-h-screen">
      <h1 className="text-xl font-bold mb-4">🔍 Debug Whisper Mobile - Investigation Complète</h1>
      
      <div className="bg-gray-800 p-3 mb-4 rounded border-l-4 border-green-500">
        <strong>Objectif:</strong> Capturer et analyser l&apos;audio mobile réel pour identifier pourquoi Whisper échoue
      </div>
      
      <div className="space-x-2 mb-4">
        <button 
          onClick={startFullTest}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          🎙️ Test Complet Audio Mobile
        </button>
        <button 
          onClick={testBackendConnectivity}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          📡 Test Backend
        </button>
        <button 
          onClick={clearLog}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        >
          🗑️ Clear Log
        </button>
      </div>
      
      <div className="bg-gray-800 p-3 rounded max-h-96 overflow-y-auto">
        {logs.map((log, index) => (
          <div key={index} className="text-sm">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
