'use client';

import { useState } from 'react';
import { aiService } from '@/services/aiService';
import { frameExtractionService } from '@/services/frameExtractionService';
import { secureOpenaiService } from '@/services/secureOpenaiService';

export default function DebugVisionPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [frameData, setFrameData] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const log = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      log(`📹 Vidéo sélectionnée: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    }
  };

  const extractFrame = async () => {
    if (!videoFile) {
      log('❌ Aucune vidéo sélectionnée');
      return;
    }

    setIsProcessing(true);
    try {
      log('🎬 Début extraction frame...');
      
      // Log avant extraction pour debug
      log(`📱 User Agent: ${navigator.userAgent}`);
      log(`📹 Vidéo taille: ${videoFile.size} bytes`);
      
      // Utiliser frameExtractionService pour extraction
      const result = await frameExtractionService.extractFrame(videoFile);
      
      log(`🔍 Méthode utilisée: ${result.method || 'inconnue'}`);
      log(`⏰ Temps de traitement: ${result.processingTime}ms`);
      log(`💰 Coût: ${result.cost ? '$' + result.cost : 'gratuit'}`);
      
      if (!result.success || !result.frameData) {
        throw new Error(result.error || 'Échec extraction frame');
      }
      
      const frame = result.frameData;
      setFrameData(frame);
      log('✅ Frame extraite avec succès');
      log(`📏 Taille frame: ${frame.length} caractères`);
      
    } catch (error) {
      log(`❌ Erreur extraction: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeFrame = async () => {
    if (!frameData) {
      log('❌ Aucune frame à analyser');
      return;
    }

    setIsProcessing(true);
    try {
      log('🧠 Début analyse GPT-4 Vision...');
      
      // Test direct du service sécurisé
      const result = await secureOpenaiService.analyzeVideoFrame(frameData);
      setAnalysisResult(result);
      log('✅ Analyse terminée');
      log(`📊 Objets détectés: ${result.length}`);
      
    } catch (error) {
      log(`❌ Erreur analyse: ${error}`);
      setAnalysisResult({ error: error.toString() });
    } finally {
      setIsProcessing(false);
    }
  };

  const forceCloudinary = async () => {
    if (!videoFile) {
      log('❌ Aucune vidéo pour test Cloudinary');
      return;
    }

    setIsProcessing(true);
    try {
      log('☁️ FORÇAGE Cloudinary...');
      
      // Accès direct à la méthode Cloudinary privée via une méthode temporaire
      const result = await frameExtractionService.extractFrame(videoFile);
      
      // Pour forcer Cloudinary, on va modifier temporairement la logique
      log('🔧 Tentative de forçage Cloudinary via FormData direct...');
      
      const formData = new FormData();
      formData.append('file', videoFile);
      formData.append('upload_preset', 'dodo-lens-videos');
      formData.append('resource_type', 'video');
      
      const uploadResponse = await fetch(
        'https://api.cloudinary.com/v1_1/djuufdbpt/video/upload',
        {
          method: 'POST',
          body: formData
        }
      );
      
      if (!uploadResponse.ok) {
        throw new Error(`Upload Cloudinary failed: ${uploadResponse.status}`);
      }
      
      const uploadResult = await uploadResponse.json();
      log(`✅ Upload Cloudinary réussi: ${uploadResult.public_id}`);
      
      // Générer URL de frame SANS recadrage
      const frameUrl = `https://res.cloudinary.com/djuufdbpt/video/upload/so_auto/w_640,c_fit,f_jpg/${uploadResult.public_id}.jpg`;
      log(`📸 URL frame: ${frameUrl}`);
      
      // Télécharger frame
      const frameResponse = await fetch(frameUrl);
      if (!frameResponse.ok) {
        throw new Error(`Frame download failed: ${frameResponse.status}`);
      }
      
      const frameBlob = await frameResponse.blob();
      const reader = new FileReader();
      reader.onload = () => {
        const frameData = reader.result as string;
        setFrameData(frameData);
        log('✅ Frame Cloudinary extraite avec succès !');
        log(`📏 Taille: ${frameData.length} caractères`);
      };
      reader.readAsDataURL(frameBlob);
      
    } catch (error) {
      log(`❌ Erreur Cloudinary forcé: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const testBackendDirect = async () => {
    if (!frameData) {
      log('❌ Aucune frame pour test backend');
      return;
    }

    setIsProcessing(true);
    try {
      log('🔒 Test direct backend Railway...');
      
      const response = await fetch('https://web-production-7b738.up.railway.app/api/dodo-lens/analyze-vision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: frameData,
          prompt: `Analyse cette image d'intérieur et liste TOUS les objets visibles avec leur volume en m³.

OBLIGATOIRE:
- Examine attentivement CHAQUE détail de l'image
- Liste TOUS les meubles, objets, décorations visibles
- Ne réponds PAS en mode dégradé ou avec des objets génériques
- Donne des volumes réalistes pour CHAQUE objet identifié

FORMAT JSON strict:
{
  "detectedObjects": [
    {"name": "Lampadaire", "category": "salon", "volume": 0.4, "confidence": 0.9, "quantity": 1},
    {"name": "Plante en pot", "category": "decoration", "volume": 0.1, "confidence": 0.8, "quantity": 1}
  ]
}`
        })
      });

      log(`📡 Status: ${response.status}`);
      
      if (!response.ok) {
        const error = await response.text();
        log(`❌ Erreur backend: ${error}`);
        return;
      }

      const result = await response.json();
      log('✅ Réponse backend reçue');
      log(`📄 Résultat: ${JSON.stringify(result, null, 2)}`);
      
    } catch (error) {
      log(`❌ Erreur test backend: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔍 Debug Vision Analysis</h1>
        
        {/* Upload vidéo */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">📹 Sélection Vidéo</h2>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="w-full p-3 bg-gray-700 rounded border border-gray-600"
          />
        </div>

        {/* Actions */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">🛠️ Actions</h2>
          <div className="space-y-3">
            <button
              onClick={extractFrame}
              disabled={!videoFile || isProcessing}
              className="w-full p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded"
            >
              {isProcessing ? '⏳ Extraction...' : '📸 Extraire Frame'}
            </button>
            
            <button
              onClick={analyzeFrame}
              disabled={!frameData || isProcessing}
              className="w-full p-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded"
            >
              {isProcessing ? '⏳ Analyse...' : '🧠 Analyser avec GPT-4 Vision'}
            </button>
            
            <button
              onClick={testBackendDirect}
              disabled={!frameData || isProcessing}
              className="w-full p-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded"
            >
              {isProcessing ? '⏳ Test...' : '🔒 Test Backend Direct'}
            </button>
            
            <button
              onClick={forceCloudinary}
              disabled={!videoFile || isProcessing}
              className="w-full p-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 rounded"
            >
              {isProcessing ? '⏳ Forçage...' : '☁️ FORCER Cloudinary'}
            </button>
          </div>
        </div>

        {/* Preview frame */}
        {frameData && (
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">🖼️ Frame Extraite</h2>
            <img
              src={frameData}
              alt="Frame extraite"
              className="max-w-full h-auto rounded border border-gray-600"
            />
            <p className="text-sm text-gray-400 mt-2">
              Taille: {frameData.length} caractères
            </p>
          </div>
        )}

        {/* Résultat analyse */}
        {analysisResult && (
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">📊 Résultat Analyse</h2>
            <pre className="bg-gray-900 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(analysisResult, null, 2)}
            </pre>
          </div>
        )}

        {/* Logs */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">📋 Logs Debug</h2>
          <div className="bg-gray-900 p-4 rounded text-sm font-mono h-64 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="mb-1">{log}</div>
            ))}
          </div>
          <button
            onClick={() => setLogs([])}
            className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
          >
            🗑️ Effacer logs
          </button>
        </div>
      </div>
    </div>
  );
}
