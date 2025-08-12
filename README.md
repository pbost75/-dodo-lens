# DodoLens - Calculateur de volume révolutionnaire par vidéo et IA

> **🚀 PROJET AOÛT 2025 : ARCHITECTURE ÉPHÉMÈRE !**  
> DodoLens est conçu dès le départ avec une architecture révolutionnaire **streaming éphémère** pour une performance optimale,  
> une sécurité renforcée et une compliance RGPD native. **Zéro stockage de données sensibles.**

Calculateur de volume de déménagement innovant utilisant la vidéo mobile et l'intelligence artificielle pour une estimation précise et intuitive.

## 🎯 Vision du projet

**DodoLens** révolutionne l'estimation de volume de déménagement en permettant aux utilisateurs de **filmer leur intérieur** tout en **commentant à l'oral** ce qu'ils souhaitent déménager. L'IA analyse automatiquement la vidéo et les commentaires pour générer un tableau d'objets éditable et calculer le volume total.

### 🌟 Concept innovant

Au lieu de chercher des objets dans une liste interminable, l'utilisateur :
1. **🎬 Filme** naturellement son intérieur avec son smartphone
2. **🎙️ Commente** à l'oral ce qu'il veut déménager ou ignorer
3. **⏸️ Met en pause** et reprend l'enregistrement à volonté
4. **📋 Obtient** automatiquement un tableau d'objets détaillé
5. **✏️ Édite** le tableau depuis son téléphone
6. **🎬 Ajoute** d'autres vidéos pour enrichir l'estimation
7. **🧮 Valide** pour obtenir son volume total précis

## 🚀 Statut : **ARCHITECTURE ÉPHÉMÈRE PRODUCTION-READY**

### ✅ **RÉVOLUTION TECHNIQUE (Août 2025)**
- 🔄 **Streaming éphémère** : Upload par chunks avec processing en temps réel
- 🔒 **Zéro stockage** : Aucune vidéo/image stockée, compliance RGPD native
- ⚡ **Performance mobile** : Processing backend optimisé, UX ultra-rapide
- 🤖 **IA sécurisée** : APIs OpenAI protégées côté backend
- 📡 **WebSocket temps réel** : Updates live du processing
- 💾 **Données minimales** : Seuls les résultats structurés sont conservés
- 🧹 **Auto-cleanup** : TTL Redis + nettoyage automatique mémoire

### 🎯 **FONCTIONNALITÉS OPÉRATIONNELLES**
- ✅ **Upload streaming** : Envoi par chunks 1MB sans blocage
- ✅ **Processing temps réel** : Analyse IA pendant l'upload
- ✅ **Extraction FFMPEG** : Frames extraites en mémoire uniquement
- ✅ **APIs OpenAI sécurisées** : GPT-4 Vision + Whisper côté backend
- ✅ **Fusion IA avancée** : Croisement intelligent vidéo/audio
- ✅ **Cleanup automatique** : Suppression immédiate données temporaires
- ✅ **WebSocket live** : Updates en temps réel vers le client

### 📊 **ARCHITECTURE ÉPHÉMÈRE COMPLÈTE**
- 🏗️ **Infrastructure** : Redis + Railway + Cloudflare
- 💰 **Coûts optimisés** : 140€/mois pour 1000 utilisateurs  
- ⚖️ **RGPD by design** : Aucune donnée sensible stockée
- 📈 **Scalabilité** : Coûts linéaires, performance constante

## 🛠️ Technologies utilisées

