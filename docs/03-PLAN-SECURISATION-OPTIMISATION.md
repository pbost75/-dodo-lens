# 🔒 Plan Sécurisation + Optimisation DodoLens

> **Plan d'action actuel** pour optimiser l'architecture frontend existante

## 🎯 **CONTEXTE DÉCISION**

### 📊 **Analyse Coût/Bénéfice**
```
Architecture Actuelle Optimisée : ~33€/mois
Architecture Éphémère Complète : ~70€/mois
Volume cible : 500 utilisations/mois
Usage : Outil optionnel dans funnel devis
```

### ✅ **Décision Stratégique**
**Optimiser l'architecture actuelle** plutôt que migrer vers éphémère :
- **ROI** : 2x moins cher pour le volume cible
- **Complexité** : Appropriée pour outil optionnel
- **Maintenance** : Focus sur core business
- **Performance** : Suffisante avec optimisations

---

## 🛠️ **PLAN D'ACTION : 5 JOURS**

### 📅 **Phase 1 : Sécurisation (3 jours)**

#### **Jour 1 : Routes Proxy Backend**
```javascript
// Dans dodomove-backend (Railway) : routes/dodo-lens.js
app.post('/api/dodo-lens/analyze-vision', async (req, res) => {
  try {
    // Validation rate limiting
    const dailyUsage = await checkDailyUsage(req.ip);
    if (dailyUsage > 10) {
      return res.status(429).json({ 
        error: 'Limite quotidienne atteinte (10 analyses/jour)' 
      });
    }
    
    // Appel OpenAI sécurisé
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: req.body.prompt },
          { type: "image_url", image_url: { url: req.body.imageData } }
        ]
      }]
    });
    
    // Log usage pour monitoring
    await logUsage(req.ip, 'vision', response.usage);
    
    res.json(response.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ error: 'Erreur analyse IA' });
  }
});

app.post('/api/dodo-lens/analyze-audio', async (req, res) => {
  try {
    const dailyUsage = await checkDailyUsage(req.ip);
    if (dailyUsage > 10) {
      return res.status(429).json({ error: 'Limite quotidienne atteinte' });
    }
    
    const response = await openai.audio.transcriptions.create({
      file: req.body.audioFile,
      model: "whisper-1"
    });
    
    await logUsage(req.ip, 'whisper', response.usage);
    
    res.json({ transcript: response.text });
  } catch (error) {
    console.error('Whisper API Error:', error);
    res.status(500).json({ error: 'Erreur transcription audio' });
  }
});
```

#### **Jour 2 : Rate Limiting + Monitoring**
```javascript
// Rate limiting avec Redis ou mémoire
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

const limiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'dodo-lens:',
  }),
  windowMs: 24 * 60 * 60 * 1000, // 24h
  max: 10, // 10 requêtes par IP par jour
  message: {
    error: 'Limite quotidienne DodoLens atteinte',
    retryAfter: '24h'
  }
});

app.use('/api/dodo-lens', limiter);

// Monitoring usage
const logUsage = async (ip, type, usage) => {
  await db.collection('dodo_lens_usage').add({
    ip: hashIP(ip), // Hash pour RGPD
    type, // 'vision' ou 'whisper'
    usage,
    timestamp: new Date(),
    cost: calculateCost(type, usage)
  });
};
```

#### **Jour 3 : Migration Frontend**
```javascript
// Dans openaiService.ts - Remplacer appels directs
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const analyzeVideoFrame = async (frameData: string) => {
  // ❌ Avant : Appel direct OpenAI
  // const response = await openai.chat.completions.create(...)
  
  // ✅ Après : Appel backend sécurisé
  try {
    const response = await fetch(`${BACKEND_URL}/api/dodo-lens/analyze-vision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageData: frameData,
        prompt: `Analyse cette image d'intérieur pour un déménagement.
        
        Identifie tous les meubles et objets visibles.
        
        Retourne un JSON avec:
        - name: nom de l'objet en français
        - quantity: nombre d'exemplaires visibles
        - volume: volume estimé en m³
        - category: catégorie (salon, cuisine, chambre, etc.)
        - confidence: niveau de confiance (0-1)`
      })
    });
    
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Limite quotidienne atteinte. Réessayez demain.');
      }
      throw new Error('Erreur analyse IA');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur appel backend:', error);
    throw error;
  }
};

const analyzeAudioTranscript = async (audioBlob: Blob) => {
  const formData = new FormData();
  formData.append('audioFile', audioBlob, 'audio.webm');
  
  const response = await fetch(`${BACKEND_URL}/api/dodo-lens/analyze-audio`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Erreur transcription audio');
  }
  
  return await response.json();
};
```

### 📅 **Phase 2 : Optimisation Performance (2 jours)**

#### **Jour 4 : Détection Device + Settings Adaptatifs**
```javascript
// Dans utils/deviceDetection.ts
export const detectDeviceCapabilities = () => {
  const ua = navigator.userAgent;
  const memory = navigator.deviceMemory || 2;
  const cores = navigator.hardwareConcurrency || 2;
  
  let performanceScore = 0;
  
  // Device detection
  if (/iPhone/.test(ua)) {
    const version = ua.match(/iPhone OS (\d+)/)?.[1];
    performanceScore = version >= 14 ? 90 : version >= 12 ? 70 : 40;
  } else if (/Android/.test(ua)) {
    const version = ua.match(/Android (\d+)/)?.[1];
    performanceScore = version >= 11 ? 80 : version >= 9 ? 60 : 30;
  }
  
  // Hardware bonus
  performanceScore += (memory - 2) * 10;
  performanceScore += (cores - 2) * 5;
  
  return {
    score: Math.min(100, Math.max(0, performanceScore)),
    settings: getOptimalSettings(performanceScore)
  };
};

