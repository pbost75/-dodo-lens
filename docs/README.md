# 📚 Documentation DodoLens

> **Guide de navigation** pour comprendre et reprendre le projet DodoLens

## 🎯 **DÉMARRAGE RAPIDE**

### 🆕 **Nouveau sur le projet ?**
1. 📖 **[README Principal](../README.md)** - Vue d'ensemble et vision
2. 🏗️ **[Architecture Actuelle](01-ARCHITECTURE-ACTUELLE.md)** - Comment ça marche aujourd'hui
3. 📊 **[Status Août 2025](02-STATUS-AOUT-2025.md)** - Où en est le projet

### 🚀 **Plan d'action actuel**
1. 🔒 **[Plan Sécurisation](03-PLAN-SECURISATION-OPTIMISATION.md)** - Optimiser l'architecture actuelle (5 jours)
2. 📊 **[Status Architecture](04-STATUS-ARCHITECTURE-ACTUELLE.md)** - Décisions et justifications
3. 👨‍💻 **[Guide Développeur](05-GUIDE-DEVELOPPEUR.md)** - Setup et bonnes pratiques

### 🔮 **Plans futurs (si scaling)**
1. 🏭 **[Architecture Éphémère](roadmap/ARCHITECTURE-EPHEMERE-COMPLETE.md)** - Si >2000 users/mois
2. 🛠️ **[Migration Éphémère](roadmap/PLAN-MIGRATION-EPHEMERE-FUTUR.md)** - Plan 20 jours détaillé

---

## 📂 **STRUCTURE DOCUMENTATION**

```
dodo-lens/docs/
├── README.md                                    # 👈 Ce fichier (navigation)
├── 01-ARCHITECTURE-ACTUELLE.md                 # Comment ça marche aujourd'hui
├── 02-STATUS-AOUT-2025.md                      # État du projet août 2025
├── 03-PLAN-SECURISATION-OPTIMISATION.md        # 🎯 PLAN ACTUEL (5 jours)
├── 04-STATUS-ARCHITECTURE-ACTUELLE.md          # Décisions et justifications
├── 05-GUIDE-DEVELOPPEUR.md                     # Setup et bonnes pratiques
├── STRUCTURE-PROJET.md                         # Organisation documentation
├── roadmap/                                    # 🔮 Plans futurs (si scaling)
│   ├── ARCHITECTURE-EPHEMERE-COMPLETE.md       # Architecture éphémère complète
│   └── PLAN-MIGRATION-EPHEMERE-FUTUR.md        # Migration éphémère (20 jours)
└── archive/                                    # Documents obsolètes
    ├── STATUS-AOUT-2025-OBSOLETE.md            # Ancien status
    └── INSTRUCTIONS-MOBILE-OBSOLETE.md         # Anciennes instructions
```

---

## 🔄 **ÉTAT DU PROJET**

### ✅ **ACTUELLEMENT (Août 2025)**
- **Architecture** : Client avec extraction frames mobile
- **APIs** : OpenAI connectées côté client (⚠️ non sécurisé)
- **Processing** : Local sur mobile (⚠️ performances limitées)
- **Stockage** : Aucun (✅ bon pour RGPD)

### 🎯 **CIBLE (Architecture Éphémère)**
- **Architecture** : Backend streaming avec processing serveur
- **APIs** : OpenAI sécurisées côté backend
- **Processing** : FFMPEG in-memory + Redis cache
- **Stockage** : Éphémère avec auto-cleanup

---

## 📋 **CHECKLIST REPRISE PROJET**

### 🏁 **Phase 1 : Compréhension (1 jour)**
- [ ] Lire README principal
- [ ] Comprendre architecture actuelle
- [ ] Examiner le code existant
- [ ] Tester l'app mobile actuelle

### 🔧 **Phase 2 : Setup Développement (1 jour)**
- [ ] Clone et install dépendances
- [ ] Configuration environnement
- [ ] Tests locaux
- [ ] Compréhension du code

### 🚀 **Phase 3 : Migration (4 semaines)**
- [ ] Suivre le plan de migration détaillé
- [ ] Tests à chaque étape
- [ ] Validation architecture éphémère
- [ ] Déploiement production

---

## 🆘 **AIDE ET SUPPORT**

### 📞 **Contacts**
- **Développement** : Voir historique Git pour l'équipe
- **Architecture** : Documentation complète dans ce dossier
- **Questions** : Consulter les TODOs dans le plan de migration

### 🔗 **Liens Utiles**
- **Repository** : Voir package.json pour l'URL Git
- **Déploiement** : Railway backend + Vercel frontend
- **Monitoring** : Logs Railway + analytics GA4

### 🛠️ **Outils Nécessaires**
- Node.js 18.17+
- npm ou yarn
- Compte OpenAI (clés API)
- Compte Redis Cloud (pour migration)
- Navigateur moderne avec WebRTC

---

**🎯 Objectif : Passer de l'architecture client actuelle à l'architecture éphémère backend pour sécurité, performance et compliance RGPD.**