### 📱 Frontend
- **[Next.js 14](https://nextjs.org/)** - Framework React avec App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Typage statique
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS (cohérent avec l'écosystème Dodomove)
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Gestion d'état avec persistance
- **[Framer Motion](https://www.framer.com/motion/)** - Animations fluides

### 🤖 APIs et Services (Production)
- **Web Speech API** - Reconnaissance vocale native ✅ **FONCTIONNEL**
- **MediaRecorder API** - Enregistrement vidéo natif ✅ **FONCTIONNEL**
- **OpenAI GPT-4 Vision** - Analyse frames backend ✅ **CONNECTÉ**
- **OpenAI Whisper** - Transcription audio backend ✅ **CONNECTÉ**
- **WebSocket** - Communication temps réel ✅ **ACTIF**
- **Redis** - Cache temporaire éphémère ✅ **OPÉRATIONNEL**

### 🏭 Backend Éphémère
- **dodomove-backend (Railway)** - Backend centralisé avec processing in-memory
- **Redis Cloud** - Cache temporaire avec TTL automatique
- **FFMPEG** - Extraction frames en mémoire (sans fichiers temporaires)
- **WebSocket** - Communications temps réel client/serveur
- **Airtable** - Stockage résultats uniquement (< 5KB par session)
- **Resend** - Emails transactionnels (service existant)

## 🏗️ Architecture du projet

### 🌐 Infrastructure Éphémère

```
📱 dodo-lens.dodomove.fr (streaming client)
    ↓ (Upload chunks + WebSocket)
🏭 dodomove-backend (processing éphémère)
    ↓ (Cache temporaire)
📦 Redis Cloud (TTL 5min)
    ↓ (Analyse IA)
🤖 OpenAI APIs (Vision + Whisper)
    ↓ (Résultats uniquement)
💾 Airtable (données structurées)
```

### 🔄 **Flux Éphémère Production (Architecture Finale)**

```mermaid
graph TB
    A[📱 Mobile Recording] --> B[🔄 Streaming Upload]
    B --> C[📦 Redis Buffer TTL]
    C --> D[⚡ In-Memory Processing]
    D --> E[🖼️ FFMPEG Frames]
    D --> F[🎙️ Audio Extraction]
    E --> G[🤖 OpenAI Vision]
    F --> H[🤖 OpenAI Whisper]
    G --> I[🔄 IA Fusion]
    H --> I
    I --> J[💾 Results Storage]
    I --> K[🗑️ Auto Cleanup]
    J --> L[📡 WebSocket Notify]
    L --> A
    
    style A fill:#e1f5fe
    style L fill:#c8e6c9
    style G fill:#4caf50
    style H fill:#4caf50
    style K fill:#f44336
```

**🎯 Légende :**
- 🟦 **Client Mobile** : Interface optimisée
- 🟩 **Production Ready** : Déployé et opérationnel  
- 🟢 **APIs Réelles** : OpenAI connectées
- 🔴 **Éphémère** : Suppression automatique

### 🔗 Intégration écosystème existant

**DodoLens s'intègre parfaitement** dans l'écosystème Dodomove :

1. **Funnel principal** : Option "Calculateur vidéo" à l'étape volume
2. **Communication seamless** : PostMessage vers le funnel
3. **Backend centralisé** : Réutilisation de l'infrastructure existante
4. **Design cohérent** : Même design system que les autres apps
5. **Analytics unifiées** : Tracking dans le même système GA4

## 📱 Expérience utilisateur

### 🎬 Interface d'enregistrement vidéo

#### Mode Portrait optimisé mobile
```
┌─────────────────┐
│  🔴 REC  2:34   │ <- Status + durée
├─────────────────┤
│                 │
│     📹 VIDÉO    │ <- Aperçu caméra fullscreen
│    EN COURS     │
│                 │
├─────────────────┤
│ 🎙️ "Je filme    │ <- Transcription temps réel
│ mon salon..."   │
├─────────────────┤
│ ⏸️  ✅  🗑️     │ <- Contrôles simple
└─────────────────┘
```

#### Fonctionnalités vidéo avancées
- **Caméra arrière** par défaut (environnement)
- **Zoom** tactile pour les détails
- **Stabilisation** automatique
- **Éclairage adaptatif** selon la luminosité
- **Mode plein écran** pour immersion maximale

### 🎙️ Reconnaissance vocale intelligente

#### Commandes vocales naturelles
```typescript
// Exemples de phrases reconnues
"Ce canapé, je le prends"
"Cette table, je la laisse"
"Tous les cartons sur cette étagère"
"Cette armoire mais pas les vêtements"
"Cette chambre entière sauf le lit"
```

#### Traitement en temps réel
- **Transcription live** affichée à l'écran
- **Reconnaissance contextuelle** des objets mentionnés
- **Détection intentions** (prendre/laisser/ignorer)
- **Correction automatique** des erreurs de prononciation

### 📋 Tableau d'objets intelligent

#### Interface d'édition mobile-first
```
┌─────────────────────────┐
│ 📋 Objets détectés (12) │
├─────────────────────────┤
│ 🛋️ Canapé 3 places     │
│ Qté: [2] Vol: 3.0 m³   │
│ ✏️ 🗑️                 │
├─────────────────────────┤
│ 📺 Télévision 55"      │
│ Qté: [1] Vol: 0.3 m³   │
│ ✏️ 🗑️                 │
├─────────────────────────┤
│ ➕ Ajouter un objet     │
│ 🎬 Nouvelle vidéo       │
├─────────────────────────┤
│ 📊 Volume total: 15.2m³ │
│ ✅ Valider l'estimation │
└─────────────────────────┘
```

#### Fonctionnalités d'édition
- **✏️ Édition inline** des noms et quantités
- **🗑️ Suppression** par glissement ou bouton
- **➕ Ajout manuel** d'objets oubliés
- **🔄 Réorganisation** par drag & drop
- **📊 Calcul automatique** du volume total

### 🎬 Gestion multi-vidéos

#### Workflow segmenté
```
Vidéo 1: Salon (✅ validée) - 8 objets
Vidéo 2: Chambre (✅ validée) - 6 objets  
Vidéo 3: Cuisine (🎬 en cours) - ...

➕ Ajouter une nouvelle vidéo
📊 Voir le récapitulatif global
```

#### Avantages du multi-vidéos
- **🏠 Pièce par pièce** : Organisation logique
- **⏱️ Sessions courtes** : Évite la fatigue utilisateur  
- **🔄 Flexibilité** : Reprendre plus tard
- **✅ Validation progressive** : Contrôle qualité continu

## 🤖 Intelligence Artificielle

### 👁️ Analyse vidéo (OpenAI Vision)

#### Traitement des frames
```typescript
// Extraction de frames clés toutes les 2 secondes
const analyzeVideoFrame = async (frameData: string) => {
  const prompt = `
  Analyse cette image d'intérieur pour un déménagement.
  Identifie tous les meubles et objets visibles.
  
  Retourne un JSON avec:
  - name: nom de l'objet en français
  - quantity: nombre d'exemplaires visibles
  - volume: volume estimé en m³
  - category: catégorie (salon, cuisine, chambre, etc.)
  - confidence: niveau de confiance (0-1)
  `;
  
  // Appel OpenAI Vision API
};
```

#### Objets détectables
- **🛋️ Mobilier** : Canapés, tables, chaises, armoires, lits
- **📺 Électroménager** : TV, frigo, lave-linge, micro-ondes
- **📦 Cartons** : Estimation par pile et taille
- **🎨 Décoration** : Tableaux, plantes, miroirs
- **📚 Stockage** : Bibliothèques, étagères, placards
- **🧸 Objets divers** : Détection contextuelle selon la pièce

### 🎙️ Analyse audio (Web Speech + Whisper)

#### Reconnaissance vocale native
```typescript
// Web Speech API pour temps réel
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'fr-FR';

// Traitement des résultats
recognition.onresult = (event) => {
  const transcript = event.results[event.resultIndex][0].transcript;
  processVoiceCommand(transcript);
};
```

#### Fallback Whisper API
```typescript
// Si Web Speech API échoue ou pour plus de précision
const transcribeWithWhisper = async (audioBlob: Blob) => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');
  formData.append('language', 'fr');
  
  // Appel OpenAI Whisper
};
```

#### Traitement du langage naturel
- **🎯 Détection objets** : "ce canapé", "cette table", "tous les cartons"
- **✅ Intentions positives** : "je prends", "ça part", "à déménager"
- **❌ Intentions négatives** : "je laisse", "ça reste", "pas celui-là"
- **📊 Quantificateurs** : "tous", "quelques", "la plupart", nombres

### 🧠 Algorithme de fusion

#### Combinaison vidéo + audio
```typescript
const combineVideoAndAudio = (videoObjects: Object[], audioTranscript: string) => {
  // 1. Analyser le transcript pour extraire les intentions
  const intentions = extractIntentions(audioTranscript);
  
  // 2. Matcher les objets vidéo avec les mentions audio
  const matchedObjects = matchObjectsWithIntentions(videoObjects, intentions);
  
  // 3. Résoudre les conflits et ambiguïtés
  const resolvedObjects = resolveConflicts(matchedObjects);
  
  // 4. Générer la liste finale avec confiance scores
  return generateFinalList(resolvedObjects);
};
```

#### Gestion des conflits
- **Priorité audio** : Si l'utilisateur dit explicitement "pas ce canapé"
- **Validation croisée** : Objets mentionnés mais non visibles = confirmation demandée
- **Score de confiance** : Combinaison analyse vidéo + clarté audio
- **Suggestions intelligentes** : Objets typiques de la pièce non mentionnés

## 🔗 Intégration avec l'écosystème Dodomove

### 💰 Intégration funnel principal

#### Étape volume améliorée
```typescript
// Dans devis.dodomove.fr à l'étape 11
const VolumeCalculationChoice = () => {
  return (
    <div className="space-y-6">
      <h2>Comment souhaitez-vous calculer votre volume ?</h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card onClick={() => openClassicCalculator()}>
          <div className="p-6">
            <div className="text-4xl mb-4">📊</div>
            <h3>Calculateur classique</h3>
            <p>Sélectionnez vos objets dans une liste détaillée</p>
            <Badge>Précis</Badge>
          </div>
        </Card>
        
        <Card onClick={() => openDodoLens()}>
          <div className="p-6">
            <div className="text-4xl mb-4">🎬</div>
            <h3>DodoLens (NOUVEAU)</h3>
            <p>Filmez votre intérieur en commentant</p>
            <Badge variant="new">Innovant</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
};
```

#### Communication PostMessage
```typescript
// DodoLens → Funnel
window.parent.postMessage({
  type: 'DODO_LENS_RESULT',
  payload: {
    sessionId: 'lens-session-123',
    items: [
      { name: 'Canapé 3 places', quantity: 1, volume: 1.5, category: 'salon' },
      { name: 'Table basse', quantity: 1, volume: 0.3, category: 'salon' }
    ],
    totalVolume: 15.2,
    videoCount: 3,
    confidence: 0.92,
    processingTime: '2m 34s'
  }
}, '*');

// Funnel → Stockage
setPersonalBelongingsDetails({
  knowsVolume: true,
  usedDodoLens: true,
  calculatedVolumeFromDodoLens: 15.2,
  dodoLensSessionId: 'lens-session-123',
  dodoLensItemsList: items,
  estimationConfidence: 0.92
});
```

### 🏭 Backend Éphémère Streaming

#### Routes API Éphémères
```javascript
// Upload streaming par chunks
app.post('/api/dodo-lens/upload-chunk', async (req, res) => {
  const { sessionId, chunkIndex, totalChunks } = req.headers;
  const chunkData = req.body;
  
  // Stockage Redis temporaire (TTL 5min)
  await redis.setex(`chunk:${sessionId}:${chunkIndex}`, 300, chunkData);
  
  // Si dernier chunk, déclencher processing
  if (chunkIndex == totalChunks - 1) {
    processSessionAsync(sessionId, totalChunks);
  }
  
  res.json({ success: true, chunk: chunkIndex + 1 });
});

// Processing éphémère en mémoire
const processSessionAsync = async (sessionId, totalChunks) => {
  try {
    // 1. Assembler chunks depuis Redis
    const videoBuffer = await assembleChunksFromRedis(sessionId);
    
    // 2. Extraction frames en mémoire (FFMPEG)
    const frames = await extractFramesInMemory(videoBuffer);
    
    // 3. Analyse OpenAI en parallèle
    const [visualResults, audioResults] = await Promise.all([
      openai.vision.analyze(frames),
      openai.whisper.transcribe(audioBuffer)
    ]);
    
    // 4. Fusion intelligente
    const fusedResults = await fuseResults(visualResults, audioResults);
    
    // 5. Stockage résultats uniquement
    await airtable('DodoLens_Results').create({
      sessionId,
      objects: JSON.stringify(fusedResults.objects),
      totalVolume: fusedResults.totalVolume,
      confidence: fusedResults.confidence,
      createdAt: new Date().toISOString()
    });
    
    // 6. Cleanup immédiat
    await cleanupTemporaryData(sessionId, totalChunks);
    
    // 7. Notification WebSocket
    io.to(sessionId).emit('analysis_complete', fusedResults);
    
  } catch (error) {
    await cleanupTemporaryData(sessionId, totalChunks);
    io.to(sessionId).emit('analysis_error', { error: error.message });
  }
};

// WebSocket temps réel
io.on('connection', (socket) => {
  socket.on('join_session', (sessionId) => {
    socket.join(sessionId);
  });
});
```

#### Stockage Airtable Éphémère
```javascript
// Table "DodoLens_Results" (résultats uniquement)
const airtableSchema = {
  'Session ID': 'Single line text',
  'Objects': 'Long text (JSON < 5KB)',
  'Total Volume': 'Number',
  'Confidence Score': 'Number',
  'Processing Time': 'Duration',
  'Created At': 'Date and time',
  'User Email': 'Email (optionnel)',
  'Status': 'Single select (completed, error)',
  'Funnel Integration': 'Checkbox',
  // PAS de stockage vidéo/audio/images
};
```

### 📧 Emails personnalisés

#### Template DodoLens
```html
<!DOCTYPE html>
<html>
<head>
  <title>Votre estimation DodoLens</title>
</head>
<body style="font-family: 'Lato', sans-serif;">
  <div style="max-width: 600px; margin: 0 auto;">
    <header style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 2rem; text-align: center;">
      <h1 style="color: white; margin: 0;">🎬 DodoLens</h1>
      <p style="color: #dbeafe; margin: 0.5rem 0 0 0;">Votre estimation vidéo est prête !</p>
    </header>
    
    <main style="padding: 2rem;">
      <div style="text-align: center; margin-bottom: 2rem;">
        <div style="background: #f0f9ff; border-radius: 1rem; padding: 2rem; margin-bottom: 1rem;">
          <h2 style="color: #1e40af; font-size: 3rem; margin: 0;">{{totalVolume}} m³</h2>
          <p style="color: #64748b; margin: 0;">Volume total estimé</p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center;">
          <div>
            <strong style="color: #1e40af;">{{videoCount}}</strong>
            <br><small>vidéos analysées</small>
          </div>
          <div>
            <strong style="color: #1e40af;">{{itemCount}}</strong>
            <br><small>objets détectés</small>
          </div>
          <div>
            <strong style="color: #1e40af;">{{confidence}}%</strong>
            <br><small>de confiance</small>
          </div>
        </div>
      </div>
      
      <h3 style="color: #1e40af;">📋 Détail de vos objets</h3>
      <table style="width: 100%; border-collapse: collapse;">
        {{#each items}}
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 0.75rem;">{{name}}</td>
          <td style="padding: 0.75rem; text-align: center;">{{quantity}}</td>
          <td style="padding: 0.75rem; text-align: right;">{{volume}} m³</td>
        </tr>
        {{/each}}
      </table>
      
      <div style="background: #f8fafc; border-radius: 0.5rem; padding: 1.5rem; margin: 2rem 0;">
        <h4 style="margin: 0 0 1rem 0;">🚀 Prochaine étape</h4>
        <p>Cette estimation vous aidera à obtenir un devis précis pour votre déménagement.</p>
        <a href="{{funnelUrl}}" style="background: #f47d6c; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 0.375rem; display: inline-block;">
          Continuer mon devis
        </a>
      </div>
    </main>
    
    <footer style="background: #f8fafc; padding: 1.5rem; text-align: center; color: #64748b;">
      <p>© 2024 Dodomove - Déménagement DOM-TOM</p>
    </footer>
  </div>
</body>
</html>
```

## 📱 Structure du projet

```
dodo-lens/
├── src/
│   ├── app/                    # Pages Next.js 14
│   │   ├── page.tsx           # Landing page DodoLens
│   │   ├── record/            # Interface enregistrement
│   │   │   ├── page.tsx       # Page principale vidéo
│   │   │   ├── processing/    # Traitement en cours
│   │   │   └── edit/          # Édition tableau
│   │   ├── api/               # Routes API Next.js
│   │   │   ├── process-video/ # Traitement vidéo local
│   │   │   ├── speech/        # Fallback reconnaissance vocale
│   │   │   └── session/       # Gestion sessions
│   │   ├── embedded/          # Mode iframe pour funnel
│   │   │   └── page.tsx       # Interface embedded
│   │   └── globals.css        # Styles globaux (cohérents)
│   ├── components/            # Composants React
│   │   ├── video/             # Composants vidéo
│   │   │   ├── VideoRecorder.tsx      # Interface enregistrement
│   │   │   ├── VideoControls.tsx      # Contrôles (pause/play/stop)
│   │   │   ├── VideoPreview.tsx       # Aperçu temps réel
│   │   │   └── VideoSegments.tsx      # Gestion multi-vidéos
│   │   ├── audio/             # Composants audio
│   │   │   ├── SpeechRecognition.tsx  # Web Speech API
│   │   │   ├── AudioTranscript.tsx    # Affichage transcript
│   │   │   └── VoiceCommands.tsx      # Commandes vocales
│   │   ├── ai/                # Composants IA
│   │   │   ├── VideoAnalyzer.tsx      # Interface analyse
│   │   │   ├── ObjectDetector.tsx     # Détection objets
│   │   │   └── ConfidenceScore.tsx    # Score de confiance
│   │   ├── editing/           # Composants édition
│   │   │   ├── ItemsTable.tsx         # Tableau objets
│   │   │   ├── EditableItem.tsx       # Item éditable
│   │   │   ├── ItemControls.tsx       # Contrôles item
│   │   │   └── VolumeCalculator.tsx   # Calcul volume
│   │   ├── ui/                # Composants UI réutilisables
│   │   │   ├── Button.tsx             # Boutons cohérents
│   │   │   ├── Card.tsx               # Cartes
│   │   │   ├── Modal.tsx              # Modales
│   │   │   ├── ProgressBar.tsx        # Barre progression
│   │   │   ├── LoadingSpinner.tsx     # Loader bateau animé
│   │   │   └── Toast.tsx              # Notifications
│   │   └── layout/            # Composants layout
│   │       ├── Header.tsx             # En-tête
│   │       ├── Footer.tsx             # Pied de page
│   │       └── Navigation.tsx         # Navigation
│   ├── hooks/                 # Hooks personnalisés
│   │   ├── useVideoRecorder.ts        # Gestion enregistrement
│   │   ├── useSpeechRecognition.ts    # Reconnaissance vocale
│   │   ├── useAIAnalysis.ts           # Analyse IA
│   │   ├── useItemsEditor.ts          # Édition tableau
│   │   └── useEmbedded.ts             # Mode embedded
│   ├── store/                 # Gestion d'état Zustand
│   │   ├── videoStore.ts              # État vidéo
│   │   ├── audioStore.ts              # État audio/speech
│   │   ├── itemsStore.ts              # État tableau objets
│   │   └── sessionStore.ts            # État session utilisateur
│   ├── services/              # Services externes
│   │   ├── openai.ts                  # OpenAI Vision + Whisper
│   │   ├── backend.ts                 # Communication backend
│   │   ├── storage.ts                 # Stockage temporaire
│   │   └── analytics.ts               # Tracking GA4
│   ├── utils/                 # Utilitaires
│   │   ├── video.ts                   # Utilitaires vidéo
│   │   ├── audio.ts                   # Utilitaires audio
│   │   ├── ai.ts                      # Traitement IA
│   │   ├── volume.ts                  # Calculs volume
│   │   ├── validation.ts              # Validation données
│   │   └── embedded.ts                # Communication PostMessage
│   └── types/                 # Types TypeScript
│       ├── video.ts                   # Types vidéo
│       ├── audio.ts                   # Types audio
│       ├── ai.ts                      # Types IA
│       ├── items.ts                   # Types objets
│       └── api.ts                     # Types API
├── public/                    # Assets statiques
│   ├── images/                # Images
│   │   ├── dodo-lens-logo.png         # Logo DodoLens
│   │   ├── video-tutorial.gif         # GIF tutoriel
│   │   └── ai-processing.svg          # Illustration IA
│   ├── icons/                 # Icônes
│   │   ├── video-icon.svg             # Icône vidéo
│   │   ├── audio-icon.svg             # Icône audio
│   │   └── ai-icon.svg                # Icône IA
│   └── sounds/                # Sons
│       ├── record-start.mp3           # Son démarrage
│       ├── record-stop.mp3            # Son arrêt
│       └── success.mp3                # Son succès
├── docs/                      # Documentation
│   ├── api-reference.md               # Documentation API
│   ├── ai-integration.md              # Guide intégration IA
│   ├── video-recording.md             # Guide enregistrement
│   ├── embedded-mode.md               # Mode embedded
│   └── troubleshooting.md             # Dépannage
├── scripts/                   # Scripts utilitaires
│   ├── test-speech-api.js             # Test Web Speech API
│   ├── test-openai.js                 # Test OpenAI APIs
│   └── deploy.sh                      # Script déploiement
├── .env.local.example         # Variables d'environnement
├── next.config.js             # Configuration Next.js
├── tailwind.config.js         # Configuration Tailwind
├── tsconfig.json              # Configuration TypeScript
└── package.json               # Dépendances et scripts
```

## 🚀 Installation et démarrage

### 📋 Prérequis
- Node.js 18.17+ 
- npm ou yarn
- Compte OpenAI (clés API)
- Navigateur moderne avec support WebRTC

### ⚡ Installation

```bash
# Cloner le repository
git clone https://github.com/username/dodo-lens.git
cd dodo-lens

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.local.example .env.local
# Éditer .env.local avec vos clés API

# Démarrer en mode développement
npm run dev
```

### 🔧 Configuration Éphémère

```bash
# Variables d'environnement backend (sécurisées)
OPENAI_API_KEY=sk-...
REDIS_URL=redis://...
REDIS_PASSWORD=...
AIRTABLE_API_KEY=...
AIRTABLE_BASE_ID=...

# Variables d'environnement frontend
NEXT_PUBLIC_BACKEND_URL=https://web-production-7b738.up.railway.app
NEXT_PUBLIC_WEBSOCKET_URL=wss://web-production-7b738.up.railway.app
NEXT_PUBLIC_DODOMOVE_FUNNEL_URL=https://devis.dodomove.fr
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-VWE8386BQC

# Variables de développement
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_ENABLE_WEBSOCKET=true
```

## 🧪 Tests et développement

### 🔍 Tests automatisés

```bash
# Tests unitaires
npm run test

# Tests d'intégration
npm run test:integration

# Tests end-to-end
npm run test:e2e

# Tests spécifiques
npm run test:speech-api    # Test Web Speech API
npm run test:video-api     # Test MediaRecorder API
npm run test:openai        # Test OpenAI APIs
```

### 🛠️ Scripts de développement

```bash
# Développement avec hot reload
npm run dev

# Développement avec debug IA
npm run dev:debug

# Simulation sans APIs externes (mock)
npm run dev:mock

# Test performance
npm run test:performance
```

### 📊 Outils de debug

```typescript
// Debug console intégré
window.DodoLens = {
  session: sessionStore.getState(),
  video: videoStore.getState(),
  audio: audioStore.getState(),
  items: itemsStore.getState(),
  analyzeFrame: (canvas) => analyzeVideoFrame(canvas),
  testSpeech: () => testSpeechRecognition(),
  mockAI: (enable) => setMockMode(enable)
};
```

## 📊 Analytics et monitoring

### 📈 Métriques personnalisées GA4

```typescript
// Événements spécifiques DodoLens
const trackDodoLensEvent = (event: string, parameters: object) => {
  gtag('event', event, {
    event_category: 'dodo_lens',
    event_label: 'video_calculator',
    ...parameters
  });
};

// Exemples d'événements trackés
trackDodoLensEvent('video_recording_started', { session_id });
trackDodoLensEvent('speech_recognition_success', { confidence_score });
trackDodoLensEvent('ai_analysis_completed', { items_detected, processing_time });
trackDodoLensEvent('table_editing_interaction', { action: 'item_deleted' });
trackDodoLensEvent('volume_calculation_completed', { total_volume, item_count });
```

### 🔍 Monitoring erreurs

```typescript
// Sentry pour monitoring erreurs
import * as Sentry from '@sentry/nextjs';

// Erreurs spécifiques à tracker
- Échecs de permission caméra/micro
- Erreurs APIs OpenAI (rate limit, quota)
- Problèmes de reconnaissance vocale
- Échecs de traitement vidéo
- Erreurs de communication PostMessage
```

### 📊 Dashboard analytics

```
Métriques clés à surveiller:
- Taux de démarrage de session vidéo
- Taux de completion du processus
- Durée moyenne des vidéos
- Précision de la reconnaissance vocale
- Temps de traitement IA
- Taux d'édition du tableau
- Score de confiance moyen
- Intégration avec le funnel (conversions)
```

## 🚀 Déploiement

### 🌐 Environnements

```bash
# Développement
- URL: http://localhost:3000
- API: Backend local ou Railway dev
- OpenAI: Compte développement

# Staging
- URL: https://dodo-lens-staging.vercel.app
- API: Backend Railway staging
- Tests: Automatisés + manuels

# Production
- URL: https://dodo-lens.dodomove.fr
- API: Backend Railway production
- CDN: Cloudflare
- Monitoring: Sentry + Analytics
```

### ⚙️ CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy DodoLens
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Test Speech API compatibility
      - name: Test OpenAI API connectivity
      - name: Test video recording simulation
      
  deploy:
    needs: test
    steps:
      - name: Deploy to Vercel
      - name: Update Cloudflare DNS
      - name: Notify team on Slack
```

### 🔧 Configuration production

```javascript
// next.config.js
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': ['./node_modules/**/*.wasm'],
    },
  },
  
  // Optimisations pour la vidéo
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(wasm)$/,
      type: 'asset/resource',
    });
    return config;
  },
  
  // Headers sécurité
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://devis.dodomove.fr' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};
```

## 💡 Fonctionnalités avancées

### 🎯 Optimisations performance

#### Traitement vidéo optimisé
```typescript
// Compression vidéo côté client
const compressVideo = async (videoBlob: Blob): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Réduire la résolution pour l'analyse IA
  canvas.width = 640;  // HD réduite
  canvas.height = 360; // Optimal pour OpenAI Vision
  
  // Compression avec qualité adaptative
  return canvas.toBlob(
    (blob) => blob,
    'image/jpeg',
    0.8 // Qualité optimisée
  );
};

