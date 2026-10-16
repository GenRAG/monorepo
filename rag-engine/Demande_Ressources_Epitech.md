# Demande de ressources d'hébergement — Projet GenRAG

> **Objet :** mise à disposition de deux VM école (plateforme + moteur RAG) + financement du stockage de documents (AWS S3) + budget GPU serverless + crédits API IA (OpenRouter)
>
> **Projet :** GenRAG — plateforme SaaS de création d'assistants IA sur documents d'entreprise
>
> **Porteurs :** Valentin Peron, Quentin Bolloré  Promo 2027
>
> **Date :** septembre 2026

---

## 1. Résumé de la demande

| # | Ressource | Spécification | Coût pour l'école |
|---|-----------|---------------|-------------------|
| 1 | **VM école (plateforme)** | 2 vCPU · 4 Go RAM · 60 Go SSD — héberge l'ensemble de l'application (interface web de la plateforme + backend + base de données) | Ressource interne existante |
| 2 | **VM école (moteur RAG)** | 6 vCores · 12 Go RAM · 100 Go SSD NVMe — héberge l'ingestion, la recherche vectorielle et la génération des réponses IA | Ressource interne existante |
| 3 | **Financement stockage S3** | Budget plafonné de **50 € sur l'année Tek 5** | **≤ 50 € / an** |
| 4 | **GPU serverless (RunPod)** | ~70h de calcul L4, pour l'indexation de documents scannés et la transcription audio | **45 €** (année Tek 5) |
| 5 | **Crédits API IA (OpenRouter)** | Développement, tests de non-régression, usage de la bêta fermée | **240 €** (année Tek 5) |

En contrepartie, nous nous engageons à :
- limiter la consommation des deux VM grâce à des plafonds de ressources par service (cf. §6.1 et §8.2) ;
- mettre en place une alerte de budget AWS qui bloque tout dépassement ;
- mettre en place une alerte de budget OpenRouter à 50/80/100 % du montant demandé.

---

## 2. Présentation du projet

GenRAG permet à une entreprise de créer, sans écrire de code, un **assistant IA qui répond uniquement à partir de ses propres documents** (procédures internes, FAQ, contrats, documentation technique…).

**Parcours type d'un client :**
1. L'entreprise crée un espace de travail et un agent.
2. Elle importe ses documents (PDF, DOCX, TXT…) via local ou connecteur externe (Drive, Sharepoint, Notion...).
3. Elle configure la chaîne de traitement IA dans un éditeur visuel (reformulation de la question, recherche, classement des résultats, génération de la réponse...).
4. Elle teste l'agent, le déploie, puis le partage avec ses collaborateurs.

**Exemple concret :** une PME de 40 salariés importe son règlement intérieur, sa convention collective et ses procédures RH (≈ 30 PDF, 60 Mo). Ses salariés posent ensuite leurs questions à l'assistant (« Combien de jours de congé pour un mariage ? ») et obtiennent une réponse sourcée, avec renvoi vers le document concerné.

**Périmètre de la bêta :** l'année à venir correspond à une **bêta fermée de 10 à 30 utilisateurs**, dont **3 à 5 entreprises pilotes**. Toutes les projections de ce document reposent sur le haut de cette fourchette (5 pilotes), par cohérence avec la logique de marge appliquée au reste du dimensionnement. Les ressources demandées gardent une marge confortable pour absorber les pics (imports de documents, mises à jour) **sans jamais solliciter l'école en cours d'année**.

---

## 3. Architecture technique plateforme

```
  Utilisateur
      │ HTTPS
┌─────▼─────────────────────────────────────────────────────────┐
│                     VM ÉCOLE (demandée)                       │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Caddy (HTTPS automatique, certificat wildcard)           │ │
│  │  studio.genrag.app    → plateforme   (fichiers statiques)│ │
│  │  *.genrag.app      → agents déployés (fichiers statiques)│ │
│  │  api.genrag.app    → reverse proxy vers le backend       │ │
│  └───────────────────────────────┬──────────────────────────┘ │
│                                  │                            │
│                    ┌─────────────▼────────────┐               │
│                    │ API NestJS  +  worker    │               │
│                    │ (conteneurs séparés)     │               │
│                    └────┬───────────────┬─────┘               │
│                  ┌──────▼─────┐   ┌─────▼────┐                │
│                  │ PostgreSQL │   │  Redis   │                │
│                  │ (données)  │   │ (files)  │                │
│                  └────────────┘   └──────────┘                │
└──────────────────────────────┬────────────────────────────────┘
                               │
           ┌───────────────────┴───────────────────────┐
           ▼                                           ▼
   ┌───────────────┐                          ┌─────────────────┐
   │ AWS S3        │                          │ Moteur RAG      │
   │ (documents)   │                          │ (externe)       │
   │ ← FINANCEMENT │                          └─────────────────┘
   └───────────────┘
```

