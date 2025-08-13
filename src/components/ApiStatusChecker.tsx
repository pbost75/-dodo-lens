'use client';

import React, { useEffect, useState } from 'react';
import { secureOpenaiService } from '@/services/secureOpenaiService';

interface ApiStatus {
  configured: boolean;
  keyPresent: boolean;
  keyValid: boolean;
  testResult?: string;
  error?: string;
}

export const ApiStatusChecker: React.FC = () => {
  const [status, setStatus] = useState<ApiStatus>({
    configured: false,
    keyPresent: false,
    keyValid: false
  });
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    console.log('🔍 Vérification configuration API...');
    
    // Maintenant on utilise le backend sécurisé - plus besoin de clé frontend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const backendPresent = !!backendUrl;
    
    console.log('Backend URL:', backendUrl);
    console.log('Backend présent:', backendPresent);
    
    // Le service backend est toujours prêt si l'URL est configurée
    const configured = backendPresent;
    console.log('Service configured:', configured);
    
    setStatus({
      configured,
      keyPresent: backendPresent, // Backend au lieu de clé locale
      keyValid: false // Sera testé avec un appel réel
    });
    
    console.log('✅ Status mis à jour:', { configured, backendPresent });
  };

  const testApiConnection = async () => {
    if (!secureOpenaiService.isReady()) {
      setStatus(prev => ({ ...prev, error: 'Service OpenAI sécurisé non configuré' }));
      return;
    }

    setTesting(true);
    try {
      // Test simple avec une image de test (pixel blanc 1x1)
      const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      
      console.log('🧪 Test de l\'API OpenAI via backend sécurisé...');
      const result = await secureOpenaiService.analyzeVideoFrame(testImage);
      
      setStatus(prev => ({
        ...prev,
        keyValid: true,
        testResult: `✅ API GPT-4o fonctionnelle - ${result.length} objets détectés`,
        error: undefined
      }));
    } catch (error: any) {
      console.error('❌ Erreur test API:', error);
      
      // Message d'erreur plus détaillé
      let errorMessage = error.message;
      if (error.message.includes('deprecated')) {
        errorMessage = 'Modèle déprécié, utilisation de GPT-4o maintenant';
      } else if (error.message.includes('404')) {
        errorMessage = 'Modèle non trouvé - vérifiez votre accès GPT-4o';
      } else if (error.message.includes('quota')) {
        errorMessage = 'Quota API dépassé - vérifiez votre compte OpenAI';
      }
      
      setStatus(prev => ({
        ...prev,
        keyValid: false,
        error: `❌ Erreur API: ${errorMessage}`,
        testResult: undefined
      }));
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 m-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        🔧 Status de l'API OpenAI
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${status.keyPresent ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-gray-700">
            Clé API présente: {status.keyPresent ? '✅ Oui' : '❌ Non'}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${status.configured ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-gray-700">
            Service configuré: {status.configured ? '✅ Oui' : '❌ Non'}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${
            status.keyValid ? 'bg-green-500' : 
            status.error ? 'bg-red-500' : 'bg-gray-400'
          }`}></span>
          <span className="text-gray-700">
            API testée: {
              status.keyValid ? '✅ Fonctionnelle' : 
              status.error ? '❌ Erreur' : '⏳ Non testée'
            }
          </span>
        </div>
      </div>

      {status.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{status.error}</p>
        </div>
      )}

      {status.testResult && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700 text-sm">{status.testResult}</p>
        </div>
      )}

      <div className="mt-6 space-y-3">
        <button
          onClick={testApiConnection}
          disabled={!status.configured || testing}
          className={`w-full px-4 py-2 rounded-md font-medium ${
            status.configured && !testing
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {testing ? '🔄 Test en cours...' : '🧪 Tester l\'API'}
        </button>

        <button
          onClick={checkConfiguration}
          className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium"
        >
          🔄 Actualiser le status
        </button>
        
        <button
          onClick={() => {
            console.log('🔍 Debug complet:', {
              apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY ? '✅ Présente' : '❌ Absente',
              keyValue: process.env.NEXT_PUBLIC_OPENAI_API_KEY?.substring(0, 10) + '...',
              isReady: secureOpenaiService.isReady(),
              window: typeof window !== 'undefined',
              userAgent: navigator.userAgent
            });
          }}
          className="w-full px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-md font-medium text-sm"
        >
          🔍 Debug Console
        </button>

        <button
          onClick={async () => {
            setTesting(true);
            try {
              console.log('🧪 Test API simple...');
              const testResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  model: 'gpt-4o-mini',
                  messages: [{ role: 'user', content: 'Réponds juste "Test OK"' }],
                  max_tokens: 10
                })
              });
              
              const data = await testResponse.json();
              console.log('📦 Réponse test simple:', data);
              
              if (data.choices?.[0]?.message?.content) {
                setStatus(prev => ({ 
                  ...prev, 
                  testResult: '✅ Test simple réussi', 
                  error: undefined 
                }));
              } else {
                setStatus(prev => ({ 
                  ...prev, 
                  error: '❌ Test simple échoué: ' + JSON.stringify(data) 
                }));
              }
            } catch (error: any) {
              console.error('❌ Erreur test simple:', error);
              setStatus(prev => ({ 
                ...prev, 
                error: '❌ Test simple échoué: ' + error.message 
              }));
            } finally {
              setTesting(false);
            }
          }}
          className="w-full px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md font-medium text-sm"
        >
          🧪 Test API Simple
        </button>
      </div>

      {!status.keyPresent && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h4 className="font-medium text-yellow-800">📝 Configuration requise</h4>
          <p className="text-yellow-700 text-sm mt-2">
            Ajoutez votre clé API OpenAI dans le fichier <code>.env.local</code> :
          </p>
          <pre className="mt-2 p-2 bg-yellow-100 rounded text-xs">
NEXT_PUBLIC_OPENAI_API_KEY=sk-votre-clé-ici
          </pre>
        </div>
      )}
    </div>
  );
};
