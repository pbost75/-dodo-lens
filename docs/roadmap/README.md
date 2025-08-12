# 🔮 Roadmap DodoLens - Plans Futurs

> **Plans d'évolution** pour migration architecture éphémère (si scaling massif)

## ⚠️ **IMPORTANT : PLANS FUTURS CONDITIONNELS**

Ces documents contiennent des **plans détaillés pour une migration éventuelle** vers une architecture éphémère backend, mais **ne sont PAS le plan actuel**.

### 📊 **Décision Actuelle**
Le projet utilise actuellement une **architecture frontend optimisée** car :
- Volume cible : 500 utilisations/mois (pas 2000+)
- Usage : Outil optionnel dans funnel
- ROI : Architecture actuelle 2x moins chère (33€ vs 70€/mois)

### 🔄 **Quand Utiliser ces Plans ?**

Ces plans deviennent pertinents **SI** :
- Volume > 2000 utilisations/mois
- DodoLens devient obligatoire (non optionnel)
- Support > 10 tickets/mois performance
- Coût OpenAI > 50€/mois

---

## 📂 **CONTENU ROADMAP**

### 🏭 **[ARCHITECTURE-EPHEMERE-COMPLETE.md](ARCHITECTURE-EPHEMERE-COMPLETE.md)**
- Spécifications techniques complètes
- Streaming upload + processing in-memory
- Redis cache + WebSocket temps réel
- Sécurité RGPD by design
- **Durée lecture** : 45 minutes

### 🛠️ **[PLAN-MIGRATION-EPHEMERE-FUTUR.md](PLAN-MIGRATION-EPHEMERE-FUTUR.md)**
- Plan détaillé 4 phases / 20 jours
- Code complet à implémenter
- Infrastructure Redis + Railway
- Checklist validation
- **Durée implémentation** : 4 semaines

---

## 🎯 **PLAN ACTUEL vs PLAN FUTUR**

### ✅ **PLAN ACTUEL (À IMPLÉMENTER)**
📁 **[docs/03-PLAN-SECURISATION-OPTIMISATION.md](../03-PLAN-SECURISATION-OPTIMISATION.md)**
- Sécuriser architecture frontend existante
- Optimiser performance mobile
- 5 jours de développement
- 33€/mois final

### 🔮 **PLAN FUTUR (SI SCALING)**
📁 **[docs/roadmap/PLAN-MIGRATION-EPHEMERE-FUTUR.md](PLAN-MIGRATION-EPHEMERE-FUTUR.md)**
- Migration complète vers backend
- Architecture streaming éphémère
- 20 jours de développement
- 70€/mois final

---

## 📈 **MÉTRIQUES DE DÉCISION**

### 🚨 **Triggers Migration Éphémère**
```javascript
const shouldMigrateToEphemeral = (metrics) => {
  return (
    metrics.monthlyUsage > 2000 ||
    metrics.mandatoryInFunnel === true ||
    metrics.supportTicketsPerMonth > 10 ||
    metrics.openaiCostPerMonth > 50
  );
};
```

### 📊 **Monitoring Actuel**
- Usage mensuel : ~50 (très en dessous seuil)
- Statut funnel : Optionnel ✅
- Support tickets : ~2/mois ✅
- Coût OpenAI : ~15€/mois ✅

**→ Aucun trigger activé = Garder architecture actuelle**

---

## 🔄 **ÉVOLUTION DOCUMENTATION**

### 📅 **Historique Décisions**
1. **Août 2025** : Analyse complète architectures
2. **Août 2025** : Décision architecture frontend optimisée
3. **Future** : Réévaluation si métriques changent

### 📚 **Conservation Travail**
- **Tous les plans éphémère conservés** pour référence
- **Analyse coût/bénéfice documentée** pour traçabilité
- **Réflexion technique préservée** pour decisions futures

### 🎯 **Principe**
> "Garder le travail de réflexion sans confusion sur ce qui est actuel"

---

## 🆘 **AIDE NAVIGATION**

### 🆕 **Si vous découvrez le projet**
1. **NE COMMENCEZ PAS** par lire cette roadmap
2. **LISEZ D'ABORD** : [docs/README.md](../README.md) pour navigation
3. **PLAN ACTUEL** : [docs/03-PLAN-SECURISATION-OPTIMISATION.md](../03-PLAN-SECURISATION-OPTIMISATION.md)

### 🔮 **Si vous évaluez une migration**
1. **Vérifiez les triggers** ci-dessus
2. **Lisez l'architecture éphémère** complète
3. **Évaluez le ROI** selon votre contexte
4. **Suivez le plan migration** si validé

---

**🎯 Ces plans sont une assurance pour l'avenir, pas une obligation pour aujourd'hui.**
