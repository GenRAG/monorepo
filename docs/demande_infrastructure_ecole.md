# Demande de ressources d'hébergement — Projet GenRAG

> **Objet :** mise à disposition d'une VM école + financement du stockage de documents (AWS S3)
> **Projet :** GenRAG — plateforme SaaS de création d'assistants IA sur documents d'entreprise
> **Porteurs :** [Prénom Nom], [Prénom Nom] — [Promotion / Filière]
> **Date :** septembre 2026

---

## 1. Résumé de la demande

| # | Ressource | Spécification | Coût pour l'école |
|---|-----------|---------------|-------------------|
| 1 | **VM école** | 2 vCPU · 4 Go RAM · 60 Go SSD — héberge l'ensemble de l'application (interface web de la plateforme + backend + base de données) | Ressource interne existante |
| 2 | **Financement stockage S3** | Budget plafonné de **20 € sur 12 mois** (ou crédits AWS Academy / AWS Educate équivalents) | **≤ 20 € / an** |

> **Périmètre de la demande :** cette demande concerne uniquement la **plateforme GenRAG**, c'est-à-dire l'interface web, l'API, la base de données, la file de tâches et le stockage des documents importés. Le **moteur RAG** (recherche vectorielle, indexation, appels aux modèles d'IA) est un service distinct, développé et hébergé séparément. Il **n'est pas inclus** dans les ressources demandées ici. La plateforme le consomme comme une API externe.

En contrepartie, nous nous engageons à :
- limiter la consommation de la VM grâce à des plafonds de ressources par service (cf. §6) ;
- mettre en place une alerte de budget AWS qui bloque tout dépassement ;

---

## 2. Présentation du projet

GenRAG permet à une entreprise de créer, sans écrire de code, un **assistant IA qui répond uniquement à partir de ses propres documents** (procédures internes, FAQ, contrats, documentation technique…).

**Parcours type d'un client :**
1. L'entreprise crée un espace de travail et un agent.
2. Elle importe ses documents (PDF, DOCX, TXT…).
3. Elle configure la chaîne de traitement IA dans un éditeur visuel (reformulation de la question, recherche, classement des résultats, génération de la réponse...).
4. Elle teste l'agent, le déploie, puis le partage avec ses collaborateurs.

**Exemple concret :** une PME de 40 salariés importe son règlement intérieur, sa convention collective et ses procédures RH (≈ 30 PDF, 60 Mo). Ses salariés posent ensuite leurs questions à l'assistant (« Combien de jours de congé pour un mariage ? ») et obtiennent une réponse sourcée, avec renvoi vers le document concerné.

**Périmètre de la bêta :** l'année à venir correspond à une **bêta fermée de 10 à 30 utilisateurs**, dont environ **5 entreprises pilotes**. Toutes les projections de ce document reposent sur ce volume. Les ressources demandées gardent une marge confortable pour absorber les pics (imports de documents, mises à jour) **sans jamais solliciter l'école en cours d'année**.

---

## 3. Architecture technique

