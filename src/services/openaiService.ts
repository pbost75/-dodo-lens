'use client';

import { DetectedItem } from '@/types';

export class OpenAIService {
  private static instance: OpenAIService;
  private openai: any = null;
  private isConfigured: boolean = false;
  private isInitializing: boolean = false;

  constructor() {
    // Singleton pattern
    if (OpenAIService.instance) {
      return OpenAIService.instance;
    }
    OpenAIService.instance = this;

    // Initialiser OpenAI uniquement côté client
    if (typeof window !== 'undefined') {
      this.initializeOpenAI();
    }
  }

  private async initializeOpenAI() {
    if (this.isInitializing) return;
    this.isInitializing = true;

    console.log('🔄 Initialisation du service OpenAI...');

    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'sk-your-openai-api-key-here') {
      console.warn('⚠️ Clé API OpenAI manquante ou non configurée');
      this.isConfigured = false;
      this.isInitializing = false;
      return;
    }

    try {
      // Import dynamique du module OpenAI
      console.log('📦 Chargement du module OpenAI...');
      const OpenAIModule = await import('openai');
      const OpenAI = OpenAIModule.default;

      console.log('🔑 Configuration du client OpenAI...');
      this.openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Nécessaire pour le client-side
      });
      
      this.isConfigured = true;
      console.log('✅ Service OpenAI initialisé avec succès');
    } catch (error) {
      console.error('❌ Erreur initialisation OpenAI:', error);
      this.isConfigured = false;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Vérifier si le service est configuré
   */
  isReady(): boolean {
    return this.isConfigured;
  }

  /**
   * Analyser une frame vidéo avec GPT-4 Vision
   */
  async analyzeVideoFrame(frameDataUrl: string): Promise<DetectedItem[]> {
    if (!this.isConfigured) {
      throw new Error('Service OpenAI non configuré');
    }

    try {
      console.log('🔄 Analyse frame avec GPT-4o (vision intégrée)...');
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Tu es un expert en déménagement. Analyse cette image d'intérieur et identifie les objets visibles.

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
              },
              {
                type: "image_url",
                image_url: {
                  url: frameDataUrl
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.1
      });

      console.log('📦 Réponse brute OpenAI:', response);
      
      const content = response.choices[0]?.message?.content;
      console.log('📝 Contenu de la réponse:', content);
      
      if (!content) {
        console.error('❌ Aucun contenu dans la réponse:', response);
        throw new Error('Réponse vide de OpenAI - aucun contenu retourné');
      }

      if (content.trim() === '') {
        console.error('❌ Contenu vide dans la réponse');
        throw new Error('Réponse vide de OpenAI - contenu vide');
      }

      // Parser la réponse JSON avec gestion d'erreur robuste
      let parsed;
      try {
        parsed = JSON.parse(content);
        console.log('✅ JSON parsé avec succès:', parsed);
      } catch (parseError) {
        console.error('❌ Erreur parsing JSON:', parseError);
        console.error('📝 Contenu reçu:', content);
        
        // Essayer de nettoyer le JSON (supprimer backticks, etc.)
        const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        console.log('🧹 Contenu nettoyé:', cleanContent);
        
        try {
          parsed = JSON.parse(cleanContent);
          console.log('✅ JSON nettoyé parsé avec succès:', parsed);
        } catch (secondParseError) {
          console.error('❌ Échec parsing JSON même après nettoyage:', secondParseError);
          // Retourner un objet d'exemple en cas d'échec total
          return [{
            id: `fallback-${Date.now()}`,
            name: 'Objet détecté (fallback)',
            category: 'divers',
            quantity: 1,
            volume: 0.1,
            confidence: 0.5,
            detectionMethod: 'video' as const,
            videoTimestamp: Date.now(),
            isEdited: false
          }];
        }
      }

      const objects = parsed.detectedObjects || parsed.objects || [];
      console.log('📋 Objets extraits:', objects);

      if (!Array.isArray(objects)) {
        console.warn('⚠️ Les objets ne sont pas un array, conversion...');
        return [{
          id: `single-${Date.now()}`,
          name: 'Objet unique détecté',
          category: 'divers',
          quantity: 1,
          volume: 0.1,
          confidence: 0.5,
          detectionMethod: 'video' as const,
          videoTimestamp: Date.now(),
          isEdited: false
        }];
      }

      if (objects.length === 0) {
        console.warn('⚠️ Aucun objet détecté, retour objet d\'exemple...');
        return [{
          id: `example-${Date.now()}`,
          name: 'Objet d\'exemple',
          category: 'salon',
          quantity: 1,
          volume: 0.2,
          confidence: 0.6,
          detectionMethod: 'video' as const,
          videoTimestamp: Date.now(),
          isEdited: false
        }];
      }

      // Convertir au format DetectedItem
      return objects.map((obj: any, index: number) => ({
        id: `video-${Date.now()}-${index}`,
        name: obj.name || 'Objet inconnu',
        category: obj.category || 'divers',
        quantity: obj.quantity || 1,
        volume: obj.volume || 0.1,
        confidence: obj.confidence || 0.5,
        detectionMethod: 'video' as const,
        videoTimestamp: Date.now(),
        isEdited: false
      }));

    } catch (error) {
      console.error('❌ Erreur analyse GPT-4 Vision:', error);
      throw error;
    }
  }

  /**
   * Analyser du texte audio avec GPT-4
   */
  async analyzeAudioTranscript(transcript: string): Promise<DetectedItem[]> {
    if (!this.isConfigured) {
      throw new Error('Service OpenAI non configuré');
    }

    try {
      console.log('🔄 Analyse transcript avec GPT-4...');
      console.log('📝 Transcript reçu:', `"${transcript}"`);
      console.log('📏 Longueur:', transcript.length, 'caractères');
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: `Tu es un expert en déménagement qui analyse les phrases prononcées par un utilisateur filmant son intérieur.

CONSIGNE: Extrait UNIQUEMENT les objets que l'utilisateur veut EMMENER lors de son déménagement.

TRANSCRIPT À ANALYSER:
"${transcript}"

RÈGLES D'ANALYSE:
- "Je prends", "je veux", "j'emmène", "ça part" = INCLURE l'objet
- "Je laisse", "pas", "j'ignore", "sans", "ça reste" = EXCLURE l'objet  
- "Je prends X mais pas Y" = INCLURE X, EXCLURE Y
- Comprendre les négations et nuances du langage naturel
- Estimer un volume réaliste pour chaque objet (en m³)

RÉPONSE ATTENDUE (JSON uniquement):
{
  "detectedObjects": [
    {
      "name": "Canapé 3 places",
      "category": "salon", 
      "volume": 1.5,
      "confidence": 0.9,
      "quantity": 1,
      "reasoning": "Utilisateur dit clairement qu'il l'emmène"
    }
  ]
}

Ne réponds QUE par du JSON valide, rien d'autre.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      });

      console.log('📦 Réponse brute GPT-4 Audio:', response);
      
      const content = response.choices[0]?.message?.content;
      console.log('📝 Contenu extrait:', content);
      
      if (!content) {
        throw new Error('Réponse vide de OpenAI');
      }

      // Parser la réponse JSON
      const parsed = JSON.parse(content);
      console.log('🔧 JSON parsé:', parsed);
      
      const objects = parsed.detectedObjects || [];
      console.log('📋 Objets extraits:', objects);
      console.log('📊 Nombre d\'objets:', objects.length);

      if (objects.length === 0) {
        console.warn('⚠️ GPT-4 Audio a retourné une liste vide d\'objets !');
        console.warn('📝 Pour le transcript:', transcript);
      }

      // Convertir au format DetectedItem
      const result = objects.map((obj: any, index: number) => ({
        id: `audio-${Date.now()}-${index}`,
        name: obj.name || 'Objet inconnu',
        category: obj.category || 'divers',
        quantity: obj.quantity || 1,
        volume: obj.volume || 0.1,
        confidence: obj.confidence || 0.5,
        detectionMethod: 'audio' as const,
        audioMention: transcript,
        isEdited: false
      }));
      
      console.log('✅ Résultat final GPT-4 Audio:', result);
      return result;

    } catch (error) {
      console.error('❌ Erreur analyse GPT-4 Audio:', error);
      throw error;
    }
  }



  /**
   * Transcrire un fichier audio avec Whisper API
   */
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    if (!this.openai) {
      console.warn('OpenAI non initialisé pour Whisper');
      return '';
    }

    try {
      console.log('🎙️ Envoi audio à Whisper API...', audioBlob.size, 'bytes');
      
      // Créer un fichier FormData pour Whisper
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'fr');
      formData.append('response_format', 'text');

      // Appel direct à l'API Whisper
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Whisper API error: ${response.status}`);
      }

      const transcription = await response.text();
      console.log('✅ Transcription Whisper reçue:', transcription);
      
      return transcription.trim();
      
    } catch (error) {
      console.error('❌ Erreur Whisper API:', error);
      return '';
    }
  }

  /**
   * Combiner et résoudre les conflits entre vidéo et audio
   */
  async fuseVideoAndAudioAnalysis(
    videoItems: DetectedItem[], 
    audioItems: DetectedItem[]
  ): Promise<DetectedItem[]> {
    if (!this.isConfigured) {
      throw new Error('Service OpenAI non configuré');
    }

    try {
      console.log('🔄 Fusion intelligente vidéo + audio...');
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: `Tu es un expert qui doit combiner intelligemment des analyses vidéo et audio pour un déménagement.

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

RÉPONSE ATTENDUE (JSON uniquement):
{
  "fusedObjects": [
    {
      "name": "Canapé 3 places",
      "category": "salon",
      "volume": 1.5,
      "confidence": 0.9,
      "quantity": 1,
      "sources": ["video", "audio"],
      "reasoning": "Détecté en vidéo et confirmé en audio"
    }
  ]
}

Ne réponds QUE par du JSON valide, rien d'autre.`
          }
        ],
        max_tokens: 2000,
        temperature: 0.1
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Réponse vide de OpenAI');
      }

      // Parser la réponse JSON
      const parsed = JSON.parse(content);
      const objects = parsed.fusedObjects || [];

      // Convertir au format DetectedItem
      return objects.map((obj: any, index: number) => ({
        id: `fused-${Date.now()}-${index}`,
        name: obj.name || 'Objet inconnu',
        category: obj.category || 'divers',
        quantity: obj.quantity || 1,
        volume: obj.volume || 0.1,
        confidence: obj.confidence || 0.5,
        detectionMethod: 'manual' as const, // Fusion = manuel
        isEdited: false
      }));

    } catch (error) {
      console.error('❌ Erreur fusion IA:', error);
      // En cas d'erreur, retourner la combinaison simple
      return [...videoItems, ...audioItems];
    }
  }
}

// Export de l'instance singleton
export const openaiService = new OpenAIService();
