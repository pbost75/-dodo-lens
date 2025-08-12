# 🚀 Plan de Migration vers Architecture Éphémère

## 📊 **ÉTAT ACTUEL vs CIBLE**

### ❌ **ÉTAT ACTUEL (À MIGRER)**
```typescript
// Architecture actuelle problématique
const currentState = {
  client: {
    openaiService: "Clés API exposées côté client",
    extraction: "Frames extraites côté mobile",
    processing: "Lourd traitement local",
    storage: "Pas de streaming, upload bloquant"
  },
  
  backend: {
    routes: "Pas d'endpoints DodoLens",
    processing: "Aucun traitement vidéo",
    ai: "Pas d'APIs OpenAI backend",
    websocket: "Pas de communication temps réel"
  },
  
  infrastructure: {
    redis: "Non configuré",
    ffmpeg: "Non installé backend",
    monitoring: "Basique",
    cleanup: "Manuel"
  }
};
```

### ✅ **CIBLE ÉPHÉMÈRE**
```typescript
// Architecture cible éphémère
const targetState = {
  client: {
    upload: "Streaming par chunks progressif",
    websocket: "Communication temps réel",
    ui: "Progress bars et notifications live",
    security: "Aucune clé API exposée"
  },
  
  backend: {
    endpoints: "APIs éphémères complètes",
    processing: "FFMPEG in-memory",
    ai: "OpenAI sécurisé backend",
    cleanup: "Auto-suppression immédiate"
  },
  
  infrastructure: {
    redis: "Cache TTL avec monitoring",
    websocket: "Bidirectionnel avec fallback",
    ffmpeg: "Streaming sans fichiers temp",
    monitoring: "Métriques temps réel"
  }
};
```

---

## 🗂️ **PLAN DE MIGRATION EN 4 PHASES**

### 📅 **PHASE 1 : Infrastructure Backend (Semaine 1)**

#### **Jour 1-2 : Setup Redis & Endpoints Base**

```bash
# 1. Installer Redis Cloud
# - Créer compte Redis Cloud
# - Configurer instance 1GB 
# - Noter URL et password

# 2. Ajouter dépendances backend
cd dodomove-backend
npm install redis ioredis socket.io multer

# 3. Configuration Redis
echo "REDIS_URL=redis://..." >> .env
echo "REDIS_PASSWORD=..." >> .env
```

```javascript
// backend/config/redis.js
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: 1,
});

module.exports = redis;
```

```javascript
// backend/routes/dodo-lens.js
const express = require('express');
const router = express.Router();
const redis = require('../config/redis');

// Test endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'dodo-lens' });
});

// Upload chunk endpoint
router.post('/upload-chunk', async (req, res) => {
  // TODO: Implémenter upload chunks
  res.json({ success: true });
});

module.exports = router;
```

#### **Jour 3-4 : Migration APIs OpenAI vers Backend**

```javascript
// backend/services/openaiService.js
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Sécurisé côté serveur
});

const analyzeFramesWithGPT4Vision = async (frames) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: "Analyse ces images d'intérieur..." },
          ...frames.map(frame => ({
            type: "image_url",
            image_url: { url: frame }
          }))
        ]
      }],
      max_tokens: 1000
    });
    
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Erreur OpenAI Vision:', error);
    throw error;
  }
};

const transcribeWithWhisper = async (audioBuffer) => {
  try {
    const response = await openai.audio.transcriptions.create({
      file: audioBuffer,
      model: "whisper-1",
      language: "fr"
    });
    
    return response.text;
  } catch (error) {
    console.error('Erreur Whisper:', error);
    throw error;
  }
};

module.exports = { analyzeFramesWithGPT4Vision, transcribeWithWhisper };
```

#### **Jour 5 : Tests Infrastructure Base**

