# Altyapı: MCP & Geliştirme Akışı

## MCP Nedir?
**Model Context Protocol** — Claude Code'un dış kaynaklara (DB, dosya sistemi, web) doğrudan erişmesini sağlayan standart. Bu projede:

- **postgres MCP** — DB sorgu çalıştırma
- **supabase MCP** — Supabase API yönetimi (cloud + self-hosted)
- **magic MCP** — UI komponenti üretme (21st.dev)
- **claude.ai Excalidraw** — diyagram (system MCP)

## Konfigürasyon

`~/.claude.json` dosyasında (kullanıcının home klasörü):
```json
{
  "mcpServers": {
    "magic": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@21st-dev/magic@latest"],
      "env": { "API_KEY": "..." }
    },
    "supabase": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase"],
      "env": {
        "SUPABASE_URL": "http://localhost:8000",
        "SUPABASE_KEY": "<service_role_jwt>",
        "SUPABASE_ACCESS_TOKEN": "<personal_access_token>"
      }
    },
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres:<password>@localhost:5432/postgres?sslmode=disable"
      ]
    }
  }
}
```

**Doğrulama:** Claude Code yeniden başlattıktan sonra `/mcp` komutu ile bağlı server'lar listelenir.

## Bilinen Kısıtlar

### postgres MCP — Pooler Sorunu
Self-hosted Supabase kurulumunda `postgres` MCP `localhost:5432` üzerinden Supavisor pooler'a bağlanır. Pooler bazen `postgres` rolü yerine `postgres.<tenant>` formatı bekler — `Tenant or user not found` hatası verir.

**Çözüm:** Pooler bypass için doğrudan supabase-db container'ına bağlan:
```bash
docker exec -i supabase-db psql -U postgres -d postgres < migration.sql
```

### supabase MCP — Cloud-First
`@supabase/mcp-server-supabase` Cloud Supabase'i yönetmek için tasarlandı. Self-hosted için bazı özellikler (project listing, advisors) yetersiz olabilir. SQL execute ve list_tables çalışır.

## Geliştirme Akışı

### DB Değişikliği Gerekirse
1. `initdb/New-XX-Title.sql` dosyası yaz (idempotent)
2. MCP bağlıysa → otomatik uygula:
   ```typescript
   mcp__postgres__query veya mcp__supabase__execute_sql
   ```
3. MCP bağlı değilse → kullanıcıya manuel uyarı ver
4. `NOTIFY pgrst, 'reload schema'` ile cache yenile
5. Health check çalıştır:
   ```bash
   docker exec -i supabase-db psql -U postgres -d postgres < initdb/db-health-check.sql
   ```

### Test Akışı
1. **Type check:** `npx tsc --noEmit`
2. **Unit test:** `npm run test:run` (vitest, 32 test)
3. **API test:** Manuel curl
4. **UI test:** `npm run dev` + browser
5. **DB sağlık:** `db-health-check.sql`

## Lokal Ortam

```
Docker container'lar:
- supabase-db (PostgreSQL 15)        :5432 (pooler) / dahili
- supabase-pooler (Supavisor)        :5432 / :6543
- supabase-kong (API gateway)        :8000
- supabase-auth (GoTrue)             :9999 (dahili)
- supabase-storage                   :5000 (dahili)
- supabase-realtime                  :4000 (dahili)
- supabase-rest (PostgREST)          :3000 (dahili)
- supabase-studio                    :3000 (host)
```

**Erişim:**
- Supabase Studio: `http://localhost:8000` (admin)
- API: `http://localhost:8000/rest/v1/...` (anon/service_role JWT ile)
- Dev server: `http://localhost:3000`

## Açık Aksiyon (TODO)
- 🟡 **MCP doc içe** — yeni geliştirici onboarding için bu dosya yeterli mi? Test edilmeli
- 🟢 **Backup MCP** — DB backup/restore işlemleri için MCP entegrasyonu (manuel `pg_dump` yerine)
- 🟢 **Production MCP config** — staging/prod için ayrı config dosyaları

## Bağlantılar
- CLAUDE.md kuralları: [CLAUDE.md](../../CLAUDE.md)
- DB değişiklik feedback: `~/.claude/projects/.../memory/feedback_db_change_workflow.md`
- Supabase MCP: https://github.com/supabase/mcp-server-supabase
- Postgres MCP: https://github.com/modelcontextprotocol/servers/tree/main/src/postgres
