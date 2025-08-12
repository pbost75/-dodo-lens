# ⚡ Démarrage Rapide DodoLens

> **Guide express** pour lancer le projet en 5 minutes

## 🎯 **QU'EST-CE QUE DODO-LENS ?**

**Calculateur de volume révolutionnaire** qui permet aux utilisateurs de **filmer leur intérieur** en commentant vocalement ce qu'ils veulent déménager. L'IA analyse automatiquement pour générer une estimation de volume.

```
📱 Utilisateur filme → 🎙️ Commente vocalement → 🤖 IA analyse → 📊 Volume calculé
```

## 🚀 **LANCEMENT EN 5 MINUTES**

### 1️⃣ **Installation**
```bash
# Clone et dépendances
git clone [URL_REPO] dodo-lens
cd dodo-lens
npm install
```

### 2️⃣ **Configuration**
```bash
# Copier config environnement
cp env.local.example .env.local

# ✏️ Éditer .env.local - Ajouter votre clé OpenAI
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-key-here
```

### 3️⃣ **Démarrage**
```bash
# Lancer le serveur de développement
npm run dev

# 🌐 Ouvrir http://localhost:3000
```

### 4️⃣ **Test Mobile**
```bash
# Terminal séparé - Tunnel HTTPS pour mobile
npx ngrok http 3000

# 📱 Utiliser l'URL HTTPS sur votre smartphone
# Exemple: https://abc123.ngrok.io
```

## 📱 **PREMIÈRE UTILISATION**

1. **🌐 Ouvrir** l'URL HTTPS sur votre smartphone
2. **📱 Cliquer** "Interface Mobile" 
3. **🎬 Appuyer** le bouton rouge pour commencer l'enregistrement
4. **🎙️ Filmer** votre intérieur en commentant : 
   - "Ce canapé, je le prends"
   - "Cette table, je la laisse"
   - "Tous les cartons sur cette étagère"
5. **⏹️ Arrêter** l'enregistrement 
6. **📊 Voir** l'analyse IA et le volume calculé

## 📚 **DOCUMENTATION COMPLÈTE**

### 🗂️ **Navigation Documentation**
```
📖 README.md                    # Vue d'ensemble projet
📚 docs/README.md               # Guide navigation docs
👨‍💻 docs/05-GUIDE-DEVELOPPEUR.md  # Setup détaillé + debug
```

### 🎯 **Selon votre rôle**

#### 🆕 **Découverte Projet**
- 📖 **[README Principal](README.md)** - Vision et fonctionnalités
- 🏗️ **[Architecture Actuelle](docs/01-ARCHITECTURE-ACTUELLE.md)** - Comment ça marche

#### 👨‍💻 **Développement**  
- 👨‍💻 **[Guide Développeur](docs/05-GUIDE-DEVELOPPEUR.md)** - Setup, debug, bonnes pratiques
- 📊 **[Status Janvier 2025](docs/02-STATUS-JANVIER-2025.md)** - État du projet

#### 🚀 **Migration & Production**
- 🛠️ **[Plan Migration](docs/03-PLAN-MIGRATION-VERS-EPHEMERE.md)** - 20 jours vers architecture éphémère
- 🏭 **[Architecture Finale](docs/04-ARCHITECTURE-EPHEMERE-FINALE.md)** - Spécifications cible

## 🆘 **PROBLÈMES COURANTS**

### ❌ **"Permissions refusées" sur mobile**
```bash
# ✅ Solution : HTTPS obligatoire
npx ngrok http 3000
# Utiliser URL https:// sur mobile
```

### ❌ **"OpenAI API error"**
```bash
# ✅ Solution : Vérifier clé API dans .env.local
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-real-key-here
```

### ❌ **"Speech recognition failed"**
```bash
# ✅ Solution : Tester navigateur compatible
# Chrome mobile recommandé
# Safari iOS supporte webkitSpeechRecognition
```

### ❌ **"App lente/freeze"**
```bash
# ✅ Solutions temporaires :
# - Vidéos courtes (< 2 minutes)  
# - Fermer autres apps mobile
# - Wifi stable recommandé

# 🎯 Solution permanente :
# Migrer vers architecture éphémère backend
# Voir docs/03-PLAN-MIGRATION-VERS-EPHEMERE.md
```

## 📞 **AIDE RAPIDE**

### 🔧 **Debug Mobile**
1. **Console** : Ouvrir DevTools sur desktop, connecter mobile
2. **Logs** : Interface mobile affiche debug panel automatiquement
3. **Test** : Commencer par test speech seul via `/mobile`

### 🚀 **Prochaines Étapes**
1. **Comprendre** architecture actuelle (docs/)
2. **Tester** toutes les fonctionnalités  
3. **Planifier** migration architecture éphémère
4. **Implémenter** selon plan détaillé

---

**🎯 Objectif : Démo fonctionnelle en 5 minutes, compréhension complète en 1 jour, migration éphémère en 4 semaines.**
