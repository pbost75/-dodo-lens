'use client';

import React, { useState } from 'react';
import { SimpleVideoTest } from '@/components/SimpleVideoTest';
import { SimpleSpeechTest } from '@/components/SimpleSpeechTest';
import { SimpleTableGenerator } from '@/components/SimpleTableGenerator';
import { VideoImageAnalyzer } from '@/components/VideoImageAnalyzer';

export default function RecordPage() {
  const [step, setStep] = useState(1);
  const [capturedPhrases, setCapturedPhrases] = useState<string[]>([]);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState<Blob | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simple */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              🎬 DodoLens - Test MVP
            </h1>
            <p className="text-gray-600">
              Interface simplifiée pour tester les fonctionnalités
            </p>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        
        {step === 1 && (
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">🎬 Test d'enregistrement vidéo</h2>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Cette version simplifiée teste l'accès aux APIs du navigateur.
              </p>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                  <h3 className="font-medium text-blue-800 mb-2">✅ Étape 1 : Test basique</h3>
                  <p className="text-blue-700 text-sm">
                    Si vous voyez cette page, Next.js fonctionne !
                  </p>
                </div>
                
                <button 
                  onClick={() => setStep(2)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ▶️ Tester les permissions caméra/micro
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <SimpleVideoTest onVideoRecorded={setRecordedVideoBlob} />
            
            <SimpleSpeechTest onPhrasesChange={setCapturedPhrases} />
            
            <div className="bg-white rounded-lg border p-6">
              <div className="flex space-x-4">
                <button 
                  onClick={() => setStep(1)}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  ← Retour
                </button>
                
                <button 
                  onClick={() => setStep(3)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Étape suivante →
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            {/* Ancien générateur simple */}
            <SimpleTableGenerator phrases={capturedPhrases} />
            
            {/* NOUVEAU : Fusion IA révolutionnaire */}
            <VideoImageAnalyzer 
              videoBlob={recordedVideoBlob || undefined}
              audioPhrases={capturedPhrases}
            />
            
            <div className="bg-white rounded-lg border p-6">
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded">
                  <h3 className="font-medium text-purple-800 mb-2">🚀 Révolution DodoLens !</h3>
                  <p className="text-purple-700 text-sm">
                    <strong>Fusion IA Image + Son</strong> : La preuve de concept est là ! 
                    Comparaison en temps réel entre analyse audio seule, visuelle seule, et fusion intelligente.
                  </p>
                </div>
                
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    🎉 Demo terminée - Recommencer
                  </button>
                  
                  <button 
                    onClick={() => setStep(2)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ← Retour aux tests
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>🎬 DodoLens MVP - Version simplifiée pour debug</p>
        </div>
      </div>
    </div>
  );
}