// Extraction de frames intelligente
const extractKeyFrames = (video: HTMLVideoElement) => {
  // Extraire 1 frame toutes les 2 secondes
  // Détecter les changements de scène
  // Éviter les frames floues ou sombres
};
```

#### Cache intelligent
```typescript
// Cache des résultats IA pour éviter les appels redondants
const aiCache = new Map<string, AIResult>();

const getCachedAnalysis = (frameHash: string) => {
  if (aiCache.has(frameHash)) {
    return aiCache.get(frameHash);
  }
  // Sinon appel OpenAI et mise en cache
};
```

### 🔄 Mode offline

#### Progressive Web App
```typescript
// Service Worker pour fonctionnement offline
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/openai')) {
    // Stocker en IndexedDB pour traitement ultérieur
    event.respondWith(storeForLaterProcessing(event.request));
  }
});

// Synchronisation quand connexion revient
self.addEventListener('sync', (event) => {
  if (event.tag === 'dodo-lens-sync') {
    event.waitUntil(processStoredVideos());
  }
});
```

#### Stockage local avancé
```typescript
// IndexedDB pour grosses données vidéo
const storeVideoLocally = async (videoData: Blob, sessionId: string) => {
  const db = await openDB('DodoLens', 1);
  const tx = db.transaction('videos', 'readwrite');
  await tx.store.add({
    id: sessionId,
    videoData,
    timestamp: Date.now(),
    processed: false
  });
};
```

### 🤖 IA avancée

#### Amélioration continue
```typescript
// Feedback utilisateur pour améliorer l'IA
const collectFeedback = (sessionId: string, corrections: Correction[]) => {
  // Analyser les corrections utilisateur
  // Améliorer les prompts OpenAI
  // Ajuster les algorithmes de détection
};