```bash
# Tests Redis
curl -X POST http://localhost:8000/api/dodo-lens/health

# Tests OpenAI backend
curl -X POST http://localhost:8000/api/test-openai \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

---

### 📅 **PHASE 2 : Upload Streaming (Semaine 2)**

#### **Jour 6-7 : Implémentation Upload Chunks Backend**

```javascript
// backend/routes/dodo-lens.js - Upload chunks complet
router.post('/upload-chunk', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    const chunkIndex = parseInt(req.headers['x-chunk-index']);
    const totalChunks = parseInt(req.headers['x-total-chunks']);
    
    if (!sessionId || chunkIndex === undefined || !totalChunks) {
      return res.status(400).json({ error: 'Headers manquants' });
    }
    
    // Stocker chunk avec TTL 5 minutes
    const chunkKey = `chunk:${sessionId}:${chunkIndex}`;
    await redis.setex(chunkKey, 300, req.body);
    
    console.log(`📦 Chunk ${chunkIndex + 1}/${totalChunks} reçu pour session ${sessionId}`);
    
    // Si dernier chunk, déclencher processing
    if (chunkIndex === totalChunks - 1) {
      console.log('🚀 Tous les chunks reçus, démarrage processing...');
      processVideoSession(sessionId, totalChunks);
    }
    
    res.json({ 
      success: true, 
      chunk: chunkIndex + 1,
      total: totalChunks,
      sessionId 
    });
    
  } catch (error) {
    console.error('Erreur upload chunk:', error);
    res.status(500).json({ error: error.message });
  }
});
```

#### **Jour 8-9 : Migration Client Upload Streaming**

```typescript
// frontend/services/uploadService.ts
export class StreamingUploader {
  private sessionId: string;
  private onProgress: (progress: number) => void;
  
  constructor(sessionId: string, onProgress: (progress: number) => void) {
    this.sessionId = sessionId;
    this.onProgress = onProgress;
  }
  
  async uploadVideoInChunks(videoBlob: Blob): Promise<void> {
    const CHUNK_SIZE = 1024 * 1024; // 1MB
    const totalChunks = Math.ceil(videoBlob.size / CHUNK_SIZE);
    
    console.log(`📤 Upload streaming: ${totalChunks} chunks de ${CHUNK_SIZE} bytes`);
    
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, videoBlob.size);
      const chunk = videoBlob.slice(start, end);
      
      await this.uploadChunk(chunk, i, totalChunks);
      
      // Mise à jour progress
      const progress = Math.round(((i + 1) / totalChunks) * 100);
      this.onProgress(progress);
    }
  }
  
  private async uploadChunk(chunk: Blob, index: number, total: number): Promise<void> {
    const response = await fetch('/api/dodo-lens/upload-chunk', {
      method: 'POST',
      headers: {
        'X-Session-ID': this.sessionId,
        'X-Chunk-Index': index.toString(),
        'X-Total-Chunks': total.toString(),
        'Content-Type': 'application/octet-stream'
      },
      body: chunk
    });
    
    if (!response.ok) {
      throw new Error(`Échec upload chunk ${index + 1}`);
    }
    
    const result = await response.json();
    console.log(`✅ Chunk ${result.chunk}/${result.total} uploadé`);
  }
}
```

#### **Jour 10 : Remplacement Upload dans VideoImageAnalyzer**

```typescript
// frontend/components/VideoImageAnalyzer.tsx - Modification
import { StreamingUploader } from '@/services/uploadService';