| Composant | Technologie | Rôle |
|-----------|-------------|------|
| Plateforme | React (build statique) | Interface de gestion des agents (`studio.genrag.app`) et interface de chat des agents déployés (`<agent>.genrag.app`) |
| Backend | NestJS (Node.js 20) | API REST, authentification, orchestration des requêtes IA |
| Base de données | PostgreSQL 15 | Comptes, agents, workflows, conversations, journaux |
| File de tâches | Redis 7 + BullMQ | Indexation asynchrone des documents importés |
| Serveur web / reverse proxy | Caddy | Sert les fichiers statiques, relaie l'API, HTTPS automatique (Let's Encrypt, certificat wildcard) |
| Stockage fichiers | AWS S3 | Documents originaux importés par les clients |

Le bloc "Moteur RAG (externe)" est détaillé en §8 : il s'agit d'un second service, hébergé sur sa propre VM école, responsable de l'ingestion des documents, de la recherche vectorielle et de la génération des réponses.

---

## 4. Pourquoi nous quittons l'hébergement gratuit actuel

Nous utilisons aujourd'hui plusieurs offres gratuites (Railway, Neon, Upstash, Vercel). Elles ont suffi au prototypage, mais elles bloquent le passage en bêta :

| Service actuel | Limite rencontrée | Conséquence |
|----------------|-------------------|-------------|
| **Neon** (PostgreSQL) | Stockage gratuit ≈ 0,5 Go, base mise en veille après inactivité | Latence au réveil sur la première requête ; aucune marge pour les journaux et les connecteurs |
| **Upstash** (Redis) | Quota mensuel de commandes | Le worker d'indexation interroge Redis en continu et consomme le quota même sans activité |
| **Railway** (backend) | Crédit d'essai limité, puis offre payante | Service interrompu en fin de crédit |
| **Vercel** (frontend) | Offre gratuite réservée à un usage non commercial | Incompatible avec la facturation des clients, offre payante ≈ 20 $/mois par membre |

*Limites relevées au moment de la rédaction ; elles peuvent évoluer.*

Regrouper **plateforme web, backend, base et Redis sur une seule VM** présente plusieurs avantages :
- l'exploitation est simple : un seul `docker compose` et un seul point de configuration DNS ;
- on supprime la latence entre services hébergés chez des fournisseurs différents ;
- le coût est prévisible.

La plateforme web n'ajoute quasiment aucune charge : ce sont des fichiers statiques (HTML/JS/CSS, quelques Mo), déjà compilés, que Caddy sert directement sans processus Node.js.

---

## 5. Dimensionnement de la VM plateforme — justification chiffrée

### 5.1 Mémoire vive (RAM)

Consommation mesurée ou estimée en charge normale :

| Service | RAM typique | Plafond configuré |
|---------|-------------|-------------------|
| Système (Ubuntu) + Docker | 350 Mo | — |
| Backend NestJS — API | 200 – 350 Mo | 512 Mo |
| Backend NestJS — worker (indexation, imports) | 150 – 400 Mo | 768 Mo |
| PostgreSQL 15 | 200 – 500 Mo | 1 Go |
| Redis 7 | < 100 Mo | 128 Mo |
| Caddy (HTTPS + fichiers statiques de la plateforme) | 30 – 60 Mo | 128 Mo |
| **Total** | **≈ 1,0 – 1,6 Go** | **≈ 2,5 Go** |

> **Impact de l'interface web :** environ 30 Mo de RAM supplémentaires. Les fichiers sont servis depuis le cache disque du système, sans serveur applicatif dédié. Même avec 1 000 visites par jour, la charge reste négligeable (quelques Mo transférés par visite).

