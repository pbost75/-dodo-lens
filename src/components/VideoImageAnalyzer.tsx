'use client';

import React, { useState } from 'react';
import { AudioDebugPlayer } from './AudioDebugPlayer';
import { mobileLog } from './MobileDebugPanel';
import { openaiService } from '@/services/openaiService';

interface DetectedObject {
  id: string;
  name: string;
  confidence: number;
  volume: number;
  detectionMethod: 'video' | 'audio' | 'fusion';
  visualConfidence?: number;
  audioConfidence?: number;
  volumeAccuracy: 'standard' | 'visual_enhanced' | 'precise';
}

interface Props {
  videoBlob?: Blob;
  audioPhrases: string[];
  audioBlob?: Blob; // Ajout pour le debug
}

export const VideoImageAnalyzer: React.FC<Props> = ({ videoBlob, audioPhrases, audioBlob }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedFrames, setExtractedFrames] = useState<string[]>([]);
  const [visualObjects, setVisualObjects] = useState<DetectedObject[]>([]);
  const [audioObjects, setAudioObjects] = useState<DetectedObject[]>([]);
  const [fusedObjects, setFusedObjects] = useState<DetectedObject[]>([]);
  const [analysisStep, setAnalysisStep] = useState<'idle' | 'frames' | 'visual' | 'audio' | 'fusion' | 'complete'>('idle');

  // Simulation de la base de données d'objets avec volumes visuellement ajustés
  const objectDatabase = {
    'canapé': { 
      baseVolume: 1.5, 
      visualMultipliers: { '2places': 0.8, '3places': 1.0, '4places': 1.3, 'angle': 1.8 }
    },
    'table': { 
      baseVolume: 0.8, 
      visualMultipliers: { 'basse': 0.4, 'salle': 1.0, 'bureau': 0.9, 'cuisine': 1.2 }
    },
    'chaise': { 
      baseVolume: 0.2, 
      visualMultipliers: { 'simple': 1.0, 'bureau': 1.2, 'fauteuil': 2.0 }
    },
    'télé': { 
      baseVolume: 0.15, 
      visualMultipliers: { 'petite': 0.6, 'moyenne': 1.0, 'grande': 1.8, 'géante': 3.0 }
    },
    'meuble': { 
      baseVolume: 0.8, 
      visualMultipliers: { 'bas': 0.6, 'haut': 1.5, 'bibliothèque': 2.0 }
    },
    'armoire': { 
      baseVolume: 2.0, 
      visualMultipliers: { '2portes': 1.0, '3portes': 1.4, 'penderie': 0.8 }
    },
    'frigo': { 
      baseVolume: 1.0, 
      visualMultipliers: { 'simple': 0.8, 'double': 1.0, 'américain': 1.6 }
    },
    'four': { 
      baseVolume: 0.3, 
      visualMultipliers: { 'encastrable': 0.8, 'posable': 1.0, 'combiné': 1.3 }
    },
    'lit': { 
      baseVolume: 1.2, 
      visualMultipliers: { 'simple': 0.7, 'double': 1.0, 'king': 1.4 }
    },
    'livre': { 
      baseVolume: 0.01, 
      visualMultipliers: { 'poche': 0.5, 'normal': 1.0, 'grand': 2.0 }
    },
    'lampe': { 
      baseVolume: 0.05, 
      visualMultipliers: { 'table': 0.8, 'sol': 1.5, 'suspension': 0.3 }
    },
    'miroir': { 
      baseVolume: 0.08, 
      visualMultipliers: { 'petit': 0.5, 'moyen': 1.0, 'grand': 2.0 }
    },
    'plante': { 
      baseVolume: 0.2, 
      visualMultipliers: { 'petite': 0.3, 'moyenne': 1.0, 'grande': 3.0 }
    },
    'coussin': { 
      baseVolume: 0.05, 
      visualMultipliers: { 'petit': 0.6, 'normal': 1.0, 'grand': 1.8 }
    },
    'tapis': { 
      baseVolume: 0.15, 
      visualMultipliers: { 'petit': 0.4, 'moyen': 1.0, 'grand': 2.5 }
    },
    'rideau': { 
      baseVolume: 0.1, 
      visualMultipliers: { 'fin': 0.5, 'normal': 1.0, 'épais': 1.8 }
    },
    'boîte': { 
      baseVolume: 0.3, 
      visualMultipliers: { 'petite': 0.3, 'moyenne': 1.0, 'grande': 2.5 }
    },
    'vêtement': { 
      baseVolume: 0.02, 
      visualMultipliers: { 'léger': 0.5, 'normal': 1.0, 'lourd': 2.0 }
    },
    'objet': { 
      baseVolume: 0.4, 
      visualMultipliers: { 'petit': 0.5, 'moyen': 1.0, 'grand': 2.0 }
    },
    'affaire': { 
      baseVolume: 0.25, 
      visualMultipliers: { 'petite': 0.4, 'normale': 1.0, 'grosse': 2.2 }
    }
  };

  // Extraire des frames de la vidéo - OPTIMISÉ MOBILE
  const extractVideoFrames = async (blob: Blob): Promise<string[]> => {
    return new Promise((resolve) => {
      console.log('📱 MOBILE - Début extraction frames, blob size:', blob.size, 'bytes');
      console.log('📱 MOBILE - Blob type:', blob.type);
      
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      const frames: string[] = [];

      // Configuration mobile-friendly
      video.preload = 'metadata';
      video.muted = true; // CRUCIAL pour mobile
      video.playsInline = true; // CRUCIAL pour iOS
      video.crossOrigin = 'anonymous';
      
      video.onloadedmetadata = () => {
        console.log('✅ Métadonnées vidéo chargées:', {
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          readyState: video.readyState
        });
        canvas.width = Math.min(video.videoWidth, 640);
        canvas.height = Math.min(video.videoHeight, 360);
        
        const duration = video.duration;
        
        // SÉCURITÉ: Vérifier que la durée est valide
        if (!isFinite(duration) || duration <= 0) {
          console.error('❌ Durée vidéo invalide:', duration);
          resolve([]); // Retourner un tableau vide
          return;
        }
        
        console.log(`📹 Vidéo: ${duration.toFixed(2)}s, ${video.videoWidth}x${video.videoHeight}`);
        
        // ⏰ LOGIQUE MOBILE OPTIMISÉE: Plus de frames pour compenser les échecs
        const FRAME_INTERVAL = 2; // Réduire l'intervalle sur mobile
        const START_OFFSET = 1; // Commencer plus tôt sur mobile
        
        // Calculer les timestamps d'extraction
        const frameTimestamps: number[] = [];
        for (let time = START_OFFSET; time < duration; time += FRAME_INTERVAL) {
          frameTimestamps.push(time);
        }
        
        // MOBILE: Si vidéo courte, prendre plusieurs frames de sécurité
        if (frameTimestamps.length === 0) {
          if (duration > 0.5) frameTimestamps.push(0.5);
          if (duration > 1.0) frameTimestamps.push(1.0);
          if (duration > 1.5) frameTimestamps.push(1.5);
        }
        
        // MOBILE: Limiter le nombre de frames pour éviter les erreurs mémoire
        if (frameTimestamps.length > 8) {
          frameTimestamps.splice(8); // Max 8 frames sur mobile
        }
        
        console.log(`🎯 EXTRACTION PROGRAMMÉE:`, {
          videoDuration: `${duration.toFixed(2)}s`,
          frameTimestamps: frameTimestamps.map(t => `${t.toFixed(1)}s`),
          totalFrames: frameTimestamps.length,
          stratégie: `Toutes les ${FRAME_INTERVAL}s à partir de ${START_OFFSET}s`
        });
        
        let currentFrameIndex = 0;
        let timeoutId: NodeJS.Timeout | null = null;

        const captureFrame = () => {
          if (currentFrameIndex >= frameTimestamps.length) {
            resolve(frames);
            return;
          }
          
          const time = frameTimestamps[currentFrameIndex];
          
          // SÉCURITÉ: Vérifier que time est valide
          if (!isFinite(time) || time < 0 || time > duration) {
            console.error('❌ Temps invalide pour frame:', time, 'durée:', duration);
            // Passer à la frame suivante
            currentFrameIndex++;
            setTimeout(captureFrame, 100);
            return;
          }
          
          video.currentTime = time;
          console.log(`📸 Frame ${currentFrameIndex + 1}/${frameTimestamps.length}: temps=${time.toFixed(2)}s`);
        };

        video.onseeked = () => {
          try {
            console.log('📱 MOBILE - Dessin frame sur canvas...');
            
            // Vérifier que la vidéo est prête
            if (video.readyState >= 2) { // HAVE_CURRENT_DATA
              context.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              // Vérifier que le canvas n'est pas vide (écran noir)
              const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
              const data = imageData.data;
              let hasContent = false;
              
              // Vérifier qu'il y a du contenu (pas juste du noir)
              for (let i = 0; i < data.length; i += 4) {
                if (data[i] > 20 || data[i+1] > 20 || data[i+2] > 20) { // R,G,B > 20
                  hasContent = true;
                  break;
                }
              }
              
              if (hasContent) {
                const frameData = canvas.toDataURL('image/jpeg', 0.7); // Qualité réduite mobile
                frames.push(frameData);
                console.log(`✅ MOBILE - Frame ${currentFrameIndex + 1} OK (${frameData.length} chars)`);
              } else {
                console.warn(`⚠️ MOBILE - Frame ${currentFrameIndex + 1} vide/noire, ignorée`);
              }
            } else {
              console.warn(`⚠️ MOBILE - Vidéo pas prête (readyState: ${video.readyState})`);
            }
            
          } catch (error) {
            console.error('❌ MOBILE - Erreur capture frame:', error);
          }
          
          currentFrameIndex++;
          if (currentFrameIndex < frameTimestamps.length) {
            setTimeout(captureFrame, 300); // Délai plus long sur mobile
          } else {
            console.log(`✅ MOBILE - EXTRACTION TERMINÉE: ${frames.length} frames extraites`);
            resolve(frames);
          }
        };

        // Timeout de sécurité MOBILE avec retry
        let retryCount = 0;
        const maxRetries = 2;
        
        const startTimeout = () => {
          timeoutId = setTimeout(() => {
            if (frames.length === 0 && retryCount < maxRetries) {
              console.warn(`⚠️ MOBILE - Timeout extraction (essai ${retryCount + 1}/${maxRetries + 1})`);
              retryCount++;
              
              // Retry en repositionnant la vidéo
              video.currentTime = 0.5; // Position sécurisée
              setTimeout(() => {
                currentFrameIndex = 0;
                if (frameTimestamps.length > 0) {
                  captureFrame();
                  startTimeout(); // Nouveau timeout pour le retry
                }
              }, 1000);
            } else {
              console.warn('⚠️ MOBILE - Abandon extraction après timeouts');
              resolve(frames); // Retourner même si vide
            }
          }, 8000); // 8s par essai
        };

        // Commencer l'extraction
        if (frameTimestamps.length > 0) {
          captureFrame();
          startTimeout(); // Démarrer le timeout
        } else {
          console.warn('⚠️ Aucune frame à extraire - vidéo trop courte');
          resolve(frames);
        }
      };

      // Gestion d'erreur pour les vidéos mobiles
      video.onerror = (error) => {
        console.error('❌ Erreur chargement vidéo:', error);
        console.error('🎬 Détails erreur:', {
          error: video.error,
          networkState: video.networkState,
          readyState: video.readyState,
          currentSrc: video.currentSrc
        });
        resolve([]); // Retourner un tableau vide en cas d'erreur
      };

      video.onloadstart = () => {
        console.log('📹 Début chargement vidéo...');
      };

      video.oncanplay = () => {
        console.log('✅ Vidéo peut être lue');
      };

      video.oncanplaythrough = () => {
        console.log('✅ Vidéo entièrement chargée');
      };

      video.onstalled = () => {
        console.warn('⚠️ Chargement vidéo bloqué');
      };

      // Timeout de sécurité MOBILE configuré plus tard

      const blobUrl = URL.createObjectURL(blob);
      console.log('🔗 MOBILE - URL Blob créée:', blobUrl);
      video.src = blobUrl;
      video.load();
      
      // Cleanup mobile
      video.addEventListener('loadend', () => {
        URL.revokeObjectURL(blobUrl);
      });
    });
  };

  // 📱 FALLBACK MOBILE: Extraction simple d'une frame
  const extractSingleFrameMobile = async (blob: Blob): Promise<string | null> => {
    return new Promise((resolve) => {
      console.log('📱 FALLBACK - Tentative extraction frame simple');
      
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      
      video.muted = true;
      video.playsInline = true;
      video.preload = 'metadata';
      
      video.onloadeddata = () => {
        try {
          console.log('📱 FALLBACK - Données vidéo chargées');
          
          // Dimensions simplifiées
          canvas.width = 320;
          canvas.height = 240;
          
          // Aller au milieu de la vidéo
          video.currentTime = video.duration / 2;
          
          video.onseeked = () => {
            try {
              context.drawImage(video, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
              
              // Vérifier que ce n'est pas vide
              if (dataUrl.length > 1000) { // Au moins 1KB de données
                console.log('✅ FALLBACK - Frame extraite');
                resolve(dataUrl);
              } else {
                console.warn('⚠️ FALLBACK - Frame trop petite');
                resolve(null);
              }
            } catch (error) {
              console.error('❌ FALLBACK - Erreur drawImage:', error);
              resolve(null);
            }
          };
          
        } catch (error) {
          console.error('❌ FALLBACK - Erreur générale:', error);
          resolve(null);
        }
      };
      
      video.onerror = () => {
        console.error('❌ FALLBACK - Erreur chargement vidéo');
        resolve(null);
      };
      
      // Timeout rapide pour le fallback
      setTimeout(() => {
        console.warn('⚠️ FALLBACK - Timeout');
        resolve(null);
      }, 5000);
      
      video.src = URL.createObjectURL(blob);
    });
  };

  // 🤖 ANALYSE VISUELLE AVEC LLM (OpenAI Vision)
  const analyzeFramesVisually = async (frames: string[], videoBlob?: Blob): Promise<DetectedObject[]> => {
    console.log('🤖 Analyse LLM Vision RÉELLE des frames:', frames.length);
    
    // Si pas de frames, essayer une méthode alternative mobile
    if (frames.length === 0 || frames[0] === '') {
      console.log('📱 MOBILE - Tentative méthode alternative pour extraction frame');
      
      if (videoBlob) {
        try {
          // FALLBACK MOBILE: Essayer une capture simple à partir du blob
          const fallbackFrame = await extractSingleFrameMobile(videoBlob);
          if (fallbackFrame) {
            console.log('✅ MOBILE - Frame fallback extraite avec succès');
            frames = [fallbackFrame];
          } else {
            console.warn('⚠️ MOBILE - Même le fallback a échoué - analyse impossible');
            return [];
          }
        } catch (error) {
          console.error('❌ MOBILE - Erreur fallback extraction:', error);
          return [];
        }
      } else {
        console.warn('⚠️ MOBILE - Pas de blob pour fallback - analyse impossible');
        return [];
      }
    }

    try {
      // ✅ UTILISATION DU VRAI SERVICE OPENAI
      console.log('🔄 Appel OpenAI Vision RÉEL...');
      
      // Analyser la première frame (ou toutes si on veut être plus précis)
      const firstFrame = frames[0];
      const openaiResults = await openaiService.analyzeVideoFrame(firstFrame);
      
      console.log('✅ Résultats OpenAI Vision:', openaiResults);
      
      // Convertir au format DetectedObject attendu par ce composant
      const visualDetections: DetectedObject[] = openaiResults.map((item, index) => ({
        id: `openai-visual-${index + 1}`,
        name: item.name,
        confidence: item.confidence,
        volume: item.volume,
        detectionMethod: 'video' as const,
        visualConfidence: item.confidence,
        volumeAccuracy: 'precise' as const
      }));
      
      console.log(`🤖 OpenAI Vision: ${visualDetections.length} objets détectés`);
      return visualDetections;
      
    } catch (error) {
      console.error('❌ Erreur analyse OpenAI Vision:', error);
      
      // ❌ SUPPRESSION DU FALLBACK qui ajoute un volume fictif
      // En cas d'erreur, mieux vaut retourner vide que des données fausses
      console.warn('⚠️ Analyse visuelle échouée - retour vide pour éviter données fausses');
      return [];
    }
  };

  // 🤖 ANALYSE AUDIO AVEC LLM (OpenAI GPT)
  const analyzeAudioPhrases = async (phrases: string[]): Promise<DetectedObject[]> => {
    mobileLog.info('🤖 Début analyse LLM audio RÉELLE');
    mobileLog.info('📊 Phrases à analyser: ' + phrases.length);
    mobileLog.info('📝 Contenu phrases', phrases.map((p, i) => `${i+1}. "${p}"`));
    
    console.log('🤖 Analyse LLM RÉELLE des phrases audio:', phrases);
    console.log('📊 Nombre de phrases à analyser:', phrases.length);
    console.log('📝 Phrases complètes:', phrases.map((p, i) => `${i+1}. "${p}"`).join('\n'));
    
    if (!phrases || phrases.length === 0) {
      mobileLog.warn('⚠️ Aucune phrase à analyser - RETOUR VIDE !');
      console.warn('⚠️ Aucune phrase à analyser - RETOUR VIDE !');
      return [];
    }

    // 🔍 DEBUG PHRASES REÇUES
    console.log('🔍 DEBUG DÉTAILLÉ PHRASES:');
    phrases.forEach((phrase, index) => {
      console.log(`  ${index + 1}. "${phrase}" (length: ${phrase.length})`);
    });
    
    const audioAnalysisPrompt = `Tu es un expert en déménagement qui analyse les phrases prononcées par un utilisateur filmant son intérieur.

CONSIGNE: Extrait UNIQUEMENT les objets que l'utilisateur veut EMMENER lors de son déménagement.

PHRASES À ANALYSER:
${phrases.map((phrase, i) => `${i+1}. "${phrase}"`).join('\n')}

RÈGLES D'ANALYSE:
- "Je prends", "je veux", "j'emmène" = INCLURE l'objet
- "Je laisse", "pas", "j'ignore", "sans" = EXCLURE l'objet  
- "Je prends X mais pas Y" = INCLURE X, EXCLURE Y
- Comprendre les négations et les nuances du langage naturel
- Estimer un volume réaliste pour chaque objet (en m³)

RÉPONSE ATTENDUE (JSON uniquement):
{
  "detectedObjects": [
    {
      "name": "Canapé 3 places",
      "volume": 1.5,
      "confidence": 0.9,
      "reasoning": "Utilisateur dit clairement qu'il l'emmène"
    }
  ]
}

Ne réponds QUE par du JSON valide, rien d'autre.`;

    try {
      // ✅ UTILISATION DU VRAI SERVICE OPENAI AUDIO
      console.log('🔄 Appel OpenAI GPT-4 RÉEL pour analyse audio...');
      
      // Joindre toutes les phrases en un seul transcript
      const fullTranscript = phrases.join('. ');
      console.log('📝 Transcript complet envoyé à OpenAI:', `"${fullTranscript}"`);
      console.log('📏 Longueur transcript:', fullTranscript.length, 'caractères');
      
      // Vérifier si le service OpenAI sécurisé est prêt
      const aiService = new (await import('@/services/aiService')).AIService();
      
      // Appeler le service OpenAI sécurisé
      const openaiResults = await aiService.analyzeAudioTranscript(fullTranscript);
      
      console.log('✅ Résultats bruts OpenAI Audio:', openaiResults);
      console.log('📊 Nombre d\'objets retournés par OpenAI:', openaiResults?.length || 0);
      
      if (!openaiResults || openaiResults.length === 0) {
        console.warn('⚠️ OpenAI Audio n\'a retourné aucun objet !');
        mobileLog.warn('⚠️ OpenAI Audio - aucun objet détecté dans: "' + fullTranscript + '"');
        return [];
      }
      
      // Convertir au format DetectedObject attendu par ce composant
      const audioDetections: DetectedObject[] = openaiResults.map((item, index) => ({
        id: `openai-audio-${index + 1}`,
        name: item.name,
        confidence: item.confidence,
        volume: item.volume,
        detectionMethod: 'audio' as const,
        audioConfidence: item.confidence,
        volumeAccuracy: 'standard' as const
      }));
      
      console.log(`🤖 OpenAI Audio FINAL: ${audioDetections.length} objets détectés`);
      mobileLog.info(`✅ OpenAI Audio détecté: ${audioDetections.map(obj => obj.name).join(', ')}`);
      return audioDetections;
      
    } catch (error) {
      console.error('❌ Erreur analyse LLM audio:', error);
      return [{
        id: 'audio-fallback',
        name: 'Analyse LLM échouée',
        confidence: 0.3,
        volume: 0.5,
        detectionMethod: 'audio',
        audioConfidence: 0.3,
        volumeAccuracy: 'standard'
      }];
    }
  };

  // 🤖 FUSION INTELLIGENTE AVEC LLM
  const fuseDetections = async (visual: DetectedObject[], audio: DetectedObject[]): Promise<DetectedObject[]> => {
    console.log('🤖 Fusion LLM intelligente');
    
    const fusionPrompt = `Tu es un expert qui fusionne les données de reconnaissance visuelle et audio pour un déménagement.

DONNÉES VISUELLES (ce qui est VU dans la vidéo):
${visual.map(obj => `- ${obj.name} (${obj.volume}m³, confiance: ${Math.round(obj.confidence * 100)}%)`).join('\n')}

DONNÉES AUDIO (ce que l'utilisateur VEUT emmener):
${audio.map(obj => `- ${obj.name} (${obj.volume}m³, confiance: ${Math.round(obj.confidence * 100)}%)`).join('\n')}

CONSIGNE: Créer la liste finale des objets à emmener en fusionnant intelligemment ces données.

RÈGLES DE FUSION:
1. PRIORITÉ aux objets mentionnés dans l'audio (intention utilisateur)
2. Si un objet est VU et MENTIONNÉ → Confiance maximale + volume visuel précis
3. Si un objet est VU mais PAS mentionné → Confiance réduite (peut-être oublié)
4. Si un objet est MENTIONNÉ mais pas vu → Garder quand même (hors champ caméra)
5. Éviter les doublons (même objet détecté 2 fois)
6. Utiliser les descriptions visuelles précises pour les noms finaux

RÉPONSE ATTENDUE (JSON uniquement):
{
  "fusedObjects": [
    {
      "name": "Canapé 3 places en tissu",
      "volume": 1.5,
      "confidence": 0.95,
      "detectionMethod": "fusion",
      "reasoning": "Objet vu ET mentionné par l'utilisateur"
    }
  ]
}

Ne réponds QUE par du JSON valide.`;

    try {
      // ✅ UTILISATION DU VRAI SERVICE OPENAI FUSION
      console.log('🔄 Appel OpenAI GPT-4 RÉEL pour fusion...');
      
      // Convertir les DetectedObject en DetectedItem pour le service OpenAI
      const videoItems = visual.map(obj => ({
        id: obj.id,
        name: obj.name,
        category: 'déménagement',
        quantity: 1,
        volume: obj.volume,
        confidence: obj.confidence,
        detectionMethod: 'video' as const,
        isEdited: false
      }));
      
      const audioItems = audio.map(obj => ({
        id: obj.id,
        name: obj.name,
        category: 'déménagement',
        quantity: 1,
        volume: obj.volume,
        confidence: obj.confidence,
        detectionMethod: 'audio' as const,
        isEdited: false
      }));
      
      // Appeler le vrai service de fusion OpenAI
      const openaiResults = await openaiService.fuseVideoAndAudioAnalysis(videoItems, audioItems);
      
      console.log('✅ Résultats fusion OpenAI:', openaiResults);
      
      // Convertir au format DetectedObject attendu par ce composant
      const fusedDetections: DetectedObject[] = openaiResults.map((item, index) => ({
        id: `openai-fused-${index + 1}`,
        name: item.name,
        confidence: item.confidence,
        volume: item.volume,
        detectionMethod: 'fusion' as const,
        visualConfidence: 0.9,
        audioConfidence: 0.85,
        volumeAccuracy: 'precise' as const
      }));
      
      console.log(`🤖 Fusion OpenAI: ${fusedDetections.length} objets finaux`);
      return fusedDetections.sort((a, b) => b.confidence - a.confidence);
      
    } catch (error) {
      console.error('❌ Erreur fusion LLM:', error);
      // Fallback vers l'ancienne méthode
      return [...visual, ...audio].sort((a, b) => b.confidence - a.confidence);
    }
  };

  // Processus d'analyse complet
  const startAnalysis = async () => {
    mobileLog.info('🚀 DÉMARRAGE ANALYSE COMPLÈTE');
    mobileLog.info('📹 Vidéo blob: ' + (videoBlob?.size || 0) + ' bytes');
    mobileLog.info('🎙️ Phrases audio', audioPhrases);
    mobileLog.info('📊 Nombre de phrases: ' + audioPhrases.length);
    
    console.log('🚀 DÉMARRAGE ANALYSE COMPLÈTE');
    console.log('📹 Vidéo blob:', videoBlob?.size, 'bytes');
    console.log('🎙️ Phrases audio:', audioPhrases);
    console.log('📊 Nombre de phrases:', audioPhrases.length);
    
    if (!videoBlob || audioPhrases.length === 0) {
      const errorMsg = 'Données manquantes: vidéo=' + !!videoBlob + ', phrases=' + audioPhrases.length;
      mobileLog.warn('⚠️ ' + errorMsg);
      console.warn('⚠️ Données manquantes pour l\'analyse:', {
        hasVideo: !!videoBlob,
        phrasesCount: audioPhrases.length
      });
      alert('Veuillez d\'abord enregistrer une vidéo et capturer des phrases audio');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep('frames');

    try {
      // 1. Extraction des frames
      const frames = await extractVideoFrames(videoBlob);
      setExtractedFrames(frames);
      
      if (frames.length === 0) {
        console.warn('⚠️ Aucune frame extraite - analyse visuelle limitée');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 2. Analyse visuelle (même sans frames)
      setAnalysisStep('visual');
      const visualResults = frames.length > 0 
        ? await analyzeFramesVisually(frames, videoBlob)
        : await analyzeFramesVisually([''], videoBlob); // Avec fallback mobile
      setVisualObjects(visualResults);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 3. Analyse audio
      setAnalysisStep('audio');
      const audioResults = await analyzeAudioPhrases(audioPhrases);
      setAudioObjects(audioResults);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 4. Fusion intelligente LLM
      setAnalysisStep('fusion');
      const fusedResults = await fuseDetections(visualResults, audioResults);
      setFusedObjects(fusedResults);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAnalysisStep('complete');
    } catch (error) {
      console.error('Erreur analyse:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const totalVolumeAudio = audioObjects.reduce((sum, obj) => sum + obj.volume, 0);
  const totalVolumeVisual = visualObjects.reduce((sum, obj) => sum + obj.volume, 0);
  const totalVolumeFused = fusedObjects.reduce((sum, obj) => sum + obj.volume, 0);

  return (
    <div className="space-y-6">
      {/* Debug Audio Player */}
      <AudioDebugPlayer 
        audioBlob={audioBlob}
        phrases={audioPhrases}
        title="Debug Audio Enregistré"
      />

      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">🧠 Analyse LLM Avancée : GPT Vision + Audio + Fusion Intelligente</h3>
        
        {/* Statut et contrôles */}
        <div className="mb-6 space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <div className="text-blue-800 font-medium mb-2">🎯 Preuve de concept révolutionnaire</div>
          <div className="text-blue-700 text-sm">
            🧠 <strong>LLM OpenAI GPT-4 Vision</strong> analyse les images ET comprend les phrases naturelles.
            Fusion intelligente des intentions utilisateur avec reconnaissance visuelle précise.
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            📹 Vidéo: {videoBlob ? '✅ Disponible' : '❌ Manquante'} • 
            🎙️ Phrases: {audioPhrases.length} capturées
          </div>
          
          <button
            onClick={startAnalysis}
            disabled={isAnalyzing || !videoBlob || audioPhrases.length === 0}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? '🤖 Analyse en cours...' : '🚀 Démarrer Fusion IA'}
          </button>
        </div>
      </div>

      {/* Progression de l'analyse */}
      {isAnalyzing && (
        <div className="mb-6 p-4 bg-gray-50 border rounded-lg">
          <div className="text-sm font-medium mb-3">Progression de l'analyse :</div>
          <div className="space-y-2">
            <div className={`flex items-center space-x-2 ${analysisStep === 'frames' ? 'text-blue-600' : analysisStep !== 'idle' ? 'text-green-600' : 'text-gray-400'}`}>
              <span>{analysisStep === 'frames' ? '⏳' : analysisStep !== 'idle' ? '✅' : '⚪'}</span>
              <span>1. Extraction des frames vidéo</span>
            </div>
            <div className={`flex items-center space-x-2 ${analysisStep === 'visual' ? 'text-blue-600' : ['audio', 'fusion', 'complete'].includes(analysisStep) ? 'text-green-600' : 'text-gray-400'}`}>
              <span>{analysisStep === 'visual' ? '⏳' : ['audio', 'fusion', 'complete'].includes(analysisStep) ? '✅' : '⚪'}</span>
              <span>2. 🧠 Analyse LLM Vision (GPT-4 Vision API)</span>
            </div>
            <div className={`flex items-center space-x-2 ${analysisStep === 'audio' ? 'text-blue-600' : ['fusion', 'complete'].includes(analysisStep) ? 'text-green-600' : 'text-gray-400'}`}>
              <span>{analysisStep === 'audio' ? '⏳' : ['fusion', 'complete'].includes(analysisStep) ? '✅' : '⚪'}</span>
              <span>3. 🧠 Analyse LLM Audio (GPT-4 compréhension naturelle)</span>
            </div>
            <div className={`flex items-center space-x-2 ${analysisStep === 'fusion' ? 'text-blue-600' : analysisStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
              <span>{analysisStep === 'fusion' ? '⏳' : analysisStep === 'complete' ? '✅' : '⚪'}</span>
              <span>4. 🧠 Fusion LLM Intelligente (Résolution conflits)</span>
            </div>
          </div>
        </div>
      )}

      {/* Frames extraites */}
      {extractedFrames.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-3">📸 Frames extraites de la vidéo ({extractedFrames.length}) :</h4>
          <div className="grid grid-cols-3 gap-2">
            {extractedFrames.map((frame, index) => (
              <img 
                key={index} 
                src={frame} 
                alt={`Frame ${index + 1}`}
                className="w-full h-20 object-cover rounded border"
              />
            ))}
          </div>
        </div>
      )}

      {/* Résultats comparatifs */}
      {analysisStep === 'complete' && (
        <div className="space-y-6">
          {/* Comparaison des résultats */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Audio seul */}
            <div className="border rounded-lg p-4">
              <h5 className="font-medium text-orange-600 mb-3">🎙️ Audio seul</h5>
              <div className="space-y-2 text-sm">
                {audioObjects.map(obj => (
                  <div key={obj.id} className="flex justify-between">
                    <span>{obj.name}</span>
                    <span>{obj.volume.toFixed(2)}m³</span>
                  </div>
                ))}
                <div className="border-t pt-2 font-medium">
                  Total: {totalVolumeAudio.toFixed(2)}m³
                </div>
              </div>
            </div>

            {/* Visuel seul */}
            <div className="border rounded-lg p-4">
              <h5 className="font-medium text-blue-600 mb-3">📹 Visuel seul</h5>
              <div className="space-y-2 text-sm">
                {visualObjects.map(obj => (
                  <div key={obj.id} className="flex justify-between">
                    <span>{obj.name}</span>
                    <span>{obj.volume.toFixed(2)}m³</span>
                  </div>
                ))}
                <div className="border-t pt-2 font-medium">
                  Total: {totalVolumeVisual.toFixed(2)}m³
                </div>
              </div>
            </div>

            {/* Fusion IA */}
            <div className="border-2 border-purple-300 bg-purple-50 rounded-lg p-4">
              <h5 className="font-medium text-purple-600 mb-3">🤖 Fusion IA</h5>
              <div className="space-y-2 text-sm">
                {fusedObjects.map(obj => (
                  <div key={obj.id} className="flex justify-between items-center">
                    <span className="flex items-center">
                      {obj.name}
                      {obj.detectionMethod === 'fusion' && <span className="ml-1 text-purple-500">⭐</span>}
                    </span>
                    <div className="text-right">
                      <div>{obj.volume.toFixed(2)}m³</div>
                      <div className="text-xs text-purple-600">{Math.round(obj.confidence * 100)}%</div>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-2 font-bold text-purple-600">
                  Total: {totalVolumeFused.toFixed(2)}m³
                </div>
              </div>
            </div>
          </div>

          {/* Amélioration apportée */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h5 className="font-medium text-green-800 mb-3">🎯 Amélioration de la fusion IA :</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-green-700 font-medium">Précision des objets :</div>
                <div>• {fusedObjects.filter(obj => obj.detectionMethod === 'fusion').length} objets confirmés audio+visuel</div>
                <div>• Confiance moyenne: {fusedObjects.length > 0 ? Math.round((fusedObjects.reduce((sum, obj) => sum + obj.confidence, 0) / fusedObjects.length) * 100) : 0}%</div>
              </div>
              <div>
                <div className="text-green-700 font-medium">Précision du volume :</div>
                <div>• Ajustement visuel des tailles</div>
                <div>• Détection d'objets manqués à l'oral</div>
              </div>
            </div>
          </div>

          {/* TABLEAU FINAL RÉCAPITULATIF */}
          <div className="p-6 bg-purple-50 border-2 border-purple-300 rounded-lg">
            <h4 className="text-xl font-bold text-purple-800 mb-4">📋 TABLEAU FINAL - ITEMS DÉTECTÉS</h4>
            
            <div className="bg-white rounded border overflow-hidden">
              <table className="w-full">
                <thead className="bg-purple-100">
                  <tr>
                    <th className="text-left p-3 font-medium">Objet</th>
                    <th className="text-center p-3 font-medium">Volume</th>
                    <th className="text-center p-3 font-medium">Confiance</th>
                    <th className="text-center p-3 font-medium">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {fusedObjects.map((obj, index) => (
                    <tr key={obj.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-3">
                        <div className="flex items-center">
                          {obj.detectionMethod === 'fusion' && <span className="mr-2">⭐</span>}
                          <span className="font-medium">{obj.name}</span>
                        </div>
                      </td>
                      <td className="text-center p-3 font-mono">
                        {obj.volume.toFixed(2)}m³
                      </td>
                      <td className="text-center p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          obj.confidence >= 0.8 ? 'bg-green-100 text-green-800' :
                          obj.confidence >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {Math.round(obj.confidence * 100)}%
                        </span>
                      </td>
                      <td className="text-center p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          obj.detectionMethod === 'fusion' ? 'bg-purple-100 text-purple-800' :
                          obj.detectionMethod === 'video' ? 'bg-blue-100 text-blue-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {obj.detectionMethod === 'fusion' ? '🤖 Fusion' :
                           obj.detectionMethod === 'video' ? '📹 Visuel' : '🎙️ Audio'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-purple-100">
                  <tr>
                    <td className="p-3 font-bold text-purple-800">TOTAL GÉNÉRAL</td>
                    <td className="text-center p-3 font-bold text-purple-800 font-mono">
                      {totalVolumeFused.toFixed(2)}m³
                    </td>
                    <td className="text-center p-3 font-bold text-purple-800">
                      {fusedObjects.length} objets
                    </td>
                    <td className="text-center p-3 font-bold text-purple-800">
                      🎯 IA Fusion
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-4 text-sm text-purple-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-medium">🎙️ Audio seul: {totalVolumeAudio.toFixed(2)}m³</div>
                  <div className="font-medium">📹 Visuel seul: {totalVolumeVisual.toFixed(2)}m³</div>
                </div>
                <div>
                  <div className="font-bold text-purple-800">🤖 Fusion IA: {totalVolumeFused.toFixed(2)}m³</div>
                  <div className="text-xs">⭐ = Objet confirmé audio + visuel</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
