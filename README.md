Copy and configure env's:
```bash
cp .env.example .env
```
Create network
```bash
docker network create noticer
```
Build and run project:
```bash
docker compose up -d
```