```
  Utilisateur
      │ HTTPS
┌─────▼─────────────────────────────────────────────────────────┐
│                     VM ÉCOLE (demandée)                       │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Caddy (HTTPS automatique, certificat wildcard)           │ │
│  │  app.genrag.app    → plateforme      (fichiers statiques)│ │
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

**Point important :** les calculs d'IA (modèles de langage, embeddings, reranking, recherche vectorielle) sont faits par le **moteur RAG, hébergé hors de cette VM**, et par des API de modèles externes. **Aucun GPU n'est nécessaire**. La VM héberge une API web classique, sa base de données, sa file de tâches et les fichiers statiques de la plateforme. Le site vitrine (`genrag.app`) est hébergé séparément sur une offre gratuite et n'utilise **aucune ressource de la VM**.

| Composant | Technologie | Rôle |
|-----------|-------------|------|
| Plateforme | React (build statique) | Interface de gestion des agents (`app.genrag.app`) et interface de chat des agents déployés (`<agent>.genrag.app`) |
| Backend | NestJS (Node.js 20) | API REST, authentification, orchestration des requêtes IA |
| Base de données | PostgreSQL 15 | Comptes, agents, workflows, conversations, journaux |
| File de tâches | Redis 7 + BullMQ | Indexation asynchrone des documents importés |
| Serveur web / reverse proxy | Caddy | Sert les fichiers statiques, relaie l'API, HTTPS automatique (Let's Encrypt, certificat wildcard) |
| Stockage fichiers | AWS S3 | Documents originaux importés par les clients |

---

## 4. Pourquoi nous quittons l'hébergement gratuit actuel

Nous utilisons aujourd'hui plusieurs offres gratuites (Railway, Neon, Upstash, Vercel). Elles ont suffi au prototypage, mais elles bloquent le passage en bêta :

| Service actuel | Limite rencontrée | Conséquence |
|----------------|-------------------|-------------|
| **Neon** (PostgreSQL) | Stockage gratuit ≈ 0,5 Go, base mise en veille après inactivité | Latence au réveil sur la première requête ; aucune marge pour les journaux et les connecteurs |
| **Upstash** (Redis) | Quota mensuel de commandes | Le worker d'indexation interroge Redis en continu et consomme le quota même sans activité |
| **Railway** (backend) | Crédit d'essai limité, puis offre payante | Service interrompu en fin de crédit |
| **Vercel** (frontend) | Offre gratuite réservée à un usage **non commercial** | Incompatible avec la facturation des clients ; offre payante ≈ 20 $/mois par membre |

*Limites relevées au moment de la rédaction ; elles peuvent évoluer.*

Regrouper **plateforme web, backend, base et Redis sur une seule VM** présente plusieurs avantages :
- l'exploitation est simple : un seul `docker compose` et un seul point de configuration DNS ;
- on supprime la latence entre services hébergés chez des fournisseurs différents ;
- le coût est prévisible.

La plateforme web n'ajoute quasiment aucune charge : ce sont des fichiers statiques (HTML/JS/CSS, quelques Mo), déjà compilés, que Caddy sert directement sans processus Node.js.

---

## 5. Dimensionnement de la VM — justification chiffrée

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

**Pourquoi 4 Go et pas 2 Go :** avec 10 à 30 utilisateurs, le besoin en RAM dépend très peu du nombre d'utilisateurs, mais beaucoup des pics ponctuels. Les pics de consommation viennent de l'indexation de documents volumineux (jusqu'à 15 Mo par fichier, gardés en mémoire pendant l'envoi au moteur RAG) et des mises à jour de l'application. Avec 2 Go, le système risquerait de tuer des processus (OOM) en pleine utilisation. 4 Go laissent une marge de sécurité de près de 50 %.

> **Version minimale acceptable :** 2 vCPU / 2 Go RAM + 2 Go de swap. C'est viable, mais les images Docker devront alors être construites hors de la VM (GitHub Actions), ce que nous prévoyons de toute façon.

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
| `genrag.app` | Site vitrine — **hébergé hors VM** | Page d'accueil publique |
| `app.genrag.app` | Plateforme de gestion | Création et configuration des agents |
| `api.genrag.app` | API backend | Appelée par la plateforme web |
| `*.genrag.app` | Un sous-domaine par agent déployé | `acme-rh.genrag.app` → assistant RH de l'entreprise Acme |

HTTPS est **obligatoire**, et pas seulement recommandé : le domaine `.app` impose HTTPS dans tous les navigateurs (HSTS préchargé), et l'authentification repose sur un cookie sécurisé (`Secure`). Caddy obtient et renouvelle automatiquement un certificat **wildcard** (`*.genrag.app`) couvrant tous les agents, par validation DNS. Aucun port supplémentaire n'est nécessaire pour cela.

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

## 6. Engagements d'exploitation et de sécurité

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
app.genrag.app, *.genrag.app {
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

### 6.4 Exemple de déploiement

Aucune compilation ne se fait sur la VM. GitHub Actions construit l'image du backend et les fichiers de la plateforme web, puis la mise à jour se résume à :

```bash
# Backend
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker compose exec server npx prisma migrate deploy