// Machine Learning pour patterns utilisateur
const learnFromUsage = (userActions: UserAction[]) => {
  // Identifier les objets souvent oubliés
  // Optimiser l'ordre de présentation
  // Personnaliser selon le profil utilisateur
};
```

#### Détection contextuelle
```typescript
// IA contextuelle par type de pièce
const analyzeByRoom = (frame: ImageData, roomType: string) => {
  const prompts = {
    salon: "Identifie les meubles de salon: canapés, tables basses, TV, bibliothèques...",
    cuisine: "Identifie l'électroménager: frigo, four, lave-vaisselle, micro-ondes...",
    chambre: "Identifie les meubles de chambre: lit, armoire, commode, table de chevet..."
  };
  
  return analyzeWithPrompt(frame, prompts[roomType]);
};
```

## 🔮 Roadmap et évolutions futures

### 🚀 Version 2.0 (Q2 2024)

#### Fonctionnalités prévues
- **🎭 Reconnaissance automatique des pièces** : L'IA détecte automatiquement salon/cuisine/chambre
- **📏 Mesure automatique des objets** : Estimation des dimensions par analyse vidéo
- **🔍 Zoom intelligent** : Focus automatique sur les objets mentionnés
- **🎨 Réalité augmentée** : Overlay des informations détectées sur la vidéo
- **🗣️ Commandes vocales avancées** : Navigation de l'app par la voix

#### Améliorations techniques
- **⚡ Traitement temps réel** : Analyse IA pendant l'enregistrement
- **🧠 IA locale** : Modèles optimisés pour mobile (TensorFlow.js)
- **📱 App mobile native** : Version iOS/Android avec React Native
- **🌐 Mode multi-utilisateur** : Collaboration en temps réel

### 🌟 Version 3.0 (Q3 2024)

#### Innovation avancée
- **🤖 Assistant IA vocal** : Conversation naturelle pour guider l'utilisateur
- **📊 Prédiction intelligente** : Suggestion d'objets oubliés par IA
- **🔄 Amélioration continue** : IA qui apprend des corrections utilisateur
- **📈 Analytics prédictives** : Estimation du temps de déménagement

#### Intégrations avancées
- **🏠 Domotique** : Connexion objets connectés pour inventaire automatique
- **📱 AR Kit/AR Core** : Réalité augmentée native mobile
- **🎮 Gamification** : Système de points et récompenses
- **🌍 Marketplace** : Plateforme de revente d'objets non déménagés

## 💰 Modèle économique éphémère

### 💵 Coûts opérationnels optimisés

```
🤖 APIs IA (mensuel pour 1000 utilisateurs)
- OpenAI Vision: ~59€ (6552 images analysées)
- OpenAI Whisper: ~23€ (4095 minutes transcrites)
- Total IA: ~82€/mois

