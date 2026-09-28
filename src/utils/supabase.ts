import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export const getSupabase = (url?: string, key?: string): SupabaseClient | null => {
  if (url && key) {
    try {
      supabaseClient = createClient(url, key);
      return supabaseClient;
    } catch (e) {
      console.error('Erro ao inicializar Supabase:', e);
      return null;
    }
  }
  return supabaseClient;
};

export const SQL_SCHEMA_INSTRUCTIONS = `
-- Cole este código no SQL Editor do seu Supabase (Gratuito):

CREATE TABLE IF NOT EXISTS casal_sync (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permite acesso de leitura/escrita com a chave pública (anon key)
ALTER TABLE casal_sync ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso Livre Casal" ON casal_sync FOR ALL USING (true);
`;