# Plateforme web : copie des fichiers compilés (bascule atomique, retour arrière possible)
rsync -a build/ vm:/opt/genrag/www/platform-<version>/
ssh vm 'ln -sfn platform-<version> /opt/genrag/www/platform'
```

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
| Taille max. d'un document | 15 Mo | Limite imposée par l'application |
| Documents par testeur | 10 (≈ 20 Mo) | Usage découverte |
| Documents par entreprise pilote | 150 (≈ 300 Mo) | Base documentaire d'une PME |
| Marge (fichiers remplacés, échecs, sauvegardes BDD) | +30 % | — |

**Exemples de clients types :**

| Client | Contenu | Volume |
|--------|---------|--------|
| Étudiant testant la plateforme | 5 cours en PDF | ~10 Mo |
| Cabinet comptable (pilote) | Fiches fiscales, modèles de lettres, FAQ clients | ~120 Mo |
| PME industrielle (pilote) | Notices techniques, procédures qualité ISO | ~500 Mo |

### 7.3 Projection du volume stocké

| Mois | Testeurs × 20 Mo | Pilotes × 300 Mo | Sous-total | **Avec marge +30 %** |
|------|------------------|------------------|------------|----------------------|
| M3 | 8 → 0,16 Go | 2 → 0,6 Go | 0,8 Go | **~1 Go** |
| M6 | 17 → 0,34 Go | 3 → 0,9 Go | 1,2 Go | **~1,6 Go** |
| M12 | 25 → 0,5 Go | 5 → 1,5 Go | 2,0 Go | **~2,6 Go** |

### 7.4 Coût estimé (région Paris `eu-west-3`)

Tarifs publics AWS S3 Standard, en ordre de grandeur :

| Poste | Tarif | Usage M12 estimé | Coût / mois à M12 |
|-------|-------|------------------|-------------------|
| Stockage | ~0,024 $/Go/mois | ~2,6 Go | ~0,06 $ |
| Écritures (PUT) | ~0,005 $ / 1 000 | ~500 imports/mois | < 0,01 $ |
| Lectures (GET) | ~0,0004 $ / 1 000 | ~5 000/mois | < 0,01 $ |
| Transfert sortant | 100 Go/mois gratuits | < 2 Go/mois | 0 $ |
| **Total** | | | **< 0,10 $/mois** |

**Coût cumulé sur 12 mois : moins de 1 $.** À ce volume, le coût est anecdotique. Le budget demandé sert à couvrir les imprévus (§7.5), pas l'usage courant.

### 7.5 Montant demandé

| Scénario | Hypothèse | Coût 12 mois |
|----------|-----------|--------------|
| Prévisionnel | Bêta fermée, ~30 utilisateurs | < 1 € |
| Connecteurs externes (§5.5) | Les pilotes synchronisent leurs espaces Drive / SharePoint / Notion : volume pilotes ×3, soit ~6,5 Go | ~2 € |
| Stress | Un pilote importe ~20 Go d'archives dès le début de l'année | ~6 € |
| **Budget demandé** | Couvre le scénario stress ×3, sauvegardes BDD comprises | **20 € / an** |

**Garanties de maîtrise du budget :**
- **alerte AWS Budgets** à 50 %, 80 % et 100 % du budget mensuel (2 €), envoyée aux porteurs du projet et, si l'école le souhaite, à un référent ;
- limite applicative de **15 Mo par fichier** ;
- **quotas de stockage par offre** (nombre de fichiers et volume total), appliqués aussi aux imports via connecteurs ;
- **import ciblé** : le client choisit les dossiers à synchroniser (jamais un Drive entier par défaut), avec un filtre par type de fichier (PDF, DOCX, TXT, pages Notion…) qui exclut vidéos, images et archives ;
- **politique de cycle de vie S3** : les sauvegardes de base de plus de 30 jours sont supprimées automatiquement et les documents supprimés par un client sont purgés ;
- si l'école dispose d'un programme **AWS Academy / AWS Educate**, des crédits éducatifs peuvent remplacer tout ou partie de ce financement.

> **Alternative sans financement :** Cloudflare R2, compatible S3, propose 10 Go gratuits de façon permanente sans frais de transfert sortant. Cela couvrirait l'intégralité de la bêta. L'application peut basculer dessus par simple changement de configuration. Nous privilégions AWS S3 pour sa maturité et la possibilité d'utiliser des crédits éducatifs.

---

## 8. Récapitulatif

| | Ressource | Spécification | Coût école |
|---|-----------|---------------|------------|
| ✅ | VM | 2 vCPU · 4 Go RAM · 60 Go SSD · IPv4 · ports 22/80/443 — héberge backend, base, Redis **et** plateforme web | Interne |
| ✅ | Budget S3 | Plafond 20 €/an, alerte AWS Budgets | ≤ 20 € |
| ➖ | Nom de domaine | `genrag.app`, détenu par l'équipe | 0 € |
| ➖ | Compilation | GitHub Actions (hors VM) | 0 € |
| ➖ | Moteur RAG | Service distinct, hébergé séparément — hors périmètre de cette demande | 0 € |
| ➖ | IA / LLM | API externes financées par le modèle de crédits | 0 € |

**Ce que l'école obtient :**
- un projet étudiant déployé en conditions réelles, présentable aux jurys, aux partenaires et aux futurs étudiants ;
- une consommation maîtrisée et plafonnée, avec un rapport d'usage trimestriel ;
- la possibilité de citer GenRAG comme projet incubé ou accompagné par l'école.

---

## Annexe — Contacts

| Rôle | Nom | Email |
|------|-----|-------|
| Porteur technique | [Prénom Nom] | [email] |
| Porteur projet | [Prénom Nom] | [email] |
