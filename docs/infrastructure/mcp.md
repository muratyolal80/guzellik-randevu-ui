# Altyapı: MCP & Geliştirme Akışı

## MCP Nedir?
**Model Context Protocol** — Claude Code'un dış kaynaklara (DB, dosya sistemi, web) doğrudan erişmesini sağlayan standart. Bu projede 3 MCP kurulu:

- **postgres MCP** — ham SQL sorgu çalıştırma (tüm şema)
- **supabase MCP** — PostgREST üzerinden tablo CRUD (REST API)
- **supabase-storage MCP** — resim bucket'larında dosya yönetimi (özel, projeye ait)

## Konfigürasyon

Tüm MCP **kayıtları tek dosyada**: proje kökündeki **`.mcp.json`** (`mcpServers` objesi). Claude Code bir `mcp/` klasöründeki ayrı dosyaları **otomatik okumaz** — yalnızca `.mcp.json` (proje), `~/.claude.json` (kullanıcı) ve `.claude/settings.json` taranır. Özel bir MCP'nin **kodu** klasörde durabilir (`scripts/mcp/`), ama girişi yine `.mcp.json`'a yazılır. `.mcp.json` `.gitignore`'dadır → service key koymak güvenlidir.

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres:<password>@localhost:54322/postgres?sslmode=disable"
      ]
    },
    "supabase": {
      "command": "npx",
      "args": [
        "-y", "@supabase/mcp-server-postgrest",
        "--apiUrl", "http://localhost:8000/rest/v1",
        "--apiKey", "<service_role_jwt>",
        "--schema", "public"
      ]
    },
    "supabase-storage": {
      "command": "node",
      "args": ["scripts/mcp/supabase-storage-mcp.mjs"],
      "env": {
        "SUPABASE_URL": "http://localhost:8000",
        "SUPABASE_SERVICE_ROLE_KEY": "<service_role_jwt>"
      }
    }
  }
}
```

**Etkinleştirme:** `.claude/settings.local.json` → `enabledMcpjsonServers` listesine üç server da eklenir (`enableAllProjectMcpServers: true` de yeterlidir).

**Doğrulama:** Claude Code yeniden başlattıktan sonra `/mcp` komutu ile bağlı server'lar listelenir. `.mcp.json` değişiklikleri **ancak yeniden başlatınca** aktif olur.

## Bilinen Kısıtlar

### postgres MCP — Pooler Portu (ÇÖZÜLDÜ)
Host `localhost:5432` portu Supavisor **pooler**'a gider; pooler `postgres` rolü yerine `postgres.<tenant>` formatı beklediğinden `Tenant or user not found` hatası verir. Doğrudan postgres container'ı host'ta **`54322`** portuna map'lidir (`supabase-db` 5432 → host 54322).

**Çözüm:** Bağlantı string'inde **`54322`** kullan (pooler bypass). Uçtan uca doğrulandı — query çalışıyor.

### supabase MCP — Self-hosted için PostgREST
Resmî `@supabase/mcp-server-supabase` **Cloud** içindir (`SUPABASE_ACCESS_TOKEN` + `project-ref` ister), self-hosted localhost'ta çalışmaz. Bunun yerine **`@supabase/mcp-server-postgrest`** kullanılır: Kong gateway'in REST endpoint'i (`:8000/rest/v1`) üzerinden `public` şemasındaki tablolara service_role ile CRUD yapar.

### supabase-storage MCP — Özel server
Storage API'sini saran küçük Node MCP'si: [scripts/mcp/supabase-storage-mcp.mjs](../../scripts/mcp/supabase-storage-mcp.mjs). Bağımlılık olarak yalnızca projedeki `@supabase/supabase-js`'i kullanır, JSON-RPC stdio'yu manuel konuşur. Araçlar: `list_buckets`, `create_bucket`, `delete_bucket`, `empty_bucket`, `list_files`, `upload_file`, `download_file`, `delete_files`, `move_file`, `copy_file`, `get_public_url`, `create_signed_url`, `create_signed_upload_url`. Bucket'lar: `avatars`, `salon-images`, `staff-photos`, `reviews`, `system-assets`.

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
- supabase-db (PostgreSQL 15)        :54322 (host → container 5432, DOĞRUDAN — MCP bunu kullanır)
- supabase-pooler (Supavisor)        :5432 / :6543 (pooler — MCP için KULLANMA)
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
