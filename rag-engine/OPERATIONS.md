# GenRAG — Server Operations Runbook

How to reach the server, deploy, and keep it running. No secrets in this file — they live in the
server's `.env` and in GitHub Secrets.

---

## 1. The server

| | |
|---|---|
| Provider | Epitech VM manager |
| VM name | `terraformid-697` |
| IP | `152.228.144.50` (IPv6 `2001:41d0:304:300::b6`) |
| OS | Ubuntu 24.04 LTS |
| Public ports | `22` (SSH), `80` and `443` (HTTPS API at `https://rag-engine.genrag.app`, served by Caddy) — everything else is closed |
| Domain | `rag-engine.genrag.app` → `152.228.144.50` (A record; add an AAAA for `2001:41d0:304:300::b6` if wanted) |

**Users**

| User | Used for | sudo |
|---|---|---|
| `ubuntu` | You: admin tasks (apt, firewall, SSH config) | yes |
| `deploy` | Owns the repo, runs Docker, used by GitHub Actions | no (only `docker` group) |

---

## 2. Connecting

```bash
ssh ubuntu@152.228.144.50          # log in (SSH key only, no password)
sudo -iu deploy                    # switch to the deploy user
cd ~/RAG-GenRag                    # the repo: /home/deploy/RAG-GenRag
```

Optional shortcut in your laptop's `~/.ssh/config`:
```
Host genrag
  HostName 152.228.144.50
  User ubuntu
```
→ then just `ssh genrag`.

**Locked out?** (key lost, SSH broken) → use the console in the Epitech VM manager. Password login and
root login are disabled on purpose (`/etc/ssh/sshd_config.d/00-hardening.conf`).

**Give a teammate access:** they send you their **public** key (`~/.ssh/id_ed25519.pub`), you append it to
`/home/ubuntu/.ssh/authorized_keys`. Never share private keys.

---

## 3. Dashboards (Qdrant, MinIO)

They're only reachable from the server itself. Open an SSH tunnel from your laptop:

```bash
ssh -L 6333:localhost:6333 -L 9011:localhost:9011 ubuntu@152.228.144.50
```
Keep it open, then in your browser:
- Qdrant: http://localhost:6333/dashboard — asks for `QDRANT_API_KEY` (in the server's `.env`)
- MinIO: http://localhost:9011 — log in with `MINIO_USER` / `MINIO_PASSWORD`

---

## 4. Deploying

**Automatic:** every push to `main` runs `.github/workflows/deploy.yml`: SSH as `deploy` →
`git reset --hard origin/main` → `docker compose up -d --build`.

**Manual re-run:** GitHub → Actions → Deploy → *Run workflow*.

**By hand on the server:**
```bash
sudo -iu deploy && cd ~/RAG-GenRag
git pull
docker compose up -d --build
docker compose ps
```

> ⚠️ `git reset --hard` on deploy wipes uncommitted changes on the server. Never edit code there —
> commit and push from your laptop.

**GitHub configuration** (Settings → Secrets and variables → Actions)

| Secret | Value |
|---|---|
| `DEPLOY_HOST` | `152.228.144.50` |
| `DEPLOY_USER` | `deploy` |
| `DEPLOY_PATH` | `/home/deploy/RAG-GenRag` |
| `DEPLOY_SSH_KEY` | private key whose public half is in `/home/deploy/.ssh/authorized_keys` (comment `github-actions-deploy`) |

Plus a **read-only Deploy key** (Settings → Deploy keys) = `/home/deploy/.ssh/github_deploy.pub`, used by the
server to `git fetch`.

---

## 5. Everyday Docker commands

Run as `deploy` in `~/RAG-GenRag`:

```bash
docker compose ps                        # status of every service
docker compose logs -f rag_api           # follow API logs (also: ingestion_worker, redis, qdrant, minio)
docker compose logs --tail 100 ingestion_worker
docker compose restart rag_api           # restart one service (e.g. after editing .env)
docker compose up -d                     # (re)start everything
docker compose down                      # stop everything (data volumes are kept)
docker stats --no-stream                 # CPU / RAM per container
```

Health check: `curl https://rag-engine.genrag.app/health` → `{"status":"ok"}`.

Caddy (the HTTPS entry point) logs: `docker compose logs -f caddy`. Certificate problems usually mean
DNS for `rag-engine.genrag.app` doesn't point at the server yet, or port 80/443 is blocked.

---

## 6. Secrets (`.env`)

The server's `.env` is at `/home/deploy/RAG-GenRag/.env` (`chmod 600`, never committed).

