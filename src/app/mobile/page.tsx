'use client';

import React, { useState } from 'react';
import { OneTapRecorder } from '@/components/OneTapRecorder';
import { VideoImageAnalyzer } from '@/components/VideoImageAnalyzer';
import { MobileDiagnostic } from '@/components/MobileDiagnostic';
import { AudioTest } from '@/components/AudioTest';
import { ApiStatusChecker } from '@/components/ApiStatusChecker';
import MobileDebugPanel from '@/components/MobileDebugPanel';
import SpeechDiagnostic from '@/components/SpeechDiagnostic';

export default function MobilePage() {
  const [step, setStep] = useState<'record' | 'analyze'>('record');
  const [recordedData, setRecordedData] = useState<{
    videoBlob: Blob | null;
    phrases: string[];
    audioBlob: Blob | null;
  }>({
    videoBlob: null,
    phrases: [],
    audioBlob: null
  });
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(false);

  const handleRecordingComplete = (videoBlob: Blob, phrases: string[], audioBlob?: Blob) => {
    setRecordedData({ videoBlob, phrases, audioBlob: audioBlob || null });
    setStep('analyze');
  };

  const resetRecording = () => {
    setRecordedData({ videoBlob: null, phrases: [], audioBlob: null });
    setStep('record');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header Mobile */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">DodoLens Mobile</h1>
              <p className="text-sm text-gray-600">Calculateur de volume révolutionnaire</p>
            </div>
            <div className="text-right">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">📱</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-4 space-y-6">
        {step === 'record' && (
          <div className="space-y-6">
            {/* Instructions mobile */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                🎯 Comment ça marche ?
              </h2>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <div>
                    <div className="font-medium">Filmez votre intérieur</div>
                    <div className="text-gray-600">Pointez la caméra vers vos meubles et objets</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <div>
                    <div className="font-medium">Commentez à l'oral</div>
                    <div className="text-gray-600">"Je prends ce canapé, cette table..." ou "J'ignore cette chaise"</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <div>
                    <div className="font-medium">IA analyse tout</div>
                    <div className="text-gray-600">Fusion image + son = volume précis automatiquement</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnostic Speech Recognition */}
            <SpeechDiagnostic />
            
            {/* Status API OpenAI */}
            <ApiStatusChecker />

            {/* Diagnostic technique */}
            <MobileDiagnostic />

            {/* Test audio isolé */}
            <AudioTest />

            {/* Composant d'enregistrement */}
            <OneTapRecorder onRecordingComplete={handleRecordingComplete} />

            {/* Tips mobile */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-medium text-blue-800 mb-2">💡 Conseils pour un meilleur résultat</h3>
              <div className="space-y-1 text-sm text-blue-700">
                <div>• Filmez lentement et de près</div>
                <div>• Parlez clairement : "Je prends..." ou "J'ignore..."</div>
                <div>• Bonne luminosité recommandée</div>
                <div>• Tenez le téléphone stable</div>
              </div>
            </div>
          </div>
        )}

        {step === 'analyze' && (
          <div className="space-y-6">
            {/* Header de résultats */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">🤖 Analyse IA</h2>
                  <p className="text-sm text-gray-600">Fusion vidéo + audio</p>
                </div>
                <button
                  onClick={resetRecording}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                >
                  🔄 Nouvel enregistrement
                </button>
              </div>

              {/* Résumé de l'enregistrement */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="font-medium text-purple-600 text-sm">📹 Vidéo</div>
                  <div className="text-purple-800 text-xs">
                    {recordedData.videoBlob ? 
                      `${(recordedData.videoBlob.size / 1024 / 1024).toFixed(1)} MB` : 
                      'Aucune vidéo'
                    }
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="font-medium text-green-600 text-sm">🎙️ Audio</div>
                  <div className="text-green-800 text-xs">
                    {recordedData.phrases.length} phrases
                  </div>
                </div>
              </div>
            </div>

            {/* Composant d'analyse */}
            <VideoImageAnalyzer 
              videoBlob={recordedData.videoBlob || undefined}
              audioPhrases={recordedData.phrases}
              audioBlob={recordedData.audioBlob || undefined}
            />

            {/* Actions finales */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">📊 Prochaines étapes</h3>
              <div className="space-y-3">
                <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
                  ✅ Valider et obtenir le devis
                </button>
                <button 
                  onClick={resetRecording}
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  🔄 Refaire l'enregistrement
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer mobile */}
      <div className="p-4 bg-white border-t mt-8">
        <div className="text-center space-y-2">
          <div className="text-sm font-medium text-gray-900">DodoLens by DodoMove</div>
          <div className="text-xs text-gray-500">
            Innovation IA pour votre déménagement 🚀
          </div>
        </div>
      </div>
      
      {/* Debug Panel Mobile */}
      <MobileDebugPanel
        isVisible={showDebugPanel}
        onToggle={() => setShowDebugPanel(!showDebugPanel)}
      />
    </div>
  );
}