**Pourquoi 4 Go et pas 2 Go :** avec 10 à 30 utilisateurs, le besoin en RAM dépend très peu du nombre d'utilisateurs, mais beaucoup des pics ponctuels. Les pics de consommation viennent de l'indexation de documents volumineux (jusqu'à 15 Mo par fichier, gardés en mémoire pendant l'envoi au moteur RAG) et des mises à jour de l'application. Avec 2 Go, le système risquerait de tuer des processus (OOM) en pleine utilisation. 4 Go laissent une marge d'environ 60 % au-dessus des plafonds alloués (2,5 Go), et davantage encore au-dessus de l'usage typique mesuré (1,0-1,6 Go).

### 5.2 Disque

Taille réelle d'un échange (question + réponse) stocké en base, d'après notre modèle de données :

| Élément | Taille |
|---------|--------|
| Question de l'utilisateur | ~0,2 Ko |
| Réponse de l'assistant | ~1 – 2 Ko |
| Sources citées (5 extraits de documents) | ~1 – 2 Ko |
| Journal d'exécution + index | ~0,5 Ko |
| **Total par échange** | **≈ 4 – 5 Ko** |

Projection sur 12 mois (bêta fermée : ~5 entreprises pilotes à ~500 questions/mois chacune, ~25 testeurs à ~30 questions/mois chacun) :

| Horizon | Utilisateurs (dont pilotes) | Échanges / mois | Volume BDD cumulé |
|---------|-----------------------------|-----------------|-------------------|
| M3 | ~10 (2) | ~1 000 | < 0,05 Go |
| M6 | ~20 (3) | ~2 000 | ~0,1 Go |
| M12 | ~30 (5) | ~3 000 | **~0,2 Go** |

La base de données reste donc **très petite**. Le disque sert surtout au système, aux images Docker et aux sauvegardes.

Répartition des 60 Go demandés :