const getOptimalSettings = (score) => {
  if (score >= 80) {
    return {
      maxFrames: 8,
      quality: 0.8,
      resolution: '1280x720',
      parallelRequests: 3
    };
  } else if (score >= 60) {
    return {
      maxFrames: 5,
      quality: 0.6,
      resolution: '854x480',
      parallelRequests: 2
    };
  } else {
    return {
      maxFrames: 3,
      quality: 0.5,
      resolution: '640x360',
      parallelRequests: 1
    };
  }
};
```

#### **Jour 5 : Compression + Upload Intelligent**
```javascript
// Dans VideoImageAnalyzer.tsx
const processVideoWithOptimization = async (videoBlob: Blob) => {
  const deviceCaps = detectDeviceCapabilities();
  const settings = deviceCaps.settings;
  
  // Progress callback pour UX
  const updateProgress = (step: string, progress: number) => {
    setAnalysisProgress({
      step,
      progress,
      message: `${step} (${Math.round(progress)}%)`
    });
  };
  
  try {
    // 1. Extraction frames optimisée
    updateProgress('Extraction frames', 0);
    const frames = await extractVideoFramesOptimized(videoBlob, settings, updateProgress);
    
    // 2. Compression adaptative
    updateProgress('Compression images', 50);
    const compressedFrames = await Promise.all(
      frames.map(frame => compressFrame(frame, settings.quality))
    );
    
    // 3. Analyse IA avec parallélisme adaptatif
    updateProgress('Analyse IA', 70);
    const results = await analyzeFramesInBatches(
      compressedFrames, 
      settings.parallelRequests,
      updateProgress
    );
    
    updateProgress('Finalisation', 100);
    return results;
  } catch (error) {
    console.error('Erreur processing:', error);
    throw error;
  }
};

const compressFrame = (frameData: string, quality: number) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  return new Promise((resolve) => {
    img.onload = () => {
      // Redimensionner selon settings
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Compression avec qualité adaptative
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    img.src = frameData;
  });
};
```

---

## 📊 **MÉTRIQUES DE SUCCÈS**

### 🎯 **Objectifs Quantifiés**
```
Sécurité :
✅ 0 exposition clé API
✅ Rate limiting 10 analyses/jour/IP
✅ Monitoring usage temps réel

Performance :
✅ <60s pour devices récents (score ≥80)
✅ <90s pour devices moyens (score 60-80)
✅ Pas proposé pour devices anciens (<60)

Coûts :
✅ Maintenir ~33€/mois
✅ 0€ infrastructure additionnelle
✅ Monitoring consommation OpenAI
```

### 📈 **Métriques de Monitoring**
```javascript
// Dashboard monitoring
const dailyMetrics = {
  totalRequests: 45,
  successRate: 0.95,
  averageResponseTime: 4.2, // secondes
  openaiCost: 1.2, // euros
  errorsByType: {
    'rate_limit': 2,
    'openai_error': 1,
    'network_timeout': 1
  }
};
```

---

## 🔮 **ÉVOLUTION FUTURE**

### 📅 **Triggers Réévaluation Architecture**

#### **Migration Éphémère si :**
- Volume > 2000 utilisations/mois
- Devient obligatoire (non optionnel) dans funnel
- Support > 10 tickets/mois performance
- Besoin nouvelles fonctionnalités avancées

#### **Test LLaVA si :**
- Coût OpenAI > 50€/mois
- Qualité LLaVA s'améliore (>90% vs GPT-4V)
- Besoin indépendance fournisseur

### 🗂️ **Documentation Future**
- **Plans éphémère** : Conservés dans `docs/roadmap/`
- **Comparaisons** : A/B tests futurs documentés
- **Évolution** : Décisions architecturales tracées

---

## ✅ **CHECKLIST IMPLÉMENTATION**

### 🔒 **Phase 1 : Sécurisation**
- [x] Routes proxy OpenAI dans dodomove-backend ✅ **FAIT**
- [x] Rate limiting 10 req/jour/IP ✅ **FAIT**
- [x] Logging usage + monitoring coûts ✅ **FAIT**
- [ ] Migration calls frontend → backend
- [ ] Tests sécurité (clés non exposées)

### ⚡ **Phase 2 : Optimisation**
- [ ] Détection capabilities device
- [ ] Settings adaptatifs extraction frames
- [ ] Compression images intelligente
- [ ] Upload parallélisme adaptatif
- [ ] Progress UX temps réel

### 📊 **Phase 3 : Monitoring**
- [ ] Dashboard usage quotidien
- [ ] Alertes dépassement seuils
- [ ] Métriques performance par device
- [ ] Satisfaction utilisateur tracking

---

## 🎯 **AVANTAGES FINAUX**

### ✅ **Vs Architecture Actuelle**
- **Sécurité** : Clés API protégées
- **Contrôle** : Usage maîtrisé et monitoré
- **Performance** : Optimisée selon device
- **Coût** : Identique (~33€/mois)

### ✅ **Vs Architecture Éphémère**
- **Simplicité** : Pas de refonte majeure
- **Économie** : 2x moins cher (33€ vs 70€)
- **Maintenance** : Minimale
- **ROI** : Optimal pour 500 users/mois

**🎯 Résultat : Architecture hybride optimale = Sécurité maximale + Performance mobile + Coûts maîtrisés + Complexité appropriée**
