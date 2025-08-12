'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Props {
  audioBlob?: Blob;
  phrases: string[];
  title?: string;
}

export const AudioDebugPlayer: React.FC<Props> = ({ audioBlob, phrases, title = "Audio enregistré" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [audioBlob]);

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const downloadAudio = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `dodo-lens-audio-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-4">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        🎧 {title}
        {audioBlob && (
          <span className="text-sm font-normal text-gray-500">
            ({(audioBlob.size / 1024).toFixed(1)} KB)
          </span>
        )}
      </h3>

      {audioUrl ? (
        <div className="space-y-4">
          {/* Lecteur audio */}
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />

          {/* Contrôles personnalisés */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlay}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isPlaying 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>

            <div className="flex-1">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <button
              onClick={downloadAudio}
              className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm"
            >
              📥 Télécharger
            </button>
          </div>

          {/* Informations audio */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <div className="font-medium text-gray-700">📊 Métadonnées</div>
              <div className="text-gray-600 mt-1">
                <div>Durée: {formatTime(duration)}</div>
                <div>Taille: {audioBlob ? (audioBlob.size / 1024).toFixed(1) + ' KB' : 'N/A'}</div>
                <div>Type: {audioBlob?.type || 'N/A'}</div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <div className="font-medium text-gray-700">🎙️ Reconnaissance</div>
              <div className="text-gray-600 mt-1">
                <div>Phrases: {phrases.length}</div>
                <div>Status: {phrases.length > 0 ? '✅ OK' : '❌ Aucune'}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🔇</div>
          <div>Aucun audio disponible</div>
        </div>
      )}

      {/* Liste des phrases détectées */}
      {phrases.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-2">📝 Phrases capturées :</h4>
          <div className="space-y-2">
            {phrases.map((phrase, index) => (
              <div key={index} className="bg-green-50 border border-green-200 rounded p-2">
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="text-green-800">{phrase}</div>
                    <div className="text-green-600 text-xs mt-1">
                      Longueur: {phrase.length} caractères
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {phrases.length === 0 && (
        <div className="mt-4 border-t pt-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <div className="text-yellow-800">⚠️ Aucune phrase détectée</div>
            <div className="text-yellow-600 text-sm mt-1">
              Vérifiez que la reconnaissance vocale fonctionne et que vous parlez assez fort.
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};