| Poste | Espace |
|-------|--------|
| Système + images Docker | 10 Go |
| PostgreSQL (données + index + marge très large) | 5 Go |
| Sauvegardes locales (7 jours glissants) | 10 Go |
| Logs applicatifs (rotation) | 2 Go |
| Interface web (3 dernières versions conservées pour retour arrière) | < 0,5 Go |
| Marge (mises à jour, pics d'import, imprévus) | ~32 Go |
| **Total** | **60 Go** |

> Les **documents** des clients ne sont **pas** stockés sur la VM (cf. §7). Le disque reste ainsi stable et prévisible. Environ 30 Go suffiraient au strict fonctionnement. Les 60 Go demandés évitent toute demande d'extension en cours d'année.

### 5.3 Processeur

Le backend fait surtout des entrées/sorties : il attend les réponses des API d'IA et relaie le flux vers l'utilisateur. 2 vCPU suffisent largement. Pour donner un ordre de grandeur, une réponse IA prend 2 à 8 s, mais le backend ne consomme de CPU que quelques millisecondes pendant ce temps.

La compilation de l'interface web (React) est la seule tâche vraiment gourmande (1 – 2 Go de RAM, plusieurs minutes de CPU). Elle est **exécutée dans GitHub Actions** et non sur la VM : seuls les fichiers déjà compilés y sont copiés.

### 5.4 Réseau et accès

| Besoin | Détail |
|--------|--------|
| IPv4 publique | Les utilisateurs accèdent directement à la plateforme web et à l'API |
| Ports entrants | **22** (SSH, par clé uniquement), **80** et **443** (HTTP/HTTPS) |
| Nom de domaine | **Aucune action de l'école requise** : nous possédons `genrag.app`, dont les DNS (Cloudflare) pointeront vers l'IP de la VM |
| Accès | Compte `sudo` et Docker installable |

Organisation des domaines :

| Domaine | Contenu | Exemple |
|---------|---------|---------|
| `genrag.app` | Site vitrine -> **hébergé hors VM** | Page d'accueil publique |
| `studio.genrag.app` | Plateforme de gestion | Création et configuration des agents |
| `api.genrag.app` | API backend | Appelée par la plateforme web |
| `*.genrag.app` | Un sous-domaine par agent déployé | `acme-rh.genrag.app` → assistant RH de l'entreprise Acme |

### 5.5 Évolution prévue : connecteurs vers des services externes

Nous prévoyons de permettre aux clients d'importer leurs documents directement depuis **Google Drive, SharePoint / OneDrive et Notion**, sans téléchargement manuel. Le dimensionnement ci-dessus **tient déjà compte de cette évolution**.

**Fonctionnement :**
1. Le client autorise GenRAG à accéder à un dossier ou à un espace précis (OAuth, en lecture seule).
2. GenRAG liste les fichiers et crée **une tâche par fichier** dans la file Redis.
3. Le worker traite les tâches une à une : il télécharge le fichier depuis le service, le stocke sur S3 et l'envoie au moteur RAG pour indexation.
4. Les modifications ultérieures sont détectées par notification (webhooks Google Drive / Microsoft Graph) ou par synchronisation différentielle espacée. Seuls les fichiers modifiés sont retraités, jamais l'espace complet.

**Pourquoi l'impact sur la VM reste négligeable :**

| Opération | Où s'exécute la charge | Impact VM |
|-----------|------------------------|-----------|
| Authentification OAuth | Chez Google / Microsoft / Notion | Quelques requêtes HTTP |
| Conversion (Google Docs → PDF, pages Notion → texte) | API du service externe | Nulle |
| Téléchargement du fichier | Worker | Bande passante entrante, RAM ≤ 3 × 15 Mo par tâche |
| Extraction du texte, découpage, embeddings | Moteur RAG externe | Nulle |
| État de synchronisation (curseurs, jetons) | PostgreSQL | Quelques Ko par connexion |

**Exemple : import massif.** Une entreprise pilote connecte un dossier Drive de 500 fichiers (≈ 1 Go) :
- les 500 tâches sont mises en file et Redis ne stocke que leurs références (≈ 1 Ko chacune, soit moins de 1 Mo au total, jamais le contenu des fichiers) ;
- le worker en traite 2 simultanément, donc le pic de RAM reste **< 100 Mo** ;
- l'import prend environ 20 à 30 minutes, mais **l'API et le chat restent parfaitement réactifs**, car le worker tourne dans un conteneur séparé au plafond de ressources strict (cf. §6.1).

Autrement dit, un afflux d'imports **allonge le délai de traitement mais n'augmente pas la consommation de la VM**. La file d'attente absorbe les pics.

> Si l'école peut attribuer **4 vCPU** au lieu de 2 sans contrainte particulière, les imports massifs seront traités plus vite (concurrence du worker portée à 4). Ce n'est **pas indispensable** au fonctionnement.

---

## 6. Engagements d'exploitation et de sécurité (VM plateforme)

### 6.1 Plafonds de ressources par service

Chaque service a un plafond strict. Même en cas de bug, la VM ne peut pas dépasser ce qui a été alloué :

```yaml
# docker-compose.prod.yml (extrait)
services:
  server:                                    # API : répond aux utilisateurs
    image: ghcr.io/[org]/genrag-back:latest   # image construite en CI, pas sur la VM
    deploy:
      resources:
        limits: { memory: 512M, cpus: '1.0' }
    restart: unless-stopped

  worker:                                    # même image, traite la file de tâches
    image: ghcr.io/[org]/genrag-back:latest
    command: node dist/worker.js
    deploy:
      resources:
        limits: { memory: 768M, cpus: '1.0' }   # un import massif ne peut pas ralentir l'API
    restart: unless-stopped

  postgres:
    image: postgres:15
    deploy:
      resources:
        limits: { memory: 1G, cpus: '1.0' }
    # aucun port exposé : accessible uniquement par le backend
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 100mb --maxmemory-policy noeviction
    deploy:
      resources:
        limits: { memory: 128M, cpus: '0.25' }
    # aucun port exposé

  caddy:
    image: ghcr.io/caddybuilds/caddy-cloudflare:latest   # Caddy + validation DNS pour le wildcard
    ports: ["80:80", "443:443"]   # seuls ports publics
    deploy:
      resources:
        limits: { memory: 128M, cpus: '0.5' }
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - ./www:/srv:ro              # fichiers statiques de la plateforme, en lecture seule
      - caddy_data:/data           # certificats
```

```
# Caddyfile (extrait)
studio.genrag.app, *.genrag.app {
    tls { dns cloudflare {env.CF_API_TOKEN} }
    root * /srv/platform
    try_files {path} /index.html
    file_server
}

api.genrag.app {
    reverse_proxy server:8080 {
        flush_interval -1          # réponses IA en streaming
    }
}
```

### 6.2 Sécurité

| Mesure | Mise en œuvre |
|--------|---------------|
| Surface d'attaque minimale | Seuls les ports 22, 80 et 443 sont ouverts. PostgreSQL et Redis ne sont joignables que depuis le réseau Docker interne |
| SSH | Authentification par clé uniquement, root désactivé, `fail2ban` |
| Pare-feu | `ufw` en refus par défaut |
| Mises à jour | `unattended-upgrades` pour les correctifs de sécurité |
| Secrets | Variables d'environnement hors dépôt Git, fichier `.env` en `chmod 600` |
| Application | Mots de passe hachés (bcrypt), protection anti-brute-force sur la connexion, révocation des sessions à la déconnexion, contrôle d'accès par rôle |
| Supervision des erreurs | Sentry |

### 6.3 Sauvegardes

```bash
# crontab — sauvegarde quotidienne à 3h vers S3 (chiffrement SSE-S3), 30 jours de rétention
0 3 * * * docker exec postgres pg_dump -U genrag genrag | gzip \
  | aws s3 cp - s3://genrag-backups/db/$(date +\%F).sql.gz
```

Si la VM est perdue, le service peut être restauré sur une nouvelle machine en moins d'une heure (images Docker en registre + dernier dump en base).

---

## 7. Financement du stockage de documents (AWS S3)

### 7.1 Pourquoi un stockage externe

Les documents importés par les clients (PDF, DOCX…) sont le volume qui grossit le plus vite. Les stocker sur le disque de la VM poserait trois problèmes :
- **capacité** : le disque de la VM finirait par saturer ;
- **durabilité** : aucune redondance, donc une panne disque ferait perdre les documents des clients ;
- **charge** : les téléchargements passeraient par la VM et consommeraient sa bande passante.

S3 garantit une durabilité de 99,999999999 % et se facture à l'usage réel, ce qui convient à un projet en phase de lancement.

### 7.2 Hypothèses de volume

| Paramètre | Valeur retenue | Justification |
|-----------|----------------|---------------|
| Taille moyenne d'un document | 2 Mo | PDF de procédure ou de documentation typique |
| Taille max. d'un document | 30 Mo | Limite imposée par l'application |
| Documents par testeur | 10 (≈ 20 Mo) | Usage découverte |
| Base documentaire par entreprise pilote | **~10 Go** | Une vraie PME importe plus qu'un dossier de procédures texte : archives historiques, documents scannés, dossiers complets — très supérieur à un usage de démonstration |
| Marge (fichiers remplacés, échecs, sauvegardes BDD) | +30 % | — |

**Exemples de clients types :**

| Client | Contenu | Volume |
|--------|---------|--------|
| Étudiant testant la plateforme | 5 cours en PDF | ~10 Mo |
| Cabinet comptable (pilote) | Fiches fiscales, modèles de lettres, FAQ clients, archives dossiers clients | ~5-8 Go |
| PME industrielle (pilote) | Notices techniques, procédures qualité ISO, archives scannées | ~10-15 Go |

### 7.3 Projection du volume stocké

| Mois | Testeurs × 20 Mo | Pilotes × 10 Go | Sous-total | **Avec marge +30 %** |
|------|------------------|------------------|------------|----------------------|
| M3 | 8 → 0,16 Go | 2 → 20 Go | 20,16 Go | **~26 Go** |
| M6 | 17 → 0,34 Go | 3 → 30 Go | 30,34 Go | **~39 Go** |
| M12 | 25 → 0,5 Go | 5 → 50 Go | 50,5 Go | **~66 Go** |

### 7.4 Coût estimé (région Paris `eu-west-3`)

Tarifs publics AWS S3 Standard, en ordre de grandeur :

| Poste | Tarif | Usage M12 estimé | Coût / mois à M12 |
|-------|-------|------------------|-------------------|
| Stockage | ~0,024 $/Go/mois | ~66 Go | ~1,58 $ |
| Écritures (PUT) | ~0,005 $ / 1 000 | ~500 imports/mois | < 0,01 $ |
| Lectures (GET) | ~0,0004 $ / 1 000 | ~5 000/mois | < 0,01 $ |
| Transfert sortant | 100 Go/mois gratuits | < 2 Go/mois | 0 $ |
| **Total à M12** | | | **~1,60 $/mois** |

**Coût cumulé sur l'année :** le volume montant progressivement (26 → 39 → 66 Go), le coût moyen sur l'année reste inférieur au coût à pleine charge — de l'ordre de **~10 €/an** en usage courant (contre < 1 $ dans l'hypothèse initiale à 300 Mo/pilote). Ce n'est plus anecdotique, d'où la révision du budget demandé ci-dessous.