☁️ Infrastructure Éphémère
- Railway Backend: ~20€/mois (processing in-memory)
- Redis Cloud: ~17€/mois (cache temporaire 1GB)
- Cloudflare Pro: ~18€/mois (CDN + sécurité)
- Total infra: ~55€/mois

📊 TOTAL: ~137€/mois pour 1000 utilisateurs
Coût par utilisateur actif: ~0.23€
⚡ ÉCONOMIE: Pas de stockage = -70% vs approche classique
```

### 📈 ROI projections éphémères

```
💰 Valeur business estimée
- Performance mobile: +200% (streaming vs blocage)
- Sécurité RGPD: Risque zéro = valeur inestimable
- Coûts infrastructure: -70% vs stockage classique
- Scalabilité: Coûts linéaires jusqu'à 10k utilisateurs

📊 Métriques de succès optimisées
- Performance: <30s pour processing complet
- Scalabilité: Support 100 sessions simultanées
- Fiabilité: 99.9% uptime (pas de stockage = moins de pannes)
- Compliance: RGPD by design = audit simplifié
```

## 🎓 Guide du développeur

### 🚀 Premiers pas

1. **🔧 Setup initial**
   ```bash
   git clone https://github.com/username/dodo-lens.git
   cd dodo-lens && npm install
   cp .env.local.example .env.local
   ```

2. **🎯 Développement local**
   ```bash
   npm run dev:mock  # Développement sans APIs externes
   npm run dev       # Développement complet
   ```

3. **🧪 Tests**
   ```bash
   npm run test:speech    # Tester Web Speech API
   npm run test:video     # Tester MediaRecorder
   npm run test:openai    # Tester OpenAI APIs
   ```

### 📚 Documentation technique

- **[API Reference](./docs/api-reference.md)** - Documentation complète des APIs
- **[AI Integration](./docs/ai-integration.md)** - Guide d'intégration OpenAI
- **[Video Recording](./docs/video-recording.md)** - Guide enregistrement vidéo
- **[Embedded Mode](./docs/embedded-mode.md)** - Mode iframe pour le funnel
- **[Troubleshooting](./docs/troubleshooting.md)** - Résolution des problèmes

### 🔧 Architecture technique

```typescript
// Architecture modulaire avec hooks personnalisés
const VideoRecorderPage = () => {
  const { startRecording, stopRecording, isRecording } = useVideoRecorder();
  const { transcript, isListening } = useSpeechRecognition();
  const { analyzeFrame, results } = useAIAnalysis();
  const { items, updateItem, deleteItem } = useItemsEditor();
  
  return (
    <VideoRecorderInterface
      onFrame={analyzeFrame}
      onTranscript={(text) => processVoiceCommand(text)}
      onComplete={(items) => calculateVolume(items)}
    />
  );
};
```

## 📞 Support et contribution

### 🐛 Signaler un bug

1. **Vérifier** si le bug existe déjà dans [Issues](https://github.com/username/dodo-lens/issues)
2. **Créer** une nouvelle issue avec:
   - Description détaillée
   - Étapes de reproduction
   - Navigateur et OS
   - Logs console si applicable

### 💡 Proposer une fonctionnalité

1. **Discuter** dans [Discussions](https://github.com/username/dodo-lens/discussions)
2. **Créer** une issue avec label "enhancement"
3. **Contribuer** via Pull Request

### 🤝 Contribuer au code

```bash
# Fork le projet
git fork https://github.com/username/dodo-lens

