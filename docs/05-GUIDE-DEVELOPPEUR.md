# 👨‍💻 Guide Développeur DodoLens

> **Guide pratique** pour setup, développement et bonnes pratiques

## 🚀 **SETUP RAPIDE**

### 📋 **Prérequis**
```bash
# Versions requises
node --version  # >= 18.17.0
npm --version   # >= 9.0.0

# Comptes nécessaires
- OpenAI API (clés sk-...)
- Railway (backend déployé)
- Redis Cloud (pour migration éphémère)
```

### ⚡ **Installation**
```bash
# 1. Clone et dépendances
git clone [URL_REPO] dodo-lens
cd dodo-lens
npm install

# 2. Configuration environnement
cp env.local.example .env.local
# ✏️ Éditer .env.local avec vos clés

# 3. Démarrage développement
npm run dev
# 🌐 Ouvre http://localhost:3000

# 4. Test mobile (via ngrok)
npx ngrok http 3000
# 📱 Utiliser URL HTTPS pour mobile
```

---

## 🏗️ **ARCHITECTURE ACTUELLE**

### 📁 **Structure Codebase**
```
dodo-lens/src/
├── app/                    # Pages Next.js 14
│   ├── page.tsx           # Landing desktop
│   ├── mobile/page.tsx    # Interface mobile
│   └── record/page.tsx    # Page enregistrement
├── components/            # Composants React
│   ├── OneTapRecorder.tsx      # 🎬 Interface enregistrement
│   ├── VideoImageAnalyzer.tsx  # 🤖 Analyse IA
│   ├── SpeechDiagnostic.tsx   # 🎙️ Debug speech
│   └── ui/                     # Composants UI réutilisables
├── hooks/                 # Hooks React custom
│   ├── useVideoRecorder.ts     # 🎬 Gestion vidéo
│   └── useSpeechRecognition.ts # 🎙️ Reconnaissance vocale
├── services/              # Services externes
│   ├── openaiService.ts        # 🤖 APIs OpenAI (⚠️ côté client)
│   └── analytics.tsx           # 📊 Tracking GA4
└── types/                 # Types TypeScript
    └── index.ts               # Interfaces communes
```

### 🔑 **Composants Clés**

#### 🎬 **OneTapRecorder** 
```typescript
// Interface principale mobile
const OneTapRecorder = () => {
  // Gestion enregistrement vidéo + audio simultané
  // Permissions caméra/micro
  // Un seul bouton pour démarrer/arrêter
};
```

#### 🤖 **VideoImageAnalyzer**
```typescript
// Processing IA des vidéos
const VideoImageAnalyzer = ({ videoBlob, audioBlob, phrases }) => {
  // ❌ ÉTAT ACTUEL : Processing côté client
  // 1. Extraction frames côté mobile
  // 2. Appels OpenAI depuis le frontend (non sécurisé)
  // 3. Fusion résultats local
  
  // ✅ CIBLE : Streaming vers backend éphémère
};
```

#### 🎙️ **useSpeechRecognition**
```typescript
// Hook reconnaissance vocale
const useSpeechRecognition = () => {
  // Web Speech API optimisée mobile
  // Gestion erreurs et redémarrages
  // Transcription temps réel
};
```

---

## 🛠️ **DÉVELOPPEMENT**

### 📱 **Tests Mobile**

#### Méthode 1 : ngrok (Recommandée)
```bash
# Terminal 1
npm run dev

# Terminal 2  
npx ngrok http 3000
# Copier URL HTTPS vers mobile
```

#### Méthode 2 : IP locale
```bash
# Dans next.config.js, ajouter:
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'https://your-backend.railway.app/api/:path*',
    },
  ]
}
```

### 🔧 **Debug Commun**

#### Problème : Permissions caméra/micro
```javascript
// Vérifier HTTPS obligatoire
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  console.error('⚠️ HTTPS requis pour caméra/micro sur mobile');
}

// Debug permissions
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(() => console.log('✅ Permissions OK'))
  .catch(err => console.error('❌ Permissions refusées:', err));
```

#### Problème : Speech Recognition mobile
```javascript
// Tester support navigateur
if (!('webkitSpeechRecognition' in window)) {
  console.error('❌ Speech Recognition non supportée');
}

// Debug reconnaissance
const recognition = new webkitSpeechRecognition();
recognition.onresult = (event) => {
  console.log('🎙️ Transcript:', event.results[0][0].transcript);
};
```

#### Problème : OpenAI API erreurs
```javascript
// Debug service OpenAI
console.log('🔑 API Key présente:', !!process.env.NEXT_PUBLIC_OPENAI_API_KEY);

// Test appel API
try {
  const result = await openaiService.analyzeVideoFrame(testFrame);
  console.log('✅ OpenAI OK:', result);
} catch (error) {
  console.error('❌ OpenAI erreur:', error);
}
```

### 📊 **Monitoring et Logs**

#### Logs Mobile Debug
```javascript
// Composant MobileDebugPanel.tsx
const MobileDebugPanel = () => {
  // Affiche logs en temps réel sur mobile
  // Capture erreurs console
  // Métriques performance
};
```

#### Analytics Events
```javascript
// Tracker events importants
gtag('event', 'video_recording_started', {
  event_category: 'dodo_lens',
  event_label: 'mobile_recording'
});

gtag('event', 'ai_analysis_completed', {
  event_category: 'dodo_lens', 
  value: analysisTimeMs
});
```