### 7.5 Montant demandé

| Scénario | Hypothèse | Coût (année Tek 5) |
|----------|-----------|--------------|
| Prévisionnel | Bêta fermée, jusqu'à 5 pilotes à ~10 Go chacun | ~10 € |
| Connecteurs externes (§5.5) | Les pilotes synchronisent leurs espaces Drive / SharePoint / Notion : volume pilotes ×3 | ~28 € |
| Stress | Un pilote importe une archive volumineuse (~100 Go) dès le début de l'année | ~15 € (incrémental) |
| **Budget demandé** | Couvre le cumul connecteurs + stress, sauvegardes BDD comprises | **50 € / an** |

**Garanties de maîtrise du budget :**
- **alerte AWS Budgets** à 50 %, 80 % et 100 % du budget mensuel (2 €), envoyée aux porteurs du projet et, si l'école le souhaite, à un référent ;
- limite applicative de **30 Mo par fichier** ;
- **quotas de stockage par offre** (nombre de fichiers et volume total), appliqués aussi aux imports via connecteurs ;
- **import ciblé** : le client choisit les dossiers à synchroniser (jamais un Drive entier par défaut), avec un filtre par type de fichier (PDF, DOCX, TXT, pages Notion…) qui exclut vidéos, images et archives ;
- **politique de cycle de vie S3** : les sauvegardes de base de plus de 30 jours sont supprimées automatiquement et les documents supprimés par un client sont purgés ;

