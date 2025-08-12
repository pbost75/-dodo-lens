'use client';

import React, { useState, useRef, useEffect } from 'react';

export const MobileDiagnostic: React.FC = () => {
  const [diagnosticResults, setDiagnosticResults] = useState<any>({});
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
    console.log(`📱 DIAGNOSTIC: ${message}`);
  };

  const runFullDiagnostic = async () => {
    setIsRunning(true);
    setLogs([]);
    addLog('🔍 Début du diagnostic complet...');

    const results: any = {};

    // 1. Détection de l'environnement
    addLog('1️⃣ Détection environnement...');
    results.userAgent = navigator.userAgent;
    results.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    results.isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    results.isAndroid = /Android/i.test(navigator.userAgent);
    results.isChrome = /Chrome/i.test(navigator.userAgent);
    results.isSafari = /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent);
    
    addLog(`📱 Mobile: ${results.isMobile}, iOS: ${results.isIOS}, Android: ${results.isAndroid}`);
    addLog(`🌐 Chrome: ${results.isChrome}, Safari: ${results.isSafari}`);

    // 2. Test des APIs disponibles
    addLog('2️⃣ Test APIs...');
    results.apis = {
      mediaDevices: 'mediaDevices' in navigator,
      getUserMedia: navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices,
      mediaRecorder: 'MediaRecorder' in window,
      speechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
      audioContext: 'AudioContext' in window || 'webkitAudioContext' in window
    };

    Object.entries(results.apis).forEach(([api, available]) => {
      addLog(`🔌 ${api}: ${available ? '✅' : '❌'}`);
    });

    // 3. Test des formats MediaRecorder
    addLog('3️⃣ Test formats MediaRecorder...');
    const formats = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/wav',
      'audio/mp4',
      'video/mp4'
    ];

    results.supportedFormats = {};
    formats.forEach(format => {
      const supported = MediaRecorder.isTypeSupported ? MediaRecorder.isTypeSupported(format) : false;
      results.supportedFormats[format] = supported;
      addLog(`🎬 ${format}: ${supported ? '✅' : '❌'}`);
    });

    // 4. Test permissions (déjà accordées)
    addLog('4️⃣ Test permissions...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      results.permissions = {
        video: stream.getVideoTracks().length > 0,
        audio: stream.getAudioTracks().length > 0,
        videoSettings: stream.getVideoTracks()[0]?.getSettings(),
        audioSettings: stream.getAudioTracks()[0]?.getSettings()
      };

      addLog(`🎥 Vidéo: ${results.permissions.video ? '✅' : '❌'}`);
      addLog(`🎙️ Audio: ${results.permissions.audio ? '✅' : '❌'}`);
      
      if (results.permissions.videoSettings) {
        addLog(`📹 Résolution: ${results.permissions.videoSettings.width}x${results.permissions.videoSettings.height}`);
      }
      
      if (results.permissions.audioSettings) {
        addLog(`🔊 Sample Rate: ${results.permissions.audioSettings.sampleRate}Hz`);
        addLog(`🎚️ Channels: ${results.permissions.audioSettings.channelCount}`);
      }

      // 5. Test MediaRecorder réel
      addLog('5️⃣ Test MediaRecorder réel...');
      
      // Test vidéo seule
      const videoStream = new MediaStream();
      stream.getVideoTracks().forEach(track => videoStream.addTrack(track));
      
      const videoRecorder = new MediaRecorder(videoStream);
      results.videoRecorderState = videoRecorder.state;
      addLog(`📹 VideoRecorder state: ${videoRecorder.state}`);

      // Test audio seul
      const audioStream = new MediaStream();
      stream.getAudioTracks().forEach(track => audioStream.addTrack(track));
      
      const audioRecorder = new MediaRecorder(audioStream);
      results.audioRecorderState = audioRecorder.state;
      addLog(`🎙️ AudioRecorder state: ${audioRecorder.state}`);

      // Test AudioContext (pour niveau audio)
      try {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        
        results.audioContext = {
          state: audioContext.state,
          sampleRate: audioContext.sampleRate,
          analyserFftSize: analyser.fftSize
        };
        
        addLog(`🎵 AudioContext: ${audioContext.state}, ${audioContext.sampleRate}Hz`);
        audioContext.close();
      } catch (audioError) {
        const errorMsg = audioError instanceof Error ? audioError.message : String(audioError);
        addLog(`❌ AudioContext error: ${errorMsg}`);
        results.audioContextError = errorMsg;
      }

      // Nettoyer le stream
      stream.getTracks().forEach(track => track.stop());
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addLog(`❌ Erreur permissions: ${errorMsg}`);
      results.permissionError = errorMsg;
    }

    // 6. Problèmes connus par navigateur
    addLog('6️⃣ Problèmes connus...');
    const knownIssues = [];
    
    if (results.isIOS && results.isSafari) {
      knownIssues.push('iOS Safari: MediaRecorder audio parfois silencieux');
      knownIssues.push('iOS Safari: Speech Recognition très limité');
    }
    
    if (results.isAndroid && results.isChrome) {
      knownIssues.push('Android Chrome: Formats audio limités');
    }
    
    if (results.isMobile) {
      knownIssues.push('Mobile: Speech Recognition instable');
      knownIssues.push('Mobile: MediaRecorder peut séparer audio/vidéo');
    }

    results.knownIssues = knownIssues;
    knownIssues.forEach(issue => addLog(`⚠️ ${issue}`));

    addLog('🎉 Diagnostic terminé !');
    setDiagnosticResults(results);
    setIsRunning(false);
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="text-lg font-semibold mb-4">🔍 Diagnostic Mobile Avancé</h3>
      
      <button
        onClick={runFullDiagnostic}
        disabled={isRunning}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4 disabled:opacity-50"
      >
        {isRunning ? '🔍 Diagnostic en cours...' : '🚀 Lancer diagnostic complet'}
      </button>

      {/* Logs en temps réel */}
      {logs.length > 0 && (
        <div className="bg-gray-900 text-green-400 text-xs p-3 rounded mb-4 max-h-40 overflow-y-auto font-mono">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      )}

      {/* Résultats détaillés */}
      {Object.keys(diagnosticResults).length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">📊 Résultats détaillés :</h4>
          
          {/* Environnement */}
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-medium text-sm mb-2">🌐 Environnement :</div>
            <div className="text-xs space-y-1">
              <div>📱 Mobile: {diagnosticResults.isMobile ? 'Oui' : 'Non'}</div>
              <div>🍎 iOS: {diagnosticResults.isIOS ? 'Oui' : 'Non'}</div>
              <div>🤖 Android: {diagnosticResults.isAndroid ? 'Oui' : 'Non'}</div>
              <div>🌐 Chrome: {diagnosticResults.isChrome ? 'Oui' : 'Non'}</div>
              <div>🧭 Safari: {diagnosticResults.isSafari ? 'Oui' : 'Non'}</div>
            </div>
          </div>

          {/* Formats supportés */}
          {diagnosticResults.supportedFormats && (
            <div className="bg-blue-50 p-3 rounded">
              <div className="font-medium text-sm mb-2">🎬 Formats supportés :</div>
              <div className="text-xs space-y-1">
                {Object.entries(diagnosticResults.supportedFormats).map(([format, supported]) => (
                  <div key={format} className={supported ? 'text-green-600' : 'text-red-600'}>
                    {supported ? '✅' : '❌'} {format}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Problèmes connus */}
          {diagnosticResults.knownIssues && diagnosticResults.knownIssues.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
              <div className="font-medium text-sm mb-2">⚠️ Problèmes connus :</div>
              <div className="text-xs space-y-1">
                {diagnosticResults.knownIssues.map((issue: string, index: number) => (
                  <div key={index} className="text-yellow-800">• {issue}</div>
                ))}
              </div>
            </div>
          )}

          {/* Bouton export */}
          <button
            onClick={() => {
              const dataStr = JSON.stringify(diagnosticResults, null, 2);
              const dataBlob = new Blob([dataStr], {type: 'application/json'});
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `dodo-lens-diagnostic-${Date.now()}.json`;
              link.click();
            }}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm"
          >
            📥 Exporter diagnostic
          </button>
        </div>
      )}
    </div>
  );
};
