# Stratégie Financière & Projections — GenRAG
> Horizon : 12 mois | Équipe : 2 personnes | Modèle : SaaS B2B + crédits

---

## 1. Modèle Économique

### Structure des tiers

| Tier | Prix | Crédits inclus | Renouvellement |
|------|------|----------------|----------------|
| Free | 0 € | 50 crédits | Non renouvelable |
| Pro | 20 €/mois | 2 000 crédits | Mensuel |

### Mécanique des crédits

- **1 crédit = 0,01 €**
- **Principe** : GenRAG achète la réponse à l'API RAG à un coût réel C, et facture à l'utilisateur **C × 1,5** en crédits (marge de 50 % sur chaque requête)
- **Résultat** : sur 2 000 crédits consommés à 100 %, GenRAG dépense réellement **1 333 crédits** (~13,33 €) en coût API

### Marge brute par utilisateur Pro

| Scénario | Crédits consommés | Coût réel API | Revenu | Marge brute |
|----------|-------------------|---------------|--------|-------------|
| Faible usage (30 %) | 600 crédits | ~4 € | 20 € | ~80 % |
| Usage moyen (70 %) | 1 400 crédits | ~9,33 € | 20 € | ~53 % |
| Usage total (100 %) | 2 000 crédits | ~13,33 € | 20 € | ~33 % |

> **Hypothèse de base retenue : 70 % d'usage moyen → marge brute ~53 % par utilisateur Pro**

---

## 2. Structure des Coûts

### Coûts fixes mensuels

| Poste | Coût estimé / mois |
|-------|--------------------|
| Infrastructure plateforme (hébergement, PostgreSQL, Redis, S3) | 30 € |
| Infrastructure RAG (Qdrant, compute worker, API gateway) | 20–50 € |
| Outils (GitHub, monitoring, domaine, email) | 10–20 € |
| **Total fixe** | **~60–100 €/mois** |

### Coûts variables (liés à l'usage)

| Poste | Estimation |
|-------|------------|
| Coût LLM par requête (OpenRouter / modèle réponse) | ~0,005–0,015 € |
| Coût embedding par document indexé | ~0,001 € |
| Stockage MinIO par Go | Négligeable à ce stade |

### Coût de développement

> L'équipe est actuellement en mode **bootstrap** (pas de salaires). Le coût de développement est un **coût d'opportunité** à intégrer dans la valorisation future du projet.

| Phase | Estimation temps | Coût opportunité (tarif junior ~250 €/j) |
|-------|-----------------|------------------------------------------|
| MVP → Beta (M1–M3) | ~90 j/pers × 2 | ~45 000 € |
| Croissance (M4–M12) | ~180 j/pers × 2 | ~90 000 € |

---

## 3. Projections de Revenus sur 12 Mois

### Hypothèses de croissance

- Conversion Free → Pro : **8 %** des utilisateurs Free actifs
- Churn mensuel Pro : **5 %**
- Acquisition : principalement organique (LinkedIn, Product Hunt, bouche-à-oreille)

### Projections mensuelles

| Mois | Utilisateurs Free | Utilisateurs Pro | MRR | Coûts variables | Marge brute |
|------|-------------------|-----------------|-----|-----------------|-------------|
| M1 | 10 | 0 | 0 € | 0 € | — |
| M2 | 20 | 1 | 20 € | 9 € | 11 € |
| M3 | 35 | 2 | 40 € | 18 € | 22 € |
| M4 | 55 | 5 | 100 € | 45 € | 55 € |
| M5 | 80 | 9 | 180 € | 81 € | 99 € |
| M6 | 110 | 14 | 280 € | 126 € | 154 € |
| M7 | 145 | 20 | 400 € | 180 € | 220 € |
| M8 | 185 | 27 | 540 € | 243 € | 297 € |
| M9 | 230 | 35 | 700 € | 315 € | 385 € |
| M10 | 280 | 44 | 880 € | 396 € | 484 € |
| M11 | 335 | 54 | 1 080 € | 486 € | 594 € |
| M12 | 395 | 65 | 1 300 € | 585 € | 715 € |

> **ARR projeté à M12 : ~15 600 €**
> **MRR M12 après déduction des coûts fixes (~80 €) : ~635 €**

### Seuil de rentabilité (break-even)