---

## 8. Infrastructure du moteur RAG

Le moteur RAG (cf. schéma §3, bloc "Moteur RAG (externe)") est un service distinct de la plateforme : il gère l'ingestion des documents, la recherche vectorielle et la génération des réponses IA. Il nécessite sa propre VM, un budget GPU serverless pour les traitements lourds (OCR, transcription audio), et un budget d'usage IA (OpenRouter), détaillés ci-dessous.

### 8.1 Architecture technique

| Composant | Rôle |
|---|---|
| API FastAPI (`rag_api`) | Endpoints d'ingestion, de recherche et de génération (streaming) |
| Worker d'ingestion (`ingestion_worker`) | Parsing des documents, découpage en chunks, génération des embeddings |
| Qdrant | Base vectorielle (recherche sémantique) |
| MinIO | Stockage temporaire des fichiers sources avant indexation |
| Redis | File de jobs d'ingestion |

### 8.2 Dimensionnement de la VM — justification chiffrée

| Service | vCores (limite) | RAM (limite) |
|---|---|---|
| `rag_api` | 2 | 3 Go |
| `qdrant` | 1,5 | 3 Go |
| `ingestion_worker` (x2 réplicas) | 0,5 chacun | 1 Go chacun |
| `minio` | 0,25 | 1 Go |
| `redis` | 0,25 | 0,5 Go |
| **Total conteneurs** | **5** | **9,5 Go** |
| Réservé OS/Docker | 1 | 2,5 Go |
| **Total demandé** | **6 vCores** | **12 Go** |

