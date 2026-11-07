# The School — Supabase migration

## 1. Database
Run `supabase_schema.sql` once in Supabase SQL Editor.
Run `supabase_seed.sql` once to load the existing demo dataset.

## 2. Application
This version removes Dexie/IndexedDB from the application data layer. The existing `db.*` repository interface is retained as a compatibility layer backed by Supabase REST API.

The browser uses only the Supabase project URL and publishable key. Do not add a secret/service-role key to this file.

## 3. Local test
Double-click `START.bat`. It installs dependencies, builds, and serves the `dist` folder.

## 4. Expected result
Dashboard should show data coming from Supabase. In Settings/Dashboard the database engine should read `Supabase PostgreSQL (Active)`.

## 5. Important
The trial still uses the application's legacy username/password records. Do not use real sensitive student information until Supabase Auth + RLS policies are migrated for production.
