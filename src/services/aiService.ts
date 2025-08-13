'use client';

import { DetectedItem, AIAnalysisResult } from '@/types';
import { secureOpenaiService } from './secureOpenaiService';
import { frameExtractionService } from './frameExtractionService';

// Service pour analyser les vidéos avec IA
export class AIService {
  private static instance: AIService;
  private mockMode: boolean = process.env.NEXT_PUBLIC_MOCK_AI_RESPONSES === 'true';

  constructor() {
    // Singleton pattern
    if (AIService.instance) {
      return AIService.instance;
    }
    AIService.instance = this;
  }

  /**
   * Analyser une frame vidéo pour détecter des objets
   */
  async analyzeVideoFrame(frameData: string): Promise<DetectedItem[]> {
    if (this.mockMode) {
      return this.getMockVideoAnalysis();
    }

    try {
      // Utiliser le service OpenAI sécurisé via backend dodomove
      if (secureOpenaiService.isReady()) {
        console.log('🔒 Utilisation de l\'API OpenAI sécurisée via backend...');
        return await secureOpenaiService.analyzeVideoFrame(frameData);
      } else {
        console.warn('⚠️ Service OpenAI sécurisé non disponible, fallback vers simulation...');
        return this.getMockVideoAnalysis();
      }
    } catch (error) {
      console.error('❌ Erreur analyse vidéo sécurisée, fallback vers simulation:', error);
      return this.getMockVideoAnalysis();
    }
  }

  /**
   * Analyser un transcript audio pour extraire les intentions
   */
  async analyzeAudioTranscript(transcript: string): Promise<DetectedItem[]> {
    if (!transcript.trim()) return [];

    if (this.mockMode) {
      return this.getMockAudioAnalysis(transcript);
    }

    try {
      // Utiliser le service OpenAI sécurisé via backend dodomove
      if (secureOpenaiService.isReady()) {
        console.log('🔒 Utilisation de l\'API OpenAI audio sécurisée via backend...');
        return await secureOpenaiService.analyzeAudioTranscript(transcript);
      } else {
        console.warn('⚠️ Service OpenAI sécurisé non disponible, fallback vers simulation...');
        return this.getMockAudioAnalysis(transcript);
      }
    } catch (error) {
      console.error('❌ Erreur analyse audio sécurisée, fallback vers simulation:', error);
      return this.getMockAudioAnalysis(transcript);
    }
  }

  /**
   * Combiner les résultats vidéo et audio
   */
  async combineAnalysis(
    videoItems: DetectedItem[], 
    audioItems: DetectedItem[]
  ): Promise<AIAnalysisResult> {
    const startTime = Date.now();
    
    let combinedItems: DetectedItem[];

    try {
      // Utiliser la fusion IA intelligente sécurisée si disponible
      if (!this.mockMode && secureOpenaiService.isReady()) {
        console.log('🔒 Fusion intelligente avec OpenAI sécurisée...');
        combinedItems = await secureOpenaiService.fuseVideoAndAudioAnalysis(videoItems, audioItems);
      } else {
        console.log('🔄 Fusion simple (mode simulation)...');
        combinedItems = this.mergeDetectedItems(videoItems, audioItems);
      }
    } catch (error) {
      console.error('❌ Erreur fusion IA sécurisée, fallback vers fusion simple:', error);
      combinedItems = this.mergeDetectedItems(videoItems, audioItems);
    }
    
    // Calculer le score de confiance global
    const totalConfidence = combinedItems.reduce((sum, item) => sum + item.confidence, 0);
    const averageConfidence = combinedItems.length > 0 ? totalConfidence / combinedItems.length : 0;
    
    const processingTime = Date.now() - startTime;
    
    return {
      items: combinedItems,
      confidence: averageConfidence,
      processingTime
    };
  }

  /**
   * Extraire une frame d'une vidéo pour l'analyse - VERSION INTELLIGENTE
   * Utilise automatiquement la meilleure méthode (Cloudinary ou native)
   */
  async extractVideoFrame(videoBlob: Blob): Promise<string> {
    console.log('🎬 Extraction frame intelligente...');
    
    try {
      const result = await frameExtractionService.extractFrame(videoBlob);
      
      if (result.success && result.frameData) {
        console.log(`✅ Frame extraite via ${result.method} en ${result.processingTime}ms`);
        if (result.cost) {
          console.log(`💰 Coût: $${result.cost}`);
        }
        return result.frameData;
      } else {
        console.error('❌ Échec extraction frame:', result.error);
        throw new Error(result.error || 'Extraction frame échouée');
      }
      
    } catch (error) {
      console.error('❌ Erreur service extraction frame:', error);
      throw error;
    }
  }