**Pourquoi ce dimensionnement :** la charge est majoritairement I/O-bound — le calcul lourd (LLM, embeddings) est délégué à une API externe (OpenRouter), pas exécuté sur la VM. Seul le parsing de documents (`ingestion_worker`) est ponctuellement gourmand en CPU. Le worker est volontairement capé par conteneur pour qu'un pic d'ingestion (parsing d'un gros PDF) ne puisse jamais dégrader la latence du chat pour les autres utilisateurs.

**Disque (100 Go) :**

| Poste | Espace |
|---|---|
| Système + images Docker | 15-20 Go |
| Qdrant (données + snapshots) | 8-10 Go |
| MinIO (documents en attente de traitement) | 20-30 Go |
| Redis + logs applicatifs | 5 Go |
| **Sous-total réel** | **~48-65 Go** |
| Marge (pics d'ingestion, croissance du corpus, imprévus) | reste |
| **Total demandé** | **100 Go** |

> Même logique de marge que pour la VM plateforme (§5.2) : éviter toute demande d'extension en cours d'année. Les images Docker de ce service sont plus volumineuses que celles d'un backend classique (dépendances de parsing documentaire), d'où une marge système plus large.

### 8.3 GPU serverless — indexation de documents scannés et transcription audio

Certains documents clients sont des **scans** (contrats, procédures papier) nécessitant une étape d'indexation spécifique (reconnaissance du texte), et une fonctionnalité de **transcription audio** est également prévue. Ces traitements sont trop lourds pour tourner sur la VM du moteur RAG (CPU uniquement) :

| | CPU (VM moteur RAG) | GPU (serverless) |
|---|---|---|
| Vitesse d'indexation | ~10 s/page | ~12 ms/page |
| Impact sur un document de 150 pages | ~25 minutes, bloque un cœur entier du worker | ~1,8 seconde |

**Solution retenue : RunPod Serverless (GPU L4, pay-per-use, scale-to-zero)** — pas d'infrastructure GPU permanente à financer, on ne paie que l'usage réel.

| Ressource | Montant |
|---|---|
| Budget demandé | **45 €** |
| Compute obtenu | **~70h de L4** |
| Usages couverts | Indexation de documents scannés (TurboOCR) + transcription audio |

### 8.4 Budget d'usage IA (OpenRouter)

La bêta étant gratuite pour les testeurs et entreprises pilotes, l'intégralité de l'usage IA (génération de réponses, embeddings, tests) est à la charge du projet — ce budget n'est pas compensé par des revenus clients pendant cette phase.

| Poste | Montant | Détail |
|---|---|---|
| Développement (IA + site) | 30 € | Itération sur les blocks du pipeline (query rewriter, retrieve, answer, refusal, verified answer) pendant le build |
| Benchmark de non-régression | 60 € | Mise en place d'un dataset de benchmark, pour chacun des métiers traités par GenRAG, exécuté à travers le pipeline complet sur des évaluations plus ou moins complexes, puis évalué par un LLM-as-judge, pour détecter toute régression des différents blocks mis à disposition de nos clients : validation mensuelle avec un judge performant (Qwen 3.8 Max, 4 €/run × 6 runs) + contrôle quotidien avec des modèles open-source abordables (DeepSeek V4.1 Flash / GLM 5.3 Flash, ~0,20 €/run × 180 runs) |
| Usage bêta — entreprises pilotes | 150 € | Collecte de feedback qualitatif et quantitatif sur l'usage réel de la solution par les entreprises pilotes |
| **Total** | **240 €** | |

**Garanties de maîtrise du budget :** alerte de budget OpenRouter à 50 %, 80 % et 100 % des 240 €.

---

## 9. Récapitulatif

| | Ressource | Spécification | Coût école |
|---|-----------|---------------|------------|
| ✅ | VM plateforme | 2 vCPU · 4 Go RAM · 60 Go SSD · IPv4 · ports 22/80/443 — héberge backend, base, Redis **et** plateforme web | Pas communiqué |
| ✅ | VM moteur RAG | 6 vCores · 12 Go RAM · 100 Go SSD NVMe — héberge l'ingestion, Qdrant, MinIO et Redis | Pas communiqué |
| ✅ | Budget S3 | Plafond 50 €/an, alerte AWS Budgets | ≤ 50 € |
| ✅ | GPU serverless (RunPod) | ~70h de L4 — indexation de documents scannés et transcription audio | 45 € |
| ✅ | Crédits OpenRouter | Développement + non-régression + usage bêta | 240 € |
| ➖ | Nom de domaine | `genrag.app`, détenu par l'équipe | 0 € |
| ➖ | Compilation | GitHub Actions (hors VM) | 0 € |

**Total demandé à l'école : 335 € (hors ressources VM internes)**

**Ce que l'école obtient :**
- un projet étudiant déployé en conditions réelles, présentable aux jurys, aux partenaires et aux futurs étudiants ;
- une consommation maîtrisée et plafonnée, avec un rapport d'usage trimestriel ;

---
