# Supabase local setup

This repo includes a ready-to-run Supabase Docker setup under `supabase-project/`.

## Prerequisites

- Docker Desktop (with Compose v2)
- Git
- **Windows:** PowerShell recommended

---

## Windows (PowerShell) setup

> Run the following from the repo root.

1) Clone Supabase upstream (shallow clone)

```powershell
git clone --depth 1 https://github.com/supabase/supabase
```

2) Create your local project directory

```powershell
mkdir supabase-project
```

3) Your tree should look like

```
.
├── supabase
└── supabase-project
```

4) Copy the docker compose files into `supabase-project`

```powershell
Copy-Item -Recurse -Force .\supabase\docker\* .\supabase-project\
```

5) Copy the example env file

```powershell
Copy-Item .\supabase\docker\.env.example .\supabase-project\.env
```

6) Switch to the project directory

```powershell
cd .\supabase-project
```

7) Pull the latest images

```powershell
docker compose pull
```

8) Generate local keys

The upstream helper script is `bash`-based. On Windows you have 2 easy options:

- **Option A (recommended):** run it using Git Bash
- **Option B:** run it via WSL

### Option A — Git Bash

From `supabase-project/`, open **Git Bash** and run:

```bash
./utils/generate-keys.sh
```

### Option B — WSL

From WSL, in `supabase-project/`, run:

```bash
./utils/generate-keys.sh
```

9) Start the services (detached)

```powershell
docker compose up -d
```

10) Initialize/reset the DB

```powershell
..\reset-db.bat
```

---

## Linux / macOS (bash) setup

```bash
git clone --depth 1 https://github.com/supabase/supabase
mkdir supabase-project
cp -rf supabase/docker/* supabase-project
cp supabase/docker/.env.example supabase-project/.env
cd supabase-project
docker compose pull
sh ./utils/generate-keys.sh
docker compose up -d
./reset-db.sh
```
