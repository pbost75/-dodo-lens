'use client';

import { DetectedItem } from '@/types';

export class SecureOpenAIService {
  private static instance: SecureOpenAIService;
  private backendUrl: string = '';
  private isConfigured: boolean = false;

  constructor() {
    // Singleton pattern
    if (SecureOpenAIService.instance) {
      return SecureOpenAIService.instance;
    }
    SecureOpenAIService.instance = this;

    // Configuration backend URL - utilise le backend centralisé dodomove
    this.backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://web-production-7b738.up.railway.app';
    
    console.log('🔒 Service OpenAI sécurisé initialisé avec backend dodomove:', this.backendUrl);
    
    // Vérifier la configuration du backend au démarrage
    this.checkBackendConfig();
  }

  /**
   * Vérifier la configuration du backend
   */
  private async checkBackendConfig() {
    try {
      console.log('🔍 Vérification configuration backend OpenAI...');
      const response = await fetch(`${this.backendUrl}/api/dodo-lens/stats`);
      
      if (response.ok) {
        const data = await response.json();
        this.isConfigured = data.openai?.configured || false;
        console.log('✅ Backend OpenAI configuré:', this.isConfigured);
        
        if (!this.isConfigured) {
          console.warn('⚠️ Backend détecté mais OpenAI non configuré');
        }
      } else {
        console.warn('⚠️ Backend stats non accessible:', response.status);
        this.isConfigured = false;
      }
    } catch (error) {
      console.error('❌ Erreur vérification backend stats:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Vérifier si le service est configuré
   */
  isReady(): boolean {
    return this.isConfigured;
  }

  /**
   * Analyser une frame vidéo via le backend sécurisé dodomove
   */
  async analyzeVideoFrame(frameDataUrl: string): Promise<DetectedItem[]> {
    try {
      console.log('🔒 Analyse frame via backend dodomove sécurisé...');
      
      const response = await fetch(`${this.backendUrl}/api/dodo-lens/analyze-vision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: frameDataUrl,
          prompt: `Tu es un expert en déménagement. Analyse cette image d'intérieur et identifie les objets visibles.

CONSIGNES IMPORTANTES:
- Si l'image est trop simple (pixel blanc, vide), réponds avec au moins 1 objet d'exemple
- Identifie les meubles, électroménager, décoration visibles
- Estime un volume réaliste en m³ pour chaque objet
- Donne un niveau de confiance entre 0 et 1

FORMAT DE RÉPONSE OBLIGATOIRE (JSON strict):
{
  "detectedObjects": [
    {
      "name": "Table basse",
      "category": "salon",
      "volume": 0.3,
      "confidence": 0.8,
      "quantity": 1
    }
  ]
}

IMPORTANT: Réponds UNIQUEMENT avec du JSON valide, aucun autre texte.`
        })
      });

      console.log('📡 Réponse backend status:', response.status);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Limite quotidienne atteinte (10 analyses/jour). Réessayez demain.');
        }
        if (response.status === 503) {
          console.warn('⚠️ Backend OpenAI pas encore configuré');
          throw new Error('Service temporairement indisponible. Configuration OpenAI en cours.');
        }
        throw new Error(`Erreur backend: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Réponse backend dodomove reçue:', result);

      // Le backend retourne { success: true, result: "...", usage: {...} }
      if (result.success && result.result) {
        try {
          // Parser le JSON retourné par OpenAI
          const parsed = JSON.parse(result.result);
          const objects = parsed.detectedObjects || parsed.objects || [];
          return this.formatDetectedItems(objects, 'video');
        } catch (parseError) {
          console.error('❌ Erreur parsing réponse OpenAI:', parseError);
          console.log('📝 Contenu reçu:', result.result);
          return this.getFallbackItems('video');
        }
      } else {
        console.warn('⚠️ Format de réponse backend inattendu:', result);
        return this.getFallbackItems('video');
      }

    } catch (error) {
      console.error('❌ Erreur appel backend dodomove vision:', error);
      
      // Propager les erreurs importantes
      if (error instanceof Error && 
          (error.message.includes('limite quotidienne') || 
           error.message.includes('temporairement indisponible'))) {
        throw error;
      }
      
      // Fallback pour autres erreurs
      return this.getFallbackItems('video');
    }
  }

  /**
   * Transcrire audio avec Whisper via le backend sécurisé
   */
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      console.log('🎙️ Transcription audio via backend sécurisé...', audioBlob.size, 'bytes');
      
      // Créer un FormData pour l'upload d'audio
      const formData = new FormData();
      formData.append('audioFile', audioBlob, 'audio.webm'); // Backend attend 'audioFile'
      
      const response = await fetch(`${this.backendUrl}/api/dodo-lens/analyze-audio`, {
        method: 'POST',
        body: formData // Pas de Content-Type, laisse le navigateur gérer multipart/form-data
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Limite quotidienne atteinte (10 analyses/jour). Réessayez demain.');
        }
        if (response.status === 503) {
          console.warn('⚠️ Backend Whisper pas encore configuré');
          throw new Error('Service temporairement indisponible. Configuration Whisper en cours.');
        }
        throw new Error(`Erreur backend Whisper: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Réponse backend Whisper reçue:', result);

      if (result.success && result.transcript) {
        return result.transcript.trim(); // Backend retourne 'transcript', pas 'transcription'
      } else {
        console.warn('⚠️ Transcription vide du backend:', result);
        return '';
      }
      
    } catch (error) {
      console.error('❌ Erreur transcription backend:', error);
      
      // Fallback: retourner vide pour permettre analyse visuelle seule
      return '';
    }
  }

  /**
   * Analyser du texte audio via GPT-4 (pas Whisper pour l'instant)
   */
  async analyzeAudioTranscript(transcript: string): Promise<DetectedItem[]> {
    try {
      console.log('🔒 Analyse transcript via backend dodomove...');
      console.log('📝 Transcript à analyser:', transcript);
      
      // Pour l'instant, on utilise la route fusion avec des données adaptées
      const response = await fetch(`${this.backendUrl}/api/dodo-lens/analyze-fusion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visualResults: [], // Pas de résultats visuels pour analyse audio pure
          audioTranscript: transcript,
          prompt: `Tu es un expert en déménagement qui analyse les phrases prononcées par un utilisateur filmant son intérieur.

CONSIGNE: Extrait UNIQUEMENT les objets que l'utilisateur veut EMMENER lors de son déménagement.

TRANSCRIPT À ANALYSER:
"${transcript}"

RÈGLES D'ANALYSE:
- "Je prends", "je veux", "j'emmène", "ça part" = INCLURE l'objet
- "Je laisse", "pas", "j'ignore", "sans", "ça reste" = EXCLURE l'objet  
- "Je prends X mais pas Y" = INCLURE X, EXCLURE Y
- Comprendre les négations et nuances du langage naturel
- Estimer un volume réaliste pour chaque objet (en m³)

Retourne UNIQUEMENT un JSON valide avec cette structure:
{
  "objects": [
    {
      "name": "Canapé 3 places",
      "category": "salon", 
      "volume": 1.5,
      "confidence": 0.9,
      "quantity": 1,
      "source": "audio"
    }
  ],
  "totalVolume": 1.5,
  "confidence": 0.9
}

Ne réponds QUE par du JSON valide, rien d'autre.`
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Limite quotidienne atteinte. Réessayez demain.');
        }
        if (response.status === 503) {
          throw new Error('Service temporairement indisponible.');
        }
        throw new Error(`Erreur backend audio: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Réponse backend dodomove audio reçue:', result);

      if (result.success && result.result) {
        try {
          const parsed = JSON.parse(result.result);
          const objects = parsed.objects || [];
          return this.formatDetectedItems(objects, 'audio', transcript);
        } catch (parseError) {
          console.error('❌ Erreur parsing réponse audio:', parseError);
          return [];
        }
      }

      return [];

    } catch (error) {
      console.error('❌ Erreur appel backend dodomove audio:', error);
      
      if (error instanceof Error && 
          (error.message.includes('limite quotidienne') || 
           error.message.includes('temporairement indisponible'))) {
        throw error;
      }
      
      return []; // Pour l'audio, on peut retourner une liste vide
    }
  }

  /**
   * Combiner vidéo et audio via le backend dodomove
   */
  async fuseVideoAndAudioAnalysis(
    videoItems: DetectedItem[], 
    audioItems: DetectedItem[]
  ): Promise<DetectedItem[]> {
    try {
      console.log('🔒 Fusion vidéo/audio via backend dodomove...');
      
      const response = await fetch(`${this.backendUrl}/api/dodo-lens/analyze-fusion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visualResults: videoItems,
          audioTranscript: audioItems.map(item => 
            `${item.name} (${item.audioMention || 'mentionné'})`
          ).join(', '),
          prompt: `Tu es un expert qui doit combiner intelligemment des analyses vidéo et audio pour un déménagement.

OBJETS DÉTECTÉS EN VIDÉO:
${JSON.stringify(videoItems, null, 2)}

OBJETS DÉTECTÉS EN AUDIO:
${JSON.stringify(audioItems, null, 2)}

CONSIGNES:
- L'audio est PRIORITAIRE : si l'utilisateur dit "je ne prends pas X", alors X ne doit PAS être dans le résultat final
- Combine les objets similaires (ex: "canapé" vidéo + "ce canapé" audio = 1 seul objet)
- Résous les conflits en faveur des intentions audio explicites
- Garde un score de confiance réaliste
- Évite les doublons

Retourne UNIQUEMENT un JSON valide avec cette structure:
{
  "objects": [
    {
      "name": "Canapé 3 places",
      "category": "salon",
      "volume": 1.5,
      "confidence": 0.9,
      "quantity": 1,
      "source": "fusion"
    }
  ],
  "totalVolume": 1.5,
  "confidence": 0.9
}

Ne réponds QUE par du JSON valide, rien d'autre.`
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur backend fusion: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Réponse backend dodomove fusion reçue:', result);

      if (result.success && result.result) {
        try {
          const parsed = JSON.parse(result.result);
          const objects = parsed.objects || [];
          return this.formatDetectedItems(objects, 'manual');
        } catch (parseError) {
          console.error('❌ Erreur parsing fusion:', parseError);
          return [...videoItems, ...audioItems];
        }
      }

      return [...videoItems, ...audioItems];

    } catch (error) {
      console.error('❌ Erreur fusion backend dodomove:', error);
      // Fallback : combiner simplement les deux listes
      return [...videoItems, ...audioItems];
    }
  }



  /**
   * Formatter les objets au format DetectedItem
   */
  private formatDetectedItems(objects: any[], detectionMethod: 'video' | 'audio' | 'manual', audioMention?: string): DetectedItem[] {
    if (!Array.isArray(objects)) {
      console.warn('⚠️ Objects n\'est pas un array:', objects);
      return [];
    }

    return objects.map((obj: any, index: number) => ({
      id: `${detectionMethod}-${Date.now()}-${index}`,
      name: obj.name || 'Objet inconnu',
      category: obj.category || 'divers',
      quantity: obj.quantity || 1,
      volume: obj.volume || 0.1,
      confidence: obj.confidence || 0.5,
      detectionMethod: detectionMethod,
      ...(detectionMethod === 'video' && { videoTimestamp: Date.now() }),
      ...(detectionMethod === 'audio' && audioMention && { audioMention }),
      isEdited: false
    }));
  }

  /**
   * Objets de fallback en cas d'erreur
   */
  private getFallbackItems(method: 'video' | 'audio'): DetectedItem[] {
    if (method === 'video') {
      return [{
        id: `fallback-video-${Date.now()}`,
        name: 'Objet détecté (mode dégradé)',
        category: 'salon',
        quantity: 1,
        volume: 0.2,
        confidence: 0.5,
        detectionMethod: 'video',
        videoTimestamp: Date.now(),
        isEdited: false
      }];
    }
    return []; // Pour l'audio, on peut retourner vide
  }
}

// Export de l'instance singleton
export const secureOpenaiService = new SecureOpenAIService();