> Les coûts fixes étant ~80 €/mois, le break-even est atteint à **4 utilisateurs Pro** (~M3–M4).
> Ce seuil ne couvre pas les coûts d'opportunité de l'équipe — il représente uniquement l'autofinancement de l'infrastructure.

---

## 4. KPIs à Suivre

### KPIs de croissance

| KPI | Définition | Cible M6 | Cible M12 |
|-----|------------|----------|-----------|
| **MRR** | Revenu mensuel récurrent | 280 € | 1 300 € |
| **Utilisateurs Pro actifs** | Abonnés payants actifs | 14 | 65 |
| **Taux de conversion Free → Pro** | % d'utilisateurs Free convertis | 8 % | 10 % |
| **Churn mensuel** | % d'abonnés Pro qui se désinscrivent | < 8 % | < 5 % |
| **Nouveaux utilisateurs Free / mois** | Acquisition brute | 30 | 60 |

### KPIs d'usage produit

| KPI | Définition | Cible |
|-----|------------|-------|
| **Requêtes / utilisateur Pro / mois** | Intensité d'usage | > 50 |
| **Documents indexés / agent** | Adoption du produit | > 5 |
| **Agents déployés en production** | Valeur perçue | > 1 par utilisateur Pro |
| **Taux d'activation** | % de Free ayant déployé au moins 1 agent | > 40 % |
| **Taux de consommation des crédits** | % des crédits utilisés sur le mois | 60–80 % |

### KPIs économiques

| KPI | Définition | Cible |
|-----|------------|-------|
| **CAC** (Coût d'acquisition client) | Coût total marketing / nouveaux clients Pro | < 30 € |
| **LTV** (Lifetime Value) | Revenu moyen par client sur sa durée de vie | > 100 € |
| **LTV / CAC** | Ratio de rentabilité d'acquisition | > 3 |
| **Marge brute moyenne** | Après déduction des coûts variables | > 50 % |
| **Revenu par crédit consommé** | Efficacité de la marge usage | 0,015 € |

> **LTV estimée** : avec un churn de 5 %/mois, la durée de vie moyenne est ~20 mois → LTV = 20 × 20 € = **400 €**
> **LTV / CAC cible** : 400 € / < 30 € = **> 13** — très favorable si l'acquisition reste organique

---

## 5. Dashboard de Contrôle (Tableau de Bord Court Terme)

À mettre à jour **chaque fin de mois** :

```
┌─────────────────────────────────────────────────────────┐
│                  GENRAG — TABLEAU DE BORD               │
│                        [MOIS / ANNÉE]                   │
├───────────────────────┬─────────────────────────────────┤
│  CROISSANCE           │  ÉCONOMIE                       │
│  Free actifs   : ___  │  MRR           : ___ €          │
│  Pro actifs    : ___  │  Coûts infra   : ___ €          │
│  Nouveaux Free : ___  │  Coûts API RAG : ___ €          │
│  Nouveaux Pro  : ___  │  Marge brute   : ___ €  (___ %) │
│  Churns Pro    : ___  │  Résultat net  : ___ €          │
├───────────────────────┼─────────────────────────────────┤
│  USAGE                │  ACQUISITION                    │
│  Requêtes/mois : ___  │  CAC estimé    : ___ €          │
│  Crédits conso : ___  │  LTV estimée   : ___ €          │
│  Agents dépl.  : ___  │  LTV / CAC     : ___            │
│  Docs indexés  : ___  │  Conv. Free→Pro: ___ %          │
└───────────────────────┴─────────────────────────────────┘

  Objectif MRR mois prochain : ___ €
  Action prioritaire         : ___________________________
```

---

## 6. Risques Financiers

| Risque | Probabilité | Impact | Atténuation |
|--------|-------------|--------|-------------|
| Coût LLM supérieur aux estimations | Moyenne | Fort | Surveiller le coût par requête, ajuster la marge |
| Churn élevé (> 10 %/mois) | Moyenne | Fort | Améliorer l'onboarding, suivre le taux d'activation |
| Faible conversion Free → Pro | Élevée (early stage) | Moyen | Réduire la friction, affiner le tier Free |
| Concurrence (players IA bien financés) | Élevée | Moyen | Niche RH + customisation no-code comme différenciant |
| Coûts infra qui explosent avec le scale | Faible | Moyen | Architecture microservices déjà en place |