  /**
   * Transcrire audio avec Whisper - VERSION SÉCURISÉE
   * Utilise le backend sécurisé au lieu d'appels directs
   */
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    console.log('🎙️ Transcription audio sécurisée...');
    
    try {
      // Utiliser le service sécurisé
      if (secureOpenaiService.isReady()) {
        console.log('🔒 Utilisation Whisper sécurisé via backend...');
        return await secureOpenaiService.transcribeAudio(audioBlob);
      } else {
        console.warn('⚠️ Service Whisper sécurisé non disponible');
        return '';
      }
    } catch (error) {
      console.error('❌ Erreur transcription sécurisée:', error);
      return '';
    }
  }

  /**
   * Données simulées pour l'analyse vidéo
   */
  private getMockVideoAnalysis(): DetectedItem[] {
    const mockItems = [
      {
        id: 'video-1',
        name: 'Canapé 3 places',
        category: 'salon',
        quantity: 1,
        volume: 1.5,
        confidence: 0.9,
        detectionMethod: 'video' as const,
        videoTimestamp: Date.now(),
        isEdited: false
      },
      {
        id: 'video-2',
        name: 'Table basse',
        category: 'salon',
        quantity: 1,
        volume: 0.3,
        confidence: 0.85,
        detectionMethod: 'video' as const,
        videoTimestamp: Date.now(),
        isEdited: false
      },
      {
        id: 'video-3',
        name: 'Télévision',
        category: 'salon',
        quantity: 1,
        volume: 0.2,
        confidence: 0.95,
        detectionMethod: 'video' as const,
        videoTimestamp: Date.now(),
        isEdited: false
      }
    ];

    // Retourner aléatoirement 1-3 objets
    const count = Math.floor(Math.random() * 3) + 1;
    return mockItems.slice(0, count);
  }

  /**
   * Analyse simulée basée sur le transcript audio
   */
  private getMockAudioAnalysis(transcript: string): DetectedItem[] {
    const items: DetectedItem[] = [];
    const lowerTranscript = transcript.toLowerCase();

    // Détection basée sur les mots-clés
    const keywords = {
      'canapé': { name: 'Canapé', category: 'salon', volume: 1.5 },
      'table': { name: 'Table', category: 'salon', volume: 0.5 },
      'chaise': { name: 'Chaise', category: 'salon', volume: 0.2 },
      'armoire': { name: 'Armoire', category: 'chambre', volume: 2.0 },
      'lit': { name: 'Lit', category: 'chambre', volume: 1.2 },
      'frigo': { name: 'Réfrigérateur', category: 'cuisine', volume: 1.0 },
      'carton': { name: 'Cartons', category: 'divers', volume: 0.1 }
    };

    Object.entries(keywords).forEach(([keyword, data], index) => {
      if (lowerTranscript.includes(keyword)) {
        items.push({
          id: `audio-${index}`,
          name: data.name,
          category: data.category,
          quantity: 1,
          volume: data.volume,
          confidence: 0.8,
          detectionMethod: 'audio',
          audioMention: transcript,
          isEdited: false
        });
      }
    });

    return items;
  }

  /**
   * Fusionner les objets détectés par vidéo et audio
   */
  private mergeDetectedItems(videoItems: DetectedItem[], audioItems: DetectedItem[]): DetectedItem[] {
    const merged: DetectedItem[] = [...videoItems];
    
    audioItems.forEach(audioItem => {
      // Chercher un objet similaire dans les résultats vidéo
      const existingItem = merged.find(item => 
        item.name.toLowerCase().includes(audioItem.name.toLowerCase()) ||
        audioItem.name.toLowerCase().includes(item.name.toLowerCase())
      );
      
      if (existingItem) {
        // Combiner les confidences et privilégier la mention audio
        existingItem.confidence = Math.max(existingItem.confidence, audioItem.confidence);
        existingItem.audioMention = audioItem.audioMention;
      } else {
        // Ajouter le nouvel objet détecté par audio
        merged.push(audioItem);
      }
    });
    
    return merged;
  }
}

// Exporter l'instance singleton
export const aiService = new AIService();
