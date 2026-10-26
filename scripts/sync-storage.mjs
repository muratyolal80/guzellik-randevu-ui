#!/usr/bin/env node
// =============================================================================
// sync-storage.mjs — mirror Supabase Storage buckets SOURCE → TARGET via Storage API
// (backend-agnostic: local=file, prod=S3/MinIO). Roadmap F4.
//
// Data flows DOWN only (prod → staging/local). Refuses a prod target.
//
//   SRC_URL=https://api.kuaforara.com.tr SRC_SERVICE_KEY=... \
//   DST_URL=http://localhost:8000        DST_SERVICE_KEY=... \
//   node scripts/sync-storage.mjs [--dry-run] [--bucket salon-images]
//
// Existing target objects are overwritten (upsert). Nothing is deleted on target.
// =============================================================================
import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const onlyBucket = args.includes("--bucket") ? args[args.indexOf("--bucket") + 1] : null;
const PROD_HOSTS = ["kuaforara.com.tr"];

const { SRC_URL, SRC_SERVICE_KEY, DST_URL, DST_SERVICE_KEY } = process.env;
if (!SRC_URL || !SRC_SERVICE_KEY || (!DRY && (!DST_URL || !DST_SERVICE_KEY))) {
  console.error("SRC_URL, SRC_SERVICE_KEY, DST_URL, DST_SERVICE_KEY gerekli (--dry-run için sadece SRC_*)");
  process.exit(2);
}
if (DST_URL && PROD_HOSTS.some((h) => new URL(DST_URL).hostname.endsWith(h))) {
  console.error(`❌ Hedef prod (${DST_URL}) — storage sadece aşağı yönde senkronlanır.`);
  process.exit(1);
}

const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const src = createClient(SRC_URL, SRC_SERVICE_KEY, opts);
const dst = DST_URL ? createClient(DST_URL, DST_SERVICE_KEY, opts) : null;

// Storage list() is one folder level at a time; entries without id are folders.
async function listAll(bucket, prefix = "") {
  const files = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await src.storage.from(bucket).list(prefix, { limit: 1000, offset });
    if (error) throw new Error(`${bucket}/${prefix}: ${error.message}`);
    for (const e of data) {
      const path = prefix ? `${prefix}/${e.name}` : e.name;
      if (e.id === null) files.push(...(await listAll(bucket, path)));
      else files.push({ path, type: e.metadata?.mimetype });
    }
    if (data.length < 1000) break;
  }
  return files;
}

const { data: buckets, error: bErr } = await src.storage.listBuckets();
if (bErr) throw bErr;

let copied = 0, failed = 0;
for (const b of buckets.filter((x) => !onlyBucket || x.name === onlyBucket)) {
  const files = await listAll(b.name);
  console.log(`🪣 ${b.name} (${b.public ? "public" : "private"}): ${files.length} dosya`);
  if (DRY) continue;

  const { error: cErr } = await dst.storage.createBucket(b.name, { public: b.public });
  if (cErr && !/exists/i.test(cErr.message)) throw cErr;

  for (const f of files) {
    const { data: blob, error: dErr } = await src.storage.from(b.name).download(f.path);
    const { error: uErr } = dErr
      ? { error: dErr }
      : await dst.storage.from(b.name).upload(f.path, blob, { upsert: true, contentType: f.type });
    if (uErr) { failed++; console.warn(`  ⚠️  ${f.path}: ${uErr.message}`); } else copied++;
  }
}
console.log(DRY ? "✅ dry-run bitti" : `✅ ${copied} dosya kopyalandı, ${failed} hata`);
process.exit(failed ? 1 : 0);