const VideoImageAnalyzer = ({ videoBlob, audioBlob, phrases }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleAnalysis = async () => {
    try {
      setIsUploading(true);
      
      // Générer session ID unique
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Créer uploader streaming
      const uploader = new StreamingUploader(sessionId, setUploadProgress);
      
      // Upload streaming (non-bloquant)
      await uploader.uploadVideoInChunks(videoBlob);
      
      console.log('✅ Upload terminé, attente processing...');
      setIsUploading(false);
      
      // TODO Phase 3: WebSocket pour recevoir résultats
      
    } catch (error) {
      console.error('❌ Erreur upload streaming:', error);
      setIsUploading(false);
    }
  };
  
  return (
    <div>
      {isUploading && (
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span>Upload en cours...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Reste de l'interface existante */}
    </div>
  );
};
```

---

### 📅 **PHASE 3 : Processing In-Memory (Semaine 3)**

#### **Jour 11-12 : Installation et Configuration FFMPEG**

```bash
# Sur Railway backend
# Ajouter dans Dockerfile ou buildpack
apt-get update && apt-get install -y ffmpeg

# Ou utiliser buildpack heroku
echo "https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git" > .buildpacks
```

```javascript
// backend/services/ffmpegService.js
const { spawn } = require('child_process');

const extractFramesInMemory = async (videoBuffer) => {
  return new Promise((resolve, reject) => {
    const frames = [];
    
    // FFMPEG en mode streaming
    const ffmpeg = spawn('ffmpeg', [
      '-i', 'pipe:0',        // Lire depuis stdin
      '-vf', 'fps=1/2',      // 1 frame toutes les 2 secondes
      '-vframes', '8',       // Max 8 frames
      '-f', 'image2pipe',    // Format pipe
      '-vcodec', 'mjpeg',    // JPEG output
      'pipe:1'               // Sortie vers stdout
    ]);
    
    // Envoyer buffer vidéo vers FFMPEG
    ffmpeg.stdin.write(videoBuffer);
    ffmpeg.stdin.end();
    
    let frameBuffer = Buffer.alloc(0);
    
    ffmpeg.stdout.on('data', (chunk) => {
      frameBuffer = Buffer.concat([frameBuffer, chunk]);
      
      // Détecter délimiteurs JPEG
      const frames = extractJPEGFrames(frameBuffer);
      frames.forEach(frame => {
        const base64 = `data:image/jpeg;base64,${frame.toString('base64')}`;
        frames.push(base64);
      });
    });
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${frames.length} frames extraites en mémoire`);
        resolve(frames);
      } else {
        reject(new Error(`FFMPEG failed: ${code}`));
      }
    });
    
    ffmpeg.on('error', reject);
    
    // Timeout sécurité
    setTimeout(() => {
      ffmpeg.kill();
      reject(new Error('FFMPEG timeout'));
    }, 30000);
  });
};

module.exports = { extractFramesInMemory };
```

#### **Jour 13-14 : Processing Session Complet**

```javascript
// backend/services/sessionProcessor.js
const redis = require('../config/redis');
const { extractFramesInMemory } = require('./ffmpegService');
const { analyzeFramesWithGPT4Vision, transcribeWithWhisper } = require('./openaiService');

const processVideoSession = async (sessionId, totalChunks) => {
  let videoBuffer = null;
  
  try {
    console.log(`🔄 Processing session ${sessionId}...`);
    
    // 1. Assembler chunks depuis Redis
    console.log('📦 Assemblage chunks...');
    const chunks = [];
    for (let i = 0; i < totalChunks; i++) {
      const chunkKey = `chunk:${sessionId}:${i}`;
      const chunk = await redis.getBuffer(chunkKey);
      if (!chunk) {
        throw new Error(`Chunk ${i} manquant ou expiré`);
      }
      chunks.push(chunk);
    }
    
    videoBuffer = Buffer.concat(chunks);
    console.log(`✅ Vidéo assemblée: ${videoBuffer.length} bytes`);
    
    // 2. Extraction frames en mémoire
    console.log('🖼️ Extraction frames FFMPEG...');
    const frames = await extractFramesInMemory(videoBuffer);
    console.log(`✅ ${frames.length} frames extraites`);
    
    // 3. Analyse OpenAI en parallèle
    console.log('🤖 Analyse IA...');
    const [visualResults, audioResults] = await Promise.all([
      analyzeFramesWithGPT4Vision(frames),
      // TODO: transcribeWithWhisper(audioBuffer) - extraire audio du buffer
    ]);
    
    // 4. Fusion résultats
    const fusedResults = await fuseResults(visualResults, audioResults);
    
    // 5. Stockage résultats Airtable
    await saveResultsToAirtable(sessionId, fusedResults);
    
    // 6. Cleanup immédiat
    await cleanupSession(sessionId, totalChunks);
    
    // 7. Notification client (TODO Phase 4: WebSocket)
    console.log(`✅ Session ${sessionId} processed successfully`);
    
  } catch (error) {
    console.error(`❌ Erreur processing ${sessionId}:`, error);
    
    // Cleanup même en cas d'erreur
    await cleanupSession(sessionId, totalChunks);
    
    throw error;
  } finally {
    // Effacement sécurisé buffer
    if (videoBuffer) {
      videoBuffer.fill(0);
      videoBuffer = null;
    }
  }
};

const cleanupSession = async (sessionId, totalChunks) => {
  console.log(`🧹 Cleanup session ${sessionId}...`);
  
  // Supprimer tous les chunks Redis
  const keys = [];
  for (let i = 0; i < totalChunks; i++) {
    keys.push(`chunk:${sessionId}:${i}`);
  }
  
  if (keys.length > 0) {
    await redis.del(...keys);
    console.log(`✅ ${keys.length} chunks supprimés`);
  }
};

module.exports = { processVideoSession };
```

---

### 📅 **PHASE 4 : WebSocket & Finalisation (Semaine 4)**

#### **Jour 15-16 : WebSocket Backend**

```javascript
// backend/websocket/socketHandlers.js
const { Server } = require('socket.io');

const setupWebSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"]
    }
  });
  
  io.on('connection', (socket) => {
    console.log(`🔌 Client connecté: ${socket.id}`);
    
    socket.on('join_session', (sessionId) => {
      socket.join(sessionId);
      console.log(`👥 Client ${socket.id} rejoint session ${sessionId}`);
      
      socket.emit('session_joined', { sessionId, status: 'connected' });
    });
    
    socket.on('disconnect', () => {
      console.log(`🔌 Client déconnecté: ${socket.id}`);
    });
  });
  
  return io;
};

// Fonctions de notification
const notifySessionProgress = (io, sessionId, event, data) => {
  io.to(sessionId).emit('processing_update', {
    event,
    data,
    timestamp: new Date().toISOString()
  });
};

const notifySessionComplete = (io, sessionId, results) => {
  io.to(sessionId).emit('analysis_complete', {
    sessionId,
    results,
    timestamp: new Date().toISOString()
  });
};

const notifySessionError = (io, sessionId, error) => {
  io.to(sessionId).emit('analysis_error', {
    sessionId,
    error: error.message,
    timestamp: new Date().toISOString()
  });
};

module.exports = { 
  setupWebSocket, 
  notifySessionProgress, 
  notifySessionComplete, 
  notifySessionError 
};
```

#### **Jour 17-18 : WebSocket Frontend**

```typescript
// frontend/hooks/useWebSocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SessionStatus {
  status: 'connecting' | 'connected' | 'processing' | 'completed' | 'error';
  progress?: number;
  results?: any;
  error?: string;
}

export const useSessionWebSocket = (sessionId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    status: 'connecting'
  });
  
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL!;
    const newSocket = io(wsUrl);
    
    newSocket.on('connect', () => {
      console.log('🔌 WebSocket connecté');
      setSessionStatus({ status: 'connected' });
      
      // Rejoindre la session
      newSocket.emit('join_session', sessionId);
    });
    
    newSocket.on('session_joined', (data) => {
      console.log(`👥 Session rejoinée: ${data.sessionId}`);
    });
    
    newSocket.on('processing_update', (data) => {
      console.log(`📊 Update processing: ${data.event}`);
      setSessionStatus(prev => ({
        ...prev,
        status: 'processing',
        progress: data.data.progress
      }));
    });
    
    newSocket.on('analysis_complete', (data) => {
      console.log('✅ Analyse terminée:', data.results);
      setSessionStatus({
        status: 'completed',
        results: data.results
      });
    });
    
    newSocket.on('analysis_error', (data) => {
      console.error('❌ Erreur analyse:', data.error);
      setSessionStatus({
        status: 'error',
        error: data.error
      });
    });
    
    newSocket.on('disconnect', () => {
      console.log('🔌 WebSocket déconnecté');
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, [sessionId]);
  
  return { socket, sessionStatus };
};
```

#### **Jour 19-20 : Intégration Finale**

```typescript
// frontend/components/VideoImageAnalyzer.tsx - Version finale éphémère
import { useSessionWebSocket } from '@/hooks/useWebSocket';
import { StreamingUploader } from '@/services/uploadService';

const VideoImageAnalyzer = ({ videoBlob, audioBlob, phrases }) => {
  const [sessionId] = useState(() => 
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const { sessionStatus } = useSessionWebSocket(sessionId);
  
  const startAnalysis = async () => {
    try {
      setIsUploading(true);
      
      // Upload streaming
      const uploader = new StreamingUploader(sessionId, setUploadProgress);
      await uploader.uploadVideoInChunks(videoBlob);
      
      setIsUploading(false);
      console.log('✅ Upload terminé, attente processing via WebSocket...');
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      setIsUploading(false);
    }
  };
  
  return (
    <div className="p-6">
      {/* Progress Upload */}
      {isUploading && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">📤 Upload en cours...</h3>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">{uploadProgress}% envoyé</p>
        </div>
      )}
      
      {/* Status Processing */}
      {sessionStatus.status === 'processing' && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">⚡ Analyse IA en cours...</h3>
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Processing temps réel via WebSocket</span>
          </div>
        </div>
      )}
      
      {/* Résultats */}
      {sessionStatus.status === 'completed' && sessionStatus.results && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-green-600">
            ✅ Analyse terminée !
          </h3>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">📋 Objets détectés :</h4>
            <ul className="space-y-1">
              {sessionStatus.results.objects.map((obj, index) => (
                <li key={index} className="flex justify-between">
                  <span>{obj.name}</span>
                  <span className="font-medium">{obj.volume} m³</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-4 pt-4 border-t border-green-200">
              <div className="flex justify-between text-lg font-bold">
                <span>Volume total :</span>
                <span className="text-green-600">
                  {sessionStatus.results.totalVolume} m³
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Erreur */}
      {sessionStatus.status === 'error' && (
        <div className="mb-6 bg-red-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-red-600 mb-2">
            ❌ Erreur d'analyse
          </h3>
          <p className="text-red-700">{sessionStatus.error}</p>
          <button 
            onClick={startAnalysis}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      )}
      
      {/* Bouton démarrage */}
      {sessionStatus.status === 'connected' && !isUploading && (
        <button
          onClick={startAnalysis}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          🚀 Démarrer l'analyse éphémère
        </button>
      )}
    </div>
  );
};
```

---

## ✅ **CHECKLIST DE MIGRATION**

### 🏗️ **Infrastructure**
- [ ] Redis Cloud configuré et testé
- [ ] Variables d'environnement backend sécurisées
- [ ] FFMPEG installé sur Railway
- [ ] WebSocket endpoint configuré
- [ ] Monitoring de base activé

### 🔧 **Backend**
- [ ] Routes `/api/dodo-lens/*` créées
- [ ] Upload chunks fonctionnel
- [ ] Processing in-memory FFMPEG
- [ ] APIs OpenAI migrées côté serveur
- [ ] Auto-cleanup Redis avec TTL
- [ ] WebSocket handlers implémentés

### 📱 **Frontend**
- [ ] Service upload streaming créé
- [ ] Hook WebSocket implémenté
- [ ] VideoImageAnalyzer migré
- [ ] Progress bars et notifications
- [ ] Gestion d'erreurs robuste
- [ ] Variables d'environnement nettoyées

### 🧪 **Tests**
- [ ] Upload chunks 1MB testé
- [ ] Processing session complète
- [ ] WebSocket bidirectionnel
- [ ] Cleanup automatique vérifié
- [ ] Tests de charge basiques
- [ ] Monitoring fonctionnel

---

## 🚨 **POINTS CRITIQUES À SURVEILLER**

### ⚠️ **Risques de Migration**
1. **TTL Redis trop court** → Chunks perdus pendant upload lent
2. **Memory leak FFMPEG** → OOM sur Railway
3. **WebSocket déconnexions** → Utilisateurs perdus
4. **Cleanup rate limiting** → Redis saturé

### 🛡️ **Mesures de Sécurité**
1. **Backup des clés API** avant migration côté backend
2. **Rollback plan** si upload streaming échoue
3. **Monitoring alertes** memory + Redis + WebSocket
4. **Tests charge** avant mise en production

---

## 📊 **VALIDATION POST-MIGRATION**

### ✅ **Critères de Succès**
- [ ] Upload 80MB en < 2 minutes
- [ ] Processing complet en < 30 secondes  
- [ ] WebSocket latency < 100ms
- [ ] 0 donnée sensible stockée
- [ ] Cleanup 100% automatique
- [ ] Coûts < 150€/mois pour 1000 users

**Durée totale estimée : 4 semaines** ⏱️  
**Effort : 1 développeur full-time** 👨‍💻  
**Complexité : Moyenne** 📊

<function_calls>
<invoke name="todo_write">
<parameter name="merge">true