| Variable | Where it comes from |
|---|---|
| `RAG_ENGINE_API_KEY`, `REDIS_PASSWORD`, `QDRANT_API_KEY`, `MINIO_PASSWORD` | `python3 scripts/generate_secrets.py` |
| `MINIO_USER` | pick a non-obvious name (not `admin` / `minioadmin`) |
| `OPENROUTER_API_KEY`, `ZEROENTROPY_API_KEY`, `COHERE_API_KEY`, `LANGFUSE_*` | the providers' dashboards |

**Rotate a secret:**
```bash
python3 scripts/generate_secrets.py --force RAG_ENGINE_API_KEY   # or any of the 4 generated keys
docker compose up -d                                             # services read .env at start
```
After rotating `RAG_ENGINE_API_KEY`, send the new value to the backend team **privately** (password
manager / one-time link — not a group chat). Read it with `grep ^RAG_ENGINE_API_KEY= .env`.

For a third-party key: create the new one in the provider's dashboard → put it in `.env` → restart →
revoke the old one.

---

## 7. Checking that everything works

From your **laptop** — only 22, 80 and 443 must answer:
```bash
for p in 22 80 443 6379 6333 9010 9011; do nc -zv -w3 152.228.144.50 $p; done
```

Public HTTPS (from anywhere):
```bash
curl -I https://rag-engine.genrag.app/health
```

Datasets / retrieval, from the server (as `deploy`, in the repo):
```bash
uv run python scripts/check_org_datasets.py --org-id <org> --api https://rag-engine.genrag.app
```

---

## 8. Troubleshooting

| Symptom | Look at | Usual fix |
|---|---|---|
| `Container … is unhealthy`, API/worker don't start | `docker compose ps`, then `docker compose logs <service>` | fix the failing dependency (Redis / Qdrant) first |
| `set REDIS_PASSWORD in .env` (or another variable) | `.env` | add the missing variable (`generate_secrets.py`) |
| `pull access denied` for an image | the image name in `docker-compose.yml` | the image was removed upstream — find a replacement (MinIO now uses `cgr.dev/chainguard/minio`) |
| Deploy workflow red | GitHub → Actions → the failed run's log | SSH step: check `DEPLOY_*` secrets / key; build step: same error as by hand |
| Disk full | `df -h`, `docker system df` | `docker image prune -f`; logs are capped at 3 × 10 MB per container |
| 401 from the API | backend's `X-API-Key` | key was rotated → update the backend |

**Redis won't start with `Wrong signature trying to load DB` / `dump.rdb` isn't a Redis file** — that's how the
previous VM was hacked (open, passwordless Redis). Check `head -c 16` of the file: a real one starts with
`REDIS00…`; `ELF` = malicious module. Treat the server as compromised: rotate every secret, rebuild the VM.

---

## 9. Security rules — don't break these

1. **Never publish Redis, Qdrant or MinIO ports** in `docker-compose.yml` (no `"6379:6379"`; at most
   `127.0.0.1:…`). Docker bypasses `ufw`, so the compose file *is* the firewall for containers.
2. **Never commit `.env`** or any key. `.env` and `.env.*` are git-ignored.
3. **SSH keys only**, no passwords, no root login.
4. Only the backend holds `RAG_ENGINE_API_KEY` — never the frontend.
5. Keep an **OpenRouter spending limit** set; check usage now and then (a leaked key shows up there first).
6. The VM installs security updates automatically (`unattended-upgrades`); reboot when the login banner says
   `*** System restart required ***` (`sudo reboot`).

Firewall (as `ubuntu`): `sudo ufw status verbose`. SSH brute-force protection: `fail2ban`.

---

## 10. Rebuilding the server from scratch

1. New Ubuntu 24.04 VM in the Epitech VM manager.
2. As `ubuntu`: `apt update && apt upgrade`; `ufw` (allow 22, 80, 443); `unattended-upgrades`, `fail2ban`;
   SSH hardening file (`PasswordAuthentication no`, `PermitRootLogin no`); `docker.io docker-compose-v2`;
   `/etc/docker/daemon.json` with log rotation.
3. Create `deploy` (`adduser --disabled-password deploy`, `usermod -aG docker deploy`).
4. As `deploy`: generate `~/.ssh/github_deploy`, add its `.pub` as a read-only Deploy key, `git clone`.
5. `cp .env_exemple .env`, fill third-party keys, `python3 scripts/generate_secrets.py`,
   `docker compose up -d --build`.
6. New `DEPLOY_SSH_KEY` pair → public half in `/home/deploy/.ssh/authorized_keys`, private half in GitHub;
   update `DEPLOY_HOST`.
7. Port check from your laptop (section 7), then re-upload documents.
