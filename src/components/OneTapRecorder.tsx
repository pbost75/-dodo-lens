'use client';

import React, { useState, useRef, useEffect } from 'react';
import { mobileLog } from './MobileDebugPanel';
import { openaiService } from '../services/openaiService';

interface Props {
  onRecordingComplete: (videoBlob: Blob, phrases: string[], audioBlob?: Blob) => void;
}

export const OneTapRecorder: React.FC<Props> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [capturedPhrases, setCapturedPhrases] = useState<string[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [supportedMimeTypes, setSupportedMimeTypes] = useState<string[]>([]);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [hasAudioInVideo, setHasAudioInVideo] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Détection mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Détecter les formats supportés au chargement
  useEffect(() => {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus', 
      'video/webm;codecs=h264,opus',
      'video/webm',
      'video/mp4;codecs=h264,aac',
      'video/mp4',
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/wav'
    ];
    
    const supported = types.filter(type => MediaRecorder.isTypeSupported(type));
    setSupportedMimeTypes(supported);
  }, []);

  // Cleanup au unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Demander les permissions SÉPARÉMENT (SOLUTION RADICALE)
  const requestPermissions = async () => {
    try {
      setError(null);
      mobileLog.info('🔐 SOLUTION RADICALE : Permissions séparées');
      
      // 1. VIDÉO D'ABORD (SANS AUDIO pour éviter les conflits Speech Recognition)
      mobileLog.info('📹 Demande permission VIDÉO seulement...');
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: isMobile ? 'environment' : 'user',
          width: { ideal: isMobile ? 640 : 1280 },
          height: { ideal: isMobile ? 480 : 720 }
        },
        audio: false // PAS D'AUDIO !
      });
      mobileLog.info('✅ Stream vidéo obtenu');

      // 2. AUDIO SÉPARÉMENT (pour l'enregistrement, Speech Recognition aura son propre accès)
      mobileLog.info('🎙️ Demande permission AUDIO séparément...');
      const audioStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100,
          channelCount: 1
        }
      });
      mobileLog.info('✅ Stream audio obtenu séparément');

      // 3. COMBINER pour l'enregistrement
      const combinedStream = new MediaStream();
      videoStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
      audioStream.getAudioTracks().forEach(track => combinedStream.addTrack(track));

      streamRef.current = combinedStream; // Stream combiné pour l'enregistrement
      
      if (videoRef.current) {
        videoRef.current.srcObject = videoStream; // Affichage vidéo seulement
      }

      // Analyser le niveau audio pour vérifier que le micro fonctionne
      try {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(audioStream); // Utiliser le stream audio séparé
        microphone.connect(analyser);
        
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const updateAudioLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
          setAudioLevel(Math.round(average));
        };
        
        // Mettre à jour le niveau audio toutes les 100ms
        const audioLevelInterval = setInterval(updateAudioLevel, 100);
        
        // Nettoyer l'interval au cleanup  
        // streamRef.current = combinedStream; // Déjà fait plus haut
        
        // Ajouter le nettoyage de l'audio context
        const originalTracks = combinedStream.getTracks();
        originalTracks.forEach(track => {
          const originalStop = track.stop;
          track.stop = function() {
            clearInterval(audioLevelInterval);
            audioContext.close();
            originalStop.call(this);
          };
        });
      } catch (audioError) {
        console.warn('Analyse audio non disponible:', audioError);
      }

      setHasPermissions(true);
      return true;
    } catch (err) {
      console.error('Erreur permissions:', err);
      setError('Impossible d\'accéder à la caméra et au microphone. Vérifiez les permissions.');
      setHasPermissions(false);
      return false;
    }
  };

  // Initialiser la reconnaissance vocale
  const initSpeechRecognition = (): boolean | string => {
    mobileLog.info('🎙️ Début initialisation Speech Recognition');
    
    // Forcer l'utilisation du Web Speech API même sur mobile
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      mobileLog.warn('❌ Speech Recognition non disponible sur ce navigateur');
      console.warn('Speech Recognition non disponible');
      return 'fallback'; // On va utiliser un fallback
    }

    mobileLog.info('✅ Speech Recognition disponible');
    console.log('🎙️ Initialisation Speech Recognition...');
    const recognition = new SpeechRecognition();

    // Détection spécifique Android Chrome (le plus problématique)
    const isAndroidChrome = /Android.*Chrome/i.test(navigator.userAgent);
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    
    mobileLog.info('📱 Détection navigateur:', {
      isAndroidChrome: isAndroidChrome,
      isMobile: isMobile,
      userAgent: navigator.userAgent
    });
    
    if (isAndroidChrome) {
      mobileLog.info('🤖 Configuration ANDROID CHROME spéciale');
      console.log('🤖 Configuration ANDROID CHROME spéciale');
      // Configuration ultra-sensible pour Android Chrome
      recognition.continuous = true;   // TESTE: true pour capturer plus
      recognition.interimResults = true; // TESTE: true pour plus de sensibilité
      recognition.lang = 'fr-FR';
      recognition.maxAlternatives = 3; // Plus d'alternatives
      
      mobileLog.info('⚙️ Config Android SENSIBLE: continuous=true, interimResults=true');
      
      // Pas de grammaire sur Android Chrome (bug connu)
      try {
        recognition.grammars = undefined;
      } catch (e) {}
      
    } else if (isMobile) {
      console.log('📱 Configuration mobile générique');
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';
      recognition.maxAlternatives = 3;
    } else {
      // Configuration desktop
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';
      recognition.maxAlternatives = 1;
    }

    recognition.onstart = () => {
      mobileLog.info('🎙️ Reconnaissance vocale démarrée');
      console.log('🎙️ Reconnaissance vocale démarrée');
      setIsListening(true);
    };

    // AJOUT DE TOUS LES ÉVÉNEMENTS AUDIO POUR DIAGNOSTIC
    recognition.onaudiostart = () => {
      mobileLog.info('🎧 onaudiostart - Audio capturé par Speech Recognition');
    };

    recognition.onaudioend = () => {
      mobileLog.info('🎧 onaudioend - Fin audio Speech Recognition');
    };

    recognition.onsoundstart = () => {
      mobileLog.info('🔊 onsoundstart - Son détecté !');
    };

    recognition.onsoundend = () => {
      mobileLog.info('🔇 onsoundend - Fin de son');
    };

    recognition.onspeechstart = () => {
      mobileLog.info('🎤 onspeechstart - PAROLE DÉTECTÉE !');
    };

    recognition.onspeechend = () => {
      mobileLog.info('🔇 onspeechend - Fin de parole');
    };

    recognition.onnomatch = () => {
      mobileLog.warn('❓ onnomatch - Aucune correspondance trouvée');
    };

    recognition.onresult = (event: any) => {
      mobileLog.info('🎯 Speech onresult déclenché, resultats: ' + event.results.length);
      console.log('🎙️ Résultat reconnaissance:', event.results);
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        mobileLog.info(`📝 Résultat ${i}: "${transcript}" (final: ${event.results[i].isFinal})`);
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setCurrentTranscript(interimTranscript);

      if (finalTranscript) {
        const cleanPhrase = finalTranscript.trim();
        mobileLog.info('✅ Phrase capturée: "' + cleanPhrase + '"');
        mobileLog.info('📊 Détails: ' + cleanPhrase.length + ' chars, ' + cleanPhrase.split(' ').length + ' mots');
        
        console.log('✅ Phrase capturée:', cleanPhrase);
        console.log('📊 Détail phrase:', {
          length: cleanPhrase.length,
          words: cleanPhrase.split(' ').length,
          timestamp: new Date().toLocaleTimeString()
        });
        setCapturedPhrases(prev => {
          const newPhrases = [...prev, cleanPhrase];
          mobileLog.info('📝 Total phrases maintenant: ' + newPhrases.length);
          console.log('📝 Total phrases maintenant:', newPhrases.length);
          console.log('📋 Liste complète:', newPhrases);
          return newPhrases;
        });
        setCurrentTranscript('');
        
        // Redémarrer la reconnaissance sur mobile si elle s'arrête
        if (isMobile && isRecording) {
          setTimeout(() => {
            if (recognitionRef.current && isRecording) {
              try {
                recognitionRef.current.start();
              } catch (err) {
                console.log('Reconnaissance déjà active');
              }
            }
          }, 100);
        }
      }
    };

    recognition.onerror = (event: any) => {
      mobileLog.error('❌ Erreur reconnaissance vocale: ' + event.error);
      console.error('Erreur reconnaissance vocale:', event.error);
      
      if (event.error === 'not-allowed') {
        mobileLog.error('🚫 Permission microphone refusée');
        setError('Permission microphone refusée pour la reconnaissance vocale');
      } else if (event.error === 'network') {
        console.warn('Erreur réseau - redémarrage reconnaissance...');
        // Redémarrer automatiquement sur erreur réseau
        if (isMobile && isRecording) {
          setTimeout(() => {
            try {
              recognitionRef.current?.start();
            } catch (err) {
              console.log('Impossible de redémarrer après erreur réseau');
            }
          }, 1000);
        }
      } else if (event.error === 'service-not-allowed') {
        console.warn('Service non autorisé sur ce navigateur');
        setError('Service de reconnaissance vocale non autorisé sur ce navigateur');
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn(`Erreur reconnaissance vocale: ${event.error}`);
        
        // Sur mobile, redémarrer automatiquement pour la plupart des erreurs
        if (isMobile && isRecording && event.error !== 'audio-capture') {
          setTimeout(() => {
            try {
              recognitionRef.current?.start();
            } catch (err) {
              console.log('Impossible de redémarrer après erreur');
            }
          }, 2000);
        }
      }
    };

    recognition.onend = () => {
      mobileLog.info('🔚 Reconnaissance vocale terminée');
      console.log('🎙️ Reconnaissance vocale terminée');
      setIsListening(false);
      
      // Redémarrage OBLIGATOIRE sur Android Chrome (se déconnecte souvent)
      if (isAndroidChrome && isRecording) {
        mobileLog.info('🤖 Redémarrage automatique Android Chrome...');
        console.log('🤖 Redémarrage Android Chrome...');
        setTimeout(() => {
          if (recognitionRef.current && isRecording) {
            try {
              mobileLog.info('🔄 Tentative redémarrage...');
              recognitionRef.current.start();
              mobileLog.info('✅ Redémarrage Android Chrome réussi');
              console.log('✅ Redémarrage Android Chrome réussi');
            } catch (err) {
              mobileLog.error('❌ Échec redémarrage: ' + err);
              console.log('❌ Échec redémarrage Android Chrome:', err);
              // Forcer une phrase si ça ne marche pas
              setTimeout(() => {
                if (capturedPhrases.length === 0) {
                  setCapturedPhrases(prev => [...prev, "Reconnaissance Android difficile"]);
                }
              }, 1000);
            }
          }
        }, 500); // Délai rapide pour redémarrage immédiat
        
      } else if (isMobile && isRecording) {
        // Autres mobiles
        setTimeout(() => {
          if (recognitionRef.current && isRecording) {
            try {
              recognitionRef.current.start();
            } catch (err) {
              console.log('Impossible de redémarrer la reconnaissance');
            }
          }
        }, 500);
      }
    };

    recognitionRef.current = recognition;
    return true;
  };

  // DÉMARRER l'enregistrement (UN SEUL BOUTON!)
  const startRecording = async () => {
    // 0. RÉINITIALISER les phrases AU DÉBUT (pas à la fin)
    setCapturedPhrases([]);
    mobileLog.info('🗑️ Phrases réinitialisées au DÉBUT');
    
    // 1. Vérifier les permissions
    const hasPerms = hasPermissions || await requestPermissions();
    if (!hasPerms) return;

    // 2. NOUVELLE STRATÉGIE : Enregistrement simple + Whisper API après
    mobileLog.info('🎙️ NOUVELLE STRATÉGIE : Enregistrement simple + Whisper API après');
    mobileLog.info('✅ Pas de conflit Speech Recognition → UX fluide');

    try {
      // 3. Démarrage enregistrement vidéo + audio (UX simple)
      mobileLog.info('🎬 Démarrage enregistrement normal (simple)');
      chunksRef.current = [];
      audioChunksRef.current = [];
      
      // VIDÉO : Stream vidéo seule (sans audio pour éviter les conflits)
      const videoStream = new MediaStream();
      streamRef.current!.getVideoTracks().forEach(track => {
        videoStream.addTrack(track);
      });
      
      // Détection du format vidéo supporté
      let videoMimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(videoMimeType)) {
        videoMimeType = 'video/webm;codecs=vp8';
      }
      if (!MediaRecorder.isTypeSupported(videoMimeType)) {
        videoMimeType = 'video/webm';
      }
      
      const videoRecorder = new MediaRecorder(videoStream, {
        mimeType: videoMimeType || undefined,
        videoBitsPerSecond: 1000000 // 1Mbps vidéo
      });

      videoRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // AUDIO : Stream audio seule
      const audioStream = new MediaStream();
      streamRef.current!.getAudioTracks().forEach(track => {
        audioStream.addTrack(track);
      });
      
      // Détection du format audio supporté
      let audioMimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(audioMimeType)) {
        audioMimeType = 'audio/webm';
      }
      if (!MediaRecorder.isTypeSupported(audioMimeType)) {
        audioMimeType = 'audio/wav';
      }
      
      const audioRecorder = new MediaRecorder(audioStream, {
        mimeType: audioMimeType || undefined,
        audioBitsPerSecond: 128000 // 128kbps audio
      });

      audioRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Callback quand les deux enregistrements sont terminés
      let videoFinished = false;
      let audioFinished = false;
      
      const checkBothFinished = async () => {
        if (videoFinished && audioFinished) {
          const videoBlob = new Blob(chunksRef.current, { type: videoMimeType });
          
          // Stocker l'audio séparé
          setAudioChunks(audioChunksRef.current);
          setHasAudioInVideo(audioChunksRef.current.length > 0);
          
          // NOUVELLE STRATÉGIE : Transcrire avec Whisper API
          let finalPhrases = capturedPhrases;
          console.log('🔍 DEBUG finalPhrases avant Whisper:', finalPhrases);
          
          // Si on a de l'audio, transcrire avec Whisper
          if (audioChunksRef.current.length > 0) {
            try {
              mobileLog.info('🎙️ Début transcription Whisper API...');
              
              // Créer le blob audio
              const debugAudioBlob = new Blob(audioChunksRef.current, {
                type: 'audio/webm;codecs=opus'
              });
              
              // Appeler Whisper API via service sécurisé
              const aiService = new (await import('@/services/aiService')).AIService();
              const transcription = await aiService.transcribeAudio(debugAudioBlob);
              
              if (transcription) {
                // Séparer les phrases par des points ou des silences
                const phrases = transcription.split(/[.!?]+/).filter(p => p.trim().length > 0);
                finalPhrases = phrases.map(p => p.trim());
                mobileLog.info('✅ Transcription Whisper réussie: ' + phrases.length + ' phrases');
                mobileLog.info('📝 Phrases: ' + finalPhrases.join(' | '));
              } else {
                mobileLog.warn('⚠️ Transcription Whisper vide');
                finalPhrases = ['Transcription vide - parlez plus fort'];
              }
              
            } catch (error) {
              mobileLog.error('❌ Erreur Whisper: ' + error);
              console.error('Erreur Whisper:', error);
              finalPhrases = ['Erreur transcription - mode visuel seulement'];
            }
          }
          
          // DÉSACTIVÉ TEMPORAIREMENT
          // if (finalPhrases.length === 0 && audioChunksRef.current.length > 0) {
          //   finalPhrases = [
          //     "Objets détectés dans l'enregistrement audio",
          //     "Analyse IA nécessaire pour identifier les objets"
          //   ];
          //   setCapturedPhrases(finalPhrases);
          // } else if (finalPhrases.length === 0) {
          //   // Même sans audio, permettre de continuer avec la vidéo
          //   finalPhrases = [
          //     "Analyse par vidéo seulement",
          //     "Objets détectés visuellement"
          //   ];
          //   setCapturedPhrases(finalPhrases);
          // }
          
          console.log('📤 Enregistrement terminé:', {
            video: chunksRef.current.length + ' chunks',
            audio: audioChunksRef.current.length + ' chunks', 
            phrases: finalPhrases.length
          });
          
          // Créer un blob audio depuis les chunks audio pour le debug
          let debugAudioBlob: Blob | undefined;
          if (audioChunksRef.current.length > 0) {
            debugAudioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            console.log('🎧 Audio blob créé:', debugAudioBlob.size, 'bytes');
          } else {
            console.warn('⚠️ Aucun chunk audio trouvé');
          }

          // Mettre à jour l'état avec les phrases Whisper
          setCapturedPhrases(finalPhrases);
          
          onRecordingComplete(videoBlob, finalPhrases, debugAudioBlob);
        }
      };

      videoRecorder.onstop = () => {
        videoFinished = true;
        checkBothFinished();
      };

      audioRecorder.onstop = () => {
        audioFinished = true;
        checkBothFinished();
      };

      mediaRecorderRef.current = videoRecorder;
      audioRecorderRef.current = audioRecorder;
      
      // Démarrer les deux enregistrements
      videoRecorder.start(1000);
      audioRecorder.start(1000);

      // 4. PAS de Speech Recognition → WHISPER API utilisé après l'enregistrement
      mobileLog.info('✅ Speech Recognition désactivé → Whisper API sera utilisé après');
      
      // Interface temporaire : indiquer qu'on utilise Whisper
      setTimeout(() => {
        setCapturedPhrases(prev => [...prev, "🎙️ Audio sera transcrit par Whisper API..."]);
      }, 1000);

      // 5. Démarrer le timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      setIsRecording(true);
      // setCapturedPhrases([]); // SUPPRIMÉ ! Cela effaçait les phrases capturées pendant le délai !
      setError(null);
      
      mobileLog.info('📝 Phrases actuelles conservées: ' + capturedPhrases.length);
      
    } catch (err) {
      console.error('Erreur démarrage enregistrement:', err);
      setError('Impossible de démarrer l\'enregistrement.');
    }
  };

  // ARRÊTER l'enregistrement
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    
    if (audioRecorderRef.current && isRecording) {
      audioRecorderRef.current.stop();
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRecording(false);
    setIsListening(false);
  };

  // Format du temps
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-xl border-2 border-purple-200 shadow-lg overflow-hidden">
      {/* Header mobile-optimized */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
        <h2 className="text-xl font-bold text-center">📱 DodoLens Mobile</h2>
        <p className="text-purple-100 text-sm text-center mt-1">
          UN SEUL TAP : Vidéo + Audio simultanés
        </p>
      </div>

      {/* Vidéo preview */}
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-64 sm:h-80 object-cover bg-gray-900"
        />
        
        {/* Overlay d'informations */}
        {isRecording && (
          <div className="absolute top-4 left-4 right-4">
            <div className="bg-black bg-opacity-70 text-white rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-bold">REC</span>
                </div>
                <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span>🎙️</span>
                  <span className={isListening ? 'text-green-400' : 'text-yellow-400'}>
                    {isListening ? 'Reconnaissance ACTIVE' : 'En attente...'}
                  </span>
                  {!isListening && isRecording && (
                    <span className="text-xs text-yellow-300 animate-pulse">
                      Essai de connexion...
                    </span>
                  )}
                </div>
                
                {/* Indicateur niveau audio */}
                <div className="flex items-center space-x-1">
                  <span className="text-xs">Vol:</span>
                  <div className="w-12 h-2 bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-100 ${
                        audioLevel > 10 ? 'bg-green-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${Math.min(100, audioLevel * 2)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs">{audioLevel}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transcript en temps réel */}
        {(currentTranscript || capturedPhrases.length > 0) && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-white bg-opacity-90 rounded-lg p-3 max-h-24 overflow-y-auto">
              {capturedPhrases.length > 0 && (
                <div className="text-xs text-green-600 mb-1">
                  ✅ {capturedPhrases.length} phrase(s) capturée(s)
                </div>
              )}
              {currentTranscript && (
                <div className="text-sm text-gray-800">
                  "{currentTranscript}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Contrôles */}
      <div className="p-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-red-800 text-sm">{error}</div>
          </div>
        )}

        {hasPermissions === null && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-blue-800 font-medium mb-2">📱 Prêt pour le test mobile ?</div>
            <div className="text-blue-600 text-sm mb-4">
              Nous allons demander l'accès à votre caméra et microphone
            </div>
            <button
              onClick={requestPermissions}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              🔓 Autoriser l'accès
            </button>
          </div>
        )}

        {hasPermissions && !isRecording && (
          <div className="text-center space-y-4">
            <div className="text-green-600 text-sm">✅ Permissions accordées</div>
            
            {/* Diagnostic audio/vidéo */}
            <div className="bg-gray-50 border rounded-lg p-3 text-left">
              <div className="text-xs font-medium text-gray-700 mb-2">🔧 Diagnostic technique :</div>
              <div className="space-y-1 text-xs text-gray-600">
                <div>📱 Mobile détecté: {isMobile ? 'Oui' : 'Non'}</div>
                <div>🎙️ Niveau audio: {audioLevel > 5 ? '✅ Actif' : '⚠️ Silencieux'} ({audioLevel})</div>
                <div>🎬 Formats supportés: {supportedMimeTypes.length}</div>
                {supportedMimeTypes.length > 0 && (
                  <div className="text-xs">
                    • {supportedMimeTypes[0]}
                  </div>
                )}
                <div>🔊 Speech Recognition: {('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) ? '✅' : '❌'}</div>
                {audioChunks.length > 0 && (
                  <div className="mt-2 p-2 bg-blue-50 rounded">
                    <div className="text-xs font-medium text-blue-700">🎵 Audio séparé disponible:</div>
                    <button
                      onClick={() => {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                        const url = URL.createObjectURL(audioBlob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `dodo-lens-audio-${Date.now()}.webm`;
                        a.click();
                      }}
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded mt-1"
                    >
                      📥 Télécharger Audio
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* LE BOUTON RÉVOLUTIONNAIRE */}
            <button
              onClick={startRecording}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-6 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              🎬 DÉMARRER<br/>
              <span className="text-lg font-normal">Vidéo + Audio simultanés</span>
            </button>
            
            <div className="text-xs text-gray-500">
              Un seul tap pour tout enregistrer !
            </div>
          </div>
        )}

        {isRecording && (
          <div className="text-center space-y-4">
            <div className="text-purple-600 font-medium">
              🎬 Enregistrement en cours...
            </div>
            
            <button
              onClick={stopRecording}
              className="w-full bg-red-600 text-white py-6 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              ⏹️ ARRÊTER<br/>
              <span className="text-lg font-normal">Terminer l'enregistrement</span>
            </button>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="font-medium text-purple-600">📹 Vidéo</div>
                  <div className="text-purple-500">{formatTime(recordingTime)}</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="font-medium text-green-600">🎙️ Audio</div>
                  <div className="text-green-500">{capturedPhrases.length} phrases</div>
                  <div className="text-xs text-green-600">
                    {hasAudioInVideo ? '✅ Audio capturé' : '⚠️ Audio séparé'}
                  </div>
                </div>
              </div>
              
              {/* Boutons manuels si la reconnaissance vocale ne marche pas */}
              {!isListening && isRecording && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="text-xs font-medium text-yellow-800 mb-2">
                    🗣️ Reconnaissance vocale inactive - Ajout manuel :
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setCapturedPhrases(prev => [...prev, "Je prends ce meuble"])}
                      className="text-xs bg-green-600 text-white px-2 py-1 rounded"
                    >
                      ✅ Je prends
                    </button>
                    <button
                      onClick={() => setCapturedPhrases(prev => [...prev, "J'ignore cet objet"])}
                      className="text-xs bg-red-600 text-white px-2 py-1 rounded"
                    >
                      ❌ J'ignore
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
