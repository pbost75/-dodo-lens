/**
 * Service d'extraction de frames intelligent
 * Choisit automatiquement la meilleure méthode selon l'environnement
 */

interface FrameExtractionResult {
  success: boolean;
  frameData?: string; // Base64
  method: 'native' | 'cloudinary' | 'backend';
  cost?: number;
  processingTime?: number;
  error?: string;
}

interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  apiKey?: string;
}

export class FrameExtractionService {
  private static instance: FrameExtractionService;
  private cloudinaryConfig?: CloudinaryConfig;

  constructor() {
    if (FrameExtractionService.instance) {
      return FrameExtractionService.instance;
    }
    FrameExtractionService.instance = this;
    
    // Configuration Cloudinary depuis les variables d'environnement
    this.cloudinaryConfig = {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default',
      apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
    };
  }

  /**
   * Extraction de frame principale - choisit automatiquement la meilleure méthode
   */
  async extractFrame(videoBlob: Blob): Promise<FrameExtractionResult> {
    const startTime = Date.now();
    console.log('🎬 Début extraction frame intelligente...');

    // 1. Détecter l'environnement
    const isMobile = this.isMobileDevice();
    const isCloudinaryAvailable = !!this.cloudinaryConfig?.cloudName;
    
    console.log('📱 Mobile détecté:', isMobile);
    console.log('☁️ Cloudinary disponible:', isCloudinaryAvailable);
    console.log('🔧 DEBUG Cloudinary config:', {
      cloudName: this.cloudinaryConfig?.cloudName || 'UNDEFINED',
      uploadPreset: this.cloudinaryConfig?.uploadPreset || 'UNDEFINED'
    });

    // 2. Stratégie de sélection - PRÉFÉRER CLOUDINARY
    if (isCloudinaryAvailable) {
      console.log('🚀 Stratégie: Cloudinary (recommandé)');
      return await this.extractFrameCloudinary(videoBlob, startTime);
    } else {
      console.log('🚀 Stratégie: Native JS (fallback si pas Cloudinary)');
      return await this.extractFrameNative(videoBlob, startTime);
    }
  }

  /**
   * Extraction via Cloudinary (recommandé pour mobile)
   */
  private async extractFrameCloudinary(videoBlob: Blob, startTime: number): Promise<FrameExtractionResult> {
    try {
      console.log('☁️ Upload vidéo vers Cloudinary...');
      
      // 1. Upload vers Cloudinary
      const formData = new FormData();
      formData.append('file', videoBlob);
      formData.append('upload_preset', this.cloudinaryConfig!.uploadPreset);
      formData.append('resource_type', 'video');
      
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudinaryConfig!.cloudName}/video/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }
      
      const uploadResult = await uploadResponse.json();
      console.log('✅ Vidéo uploadée:', uploadResult.public_id);
      console.log('🔧 DEBUG Upload result complet:', uploadResult);
      
      // 2. Générer URL de frame (début de la vidéo pour éviter erreurs de durée)
      const frameUrl = `https://res.cloudinary.com/v1_1/${this.cloudinaryConfig!.cloudName}/video/upload/so_0/w_640,c_fit,f_jpg/${uploadResult.public_id}.jpg`;
      console.log('🔧 DEBUG URL générée:', frameUrl);
      
      // 3. Télécharger et convertir en base64
      console.log('📸 Téléchargement frame depuis Cloudinary...');
      console.log('📸 URL frame:', frameUrl);
      const frameResponse = await fetch(frameUrl);
      
      console.log('📸 Response status:', frameResponse.status);
      if (!frameResponse.ok) {
        throw new Error(`Frame download failed: ${frameResponse.status}`);
      }
      
      const frameBlob = await frameResponse.blob();
      const frameData = await this.blobToBase64(frameBlob);
      
      const processingTime = Date.now() - startTime;
      console.log(`✅ Frame Cloudinary extraite en ${processingTime}ms`);
      
      return {
        success: true,
        frameData,
        method: 'cloudinary',
        cost: 0.002, // Prix approximatif
        processingTime
      };
      
    } catch (error) {
      console.error('❌ Erreur Cloudinary:', error);
      console.error('❌ Type erreur:', error.constructor.name);
      console.error('❌ Message:', error.message);
      
      // Fallback vers méthode native
      console.log('🔄 Fallback vers extraction native...');
      return await this.extractFrameNative(videoBlob, startTime);
    }
  }

  /**
   * Extraction native JavaScript (fallback)
   */
  private async extractFrameNative(videoBlob: Blob, startTime: number): Promise<FrameExtractionResult> {
    return new Promise((resolve) => {
      console.log('🎬 Extraction native JS...');
      
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        resolve({
          success: false,
          method: 'native',
          error: 'Canvas context non disponible'
        });
        return;
      }

      // Configuration mobile-friendly
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = 'anonymous';

      let frameExtracted = false;
      const timeout = setTimeout(() => {
        if (!frameExtracted) {
          resolve({
            success: false,
            method: 'native',
            error: 'Timeout extraction frame (5s)',
            processingTime: Date.now() - startTime
          });
        }
      }, 5000);

      const extractFrame = () => {
        if (frameExtracted) return;
        
        try {
          // Redimensionner pour optimiser
          canvas.width = Math.min(video.videoWidth || 640, 640);
          canvas.height = Math.min(video.videoHeight || 360, 360);
          
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const frameData = canvas.toDataURL('image/jpeg', 0.8);
          
          frameExtracted = true;
          clearTimeout(timeout);
          
          const processingTime = Date.now() - startTime;
          console.log(`✅ Frame native extraite en ${processingTime}ms`);
          
          resolve({
            success: true,
            frameData,
            method: 'native',
            cost: 0,
            processingTime
          });
        } catch (error) {
          frameExtracted = true;
          clearTimeout(timeout);
          resolve({
            success: false,
            method: 'native',
            error: `Erreur extraction: ${error}`,
            processingTime: Date.now() - startTime
          });
        }
      };

      video.onloadedmetadata = () => {
        if (!isFinite(video.duration) || video.duration <= 0) {
          resolve({
            success: false,
            method: 'native',
            error: 'Durée vidéo invalide'
          });
          return;
        }
        
        // Positionner au milieu
        video.currentTime = Math.min(1, video.duration / 2);
      };

      video.onseeked = extractFrame;
      video.oncanplay = () => {
        if (!frameExtracted) extractFrame();
      };

      video.onerror = () => {
        frameExtracted = true;
        clearTimeout(timeout);
        resolve({
          success: false,
          method: 'native',
          error: 'Erreur chargement vidéo'
        });
      };

      try {
        video.src = URL.createObjectURL(videoBlob);
        video.load();
      } catch (error) {
        resolve({
          success: false,
          method: 'native',
          error: `Erreur création URL: ${error}`
        });
      }
    });
  }

  /**
   * Détection mobile
   */
  private isMobileDevice(): boolean {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Convertir Blob en base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Statistiques des performances
   */
  getPerformanceStats(): any {
    // TODO: Implémenter tracking des performances
    return {
      cloudinarySuccess: 0,
      nativeSuccess: 0,
      averageTime: 0,
      totalCost: 0
    };
  }
}

// Instance singleton
export const frameExtractionService = new FrameExtractionService();