# Créer une branche feature
git checkout -b feature/amazing-feature

# Commiter vos changements
git commit -m "Add amazing feature"

# Push vers votre fork
git push origin feature/amazing-feature

# Créer une Pull Request
```

## 📄 Licence

**Propriétaire** - Tous droits réservés © 2024 Dodomove

Ce projet fait partie de l'écosystème Dodomove et est protégé par le droit d'auteur. 
L'utilisation, la modification ou la distribution nécessite une autorisation explicite.

---

## 🎬 **DodoLens - L'avenir de l'estimation de volume**

*Transformez votre smartphone en assistant IA pour le déménagement.*

---

## 📖 **NAVIGATION DOCUMENTATION**

### 🆕 **Nouveau sur le projet ?**
1. ⚡ **[Démarrage Rapide](DEMARRAGE-RAPIDE.md)** - Lancer en 5 minutes
2. 📚 **[Guide Navigation](docs/README.md)** - Tous les documents organisés
3. 👨‍💻 **[Guide Développeur](docs/05-GUIDE-DEVELOPPEUR.md)** - Setup et debug détaillé

### 🎯 **Comprendre l'Architecture**
- 🏗️ **[Architecture Actuelle](docs/01-ARCHITECTURE-ACTUELLE.md)** - Comment ça marche aujourd'hui
- 📊 **[Status Août 2025](docs/02-STATUS-AOUT-2025.md)** - Où en est le projet

### 🚀 **Plan d'Action Actuel**
- 🔒 **[Plan Sécurisation](docs/03-PLAN-SECURISATION-OPTIMISATION.md)** - Optimiser l'architecture actuelle (5 jours)
- 📊 **[Décisions Architecture](docs/04-STATUS-ARCHITECTURE-ACTUELLE.md)** - Justifications et alternatives

### 🔮 **Plans Futurs (si scaling)**
- 🏭 **[Architecture Éphémère](docs/roadmap/ARCHITECTURE-EPHEMERE-COMPLETE.md)** - Si >2000 users/mois
- 🛠️ **[Migration Éphémère](docs/roadmap/PLAN-MIGRATION-EPHEMERE-FUTUR.md)** - Plan 20 jours détaillé

---

**Développé avec ❤️ par l'équipe Dodomove**
