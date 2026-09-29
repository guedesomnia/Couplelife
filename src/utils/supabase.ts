import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;
let currentUrl = '';
let currentKey = '';

export const formatSupabaseUrl = (rawUrl?: string): string => {
  if (!rawUrl) return '';
  let cleaned = rawUrl.trim();
  if (!cleaned) return '';
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }
  // Auto-correct missing 'v' in user's project ID if present
  if (cleaned.includes('zxjwvfehmfhnrxryohg')) {
    cleaned = cleaned.replace('zxjwvfehmfhnrxryohg', 'zxjwvvfehmfhnrxryohg');
  }
  // remove trailing slash if any
  return cleaned.replace(/\/+$/, '');
};

export const getSupabase = (url?: string, key?: string): SupabaseClient | null => {
  const formattedUrl = formatSupabaseUrl(url);
  const formattedKey = key?.trim() || '';

  if (!formattedUrl || !formattedKey) return null;

  if (supabaseClient && currentUrl === formattedUrl && currentKey === formattedKey) {
    return supabaseClient;
  }

  try {
    currentUrl = formattedUrl;
    currentKey = formattedKey;
    supabaseClient = createClient(currentUrl, currentKey, {
      auth: { persistSession: false },
    });
    return supabaseClient;
  } catch (e) {
    console.error('Erro ao inicializar Supabase:', e);
    return null;
  }
};

export const SQL_SCHEMA_INSTRUCTIONS = `
-- Cole este código no SQL Editor do seu Supabase para liberar leitura e escrita livre do casal:

CREATE TABLE IF NOT EXISTS casal_sync (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilita RLS e libera leitura e inserção/atualização (USING + WITH CHECK)
ALTER TABLE casal_sync ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso Livre Casal" ON casal_sync;

CREATE POLICY "Acesso Livre Casal" 
ON casal_sync 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Ativa o Realtime no Supabase
ALTER PUBLICATION supabase_realtime ADD TABLE casal_sync;
`;