---

## 🚨 **PROBLÈMES CONNUS**

### ⚠️ **Limitations Actuelles**

#### 1. Sécurité APIs
```typescript
// ❌ PROBLÈME : Clés OpenAI exposées côté client
NEXT_PUBLIC_OPENAI_API_KEY=sk-...  // Visible dans browser

// ✅ SOLUTION : Migration backend éphémère
// Voir 03-PLAN-MIGRATION-VERS-EPHEMERE.md
```

#### 2. Performance Mobile
```typescript
// ❌ PROBLÈME : Extraction frames côté mobile
const frames = await extractVideoFrames(videoBlob); // Lent, gourmand

// ✅ SOLUTION : FFMPEG backend in-memory
// Voir 04-ARCHITECTURE-EPHEMERE-FINALE.md
```

#### 3. Stockage RGPD
```typescript
// ❌ PROBLÈME : Pas de stockage = pas d'amélioration IA
// Difficile de débugger/améliorer sans données

// ✅ SOLUTION : Feedback anonymisé optionnel
// Architecture éphémère native RGPD
```

### 🔧 **Fixes Temporaires**

#### Timeout Speech Recognition
```javascript
// Dans useSpeechRecognition.ts
useEffect(() => {
  const timeout = setTimeout(() => {
    if (isListening && !hasDetectedSpeech) {
      console.log('🔄 Redémarrage speech recognition');
      stopListening();
      setTimeout(() => startListening(), 1000);
    }
  }, 10000); // Redémarrage toutes les 10s
  
  return () => clearTimeout(timeout);
}, [isListening, hasDetectedSpeech]);
```

#### Extraction Frames Mobile
```javascript
// Dans VideoImageAnalyzer.tsx - Fallback mobile
const extractFramesWithFallback = async (videoBlob) => {
  try {
    return await extractVideoFrames(videoBlob);
  } catch (error) {
    console.warn('⚠️ Extraction frames échouée, fallback simple');
    return await extractSingleFrameMobile(videoBlob);
  }
};
```

---

## 📋 **BONNES PRATIQUES**

### ✅ **Code Quality**

#### TypeScript Strict
```typescript
// Toujours typer les interfaces
interface VideoAnalysisResult {
  objects: DetectedObject[];
  totalVolume: number;
  confidence: number;
}

// Éviter any, utiliser unknown
const handleApiResponse = (data: unknown) => {
  if (isVideoAnalysisResult(data)) {
    // Type-safe processing
  }
};
```

#### Error Handling
```typescript
// Gestion d'erreurs robuste
const handleVideoProcessing = async () => {
  try {
    const result = await processVideo();
    return result;
  } catch (error) {
    // Log détaillé pour debug
    console.error('❌ Video processing failed:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
    
    // Fallback graceful
    return null;
  }
};
```

#### Performance Mobile
```typescript
// Lazy loading composants lourds
const VideoImageAnalyzer = React.lazy(() => 
  import('./VideoImageAnalyzer')
);

// Éviter re-renders inutiles
const ExpensiveComponent = React.memo(({ data }) => {
  // Heavy computations
}, (prevProps, nextProps) => {
  return prevProps.data.id === nextProps.data.id;
});
```

### 🎯 **Tests**

#### Tests Unitaires
```bash
# Jest + React Testing Library
npm run test

# Tests composants spécifiques
npm run test -- --watch OneTapRecorder
```

#### Tests E2E Mobile
```bash
# Playwright mobile
npm run test:e2e:mobile

# Tests permissions
npm run test:permissions
```

#### Tests APIs
```bash
# Tests OpenAI service
npm run test:openai

# Tests speech recognition
npm run test:speech
```

---

## 🔮 **MIGRATION ÉPHÉMÈRE**

### 📅 **Planning**
1. **Semaine 1** : Infrastructure backend (Redis + endpoints)
2. **Semaine 2** : Upload streaming côté client
3. **Semaine 3** : Processing in-memory FFMPEG
4. **Semaine 4** : WebSocket + finalisation

### 🎯 **Prochaines Étapes**
- [ ] Lire le plan de migration complet
- [ ] Setup environnement Redis Cloud
- [ ] Commencer par Phase 1 : Infrastructure
- [ ] Tests à chaque étape

### 📚 **Ressources**
- **[Plan Détaillé](03-PLAN-MIGRATION-VERS-EPHEMERE.md)** - 20 jours étape par étape
- **[Architecture Cible](04-ARCHITECTURE-EPHEMERE-FINALE.md)** - Spécifications complètes

---

## 🆘 **AIDE**

### 🐛 **Signaler un Bug**
1. Vérifier les logs console + mobile debug panel
2. Tester sur plusieurs navigateurs/devices
3. Documenter steps de reproduction
4. Créer issue avec logs détaillés

### 💡 **Proposer une Amélioration**
1. Discuter l'idée dans context architecture éphémère
2. Évaluer impact performance mobile
3. Considérer implications RGPD
4. Créer PR avec tests

### 📞 **Contact**
- **Code Review** : Voir historique Git
- **Architecture** : Documentation complète
- **Urgence** : Logs détaillés requis

---

**🎯 Objectif : Code maintenable, performant mobile, sécurisé RGPD, prêt pour architecture éphémère.**
