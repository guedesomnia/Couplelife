import React, { useState } from 'react';
import type { AppSettings } from '../types';
import { X, Save, Download, Upload, Smartphone, Cloud, Code, Check, RefreshCw } from 'lucide-react';
import { exportAppDataJSON, importAppDataJSON } from '../utils/storage';
import { SQL_SCHEMA_INSTRUCTIONS } from '../utils/supabase';
import type { SyncStatusType } from '../App';

interface SettingsModalProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onClose: () => void;
  deferredPrompt: any; // PWA install prompt event
  syncStatus?: SyncStatusType;
  manualSync?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
  onClose,
  deferredPrompt,
  syncStatus = 'offline',
  manualSync,
}) => {
  const [husbandName, setHusbandName] = useState(settings.husbandName);
  const [wifeName, setWifeName] = useState(settings.wifeName);
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl || '');
  const [supabaseKey, setSupabaseKey] = useState(settings.supabaseKey || '');

  const [copiedSql, setCopiedSql] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      husbandName: husbandName.trim() || 'Ele',
      wifeName: wifeName.trim() || 'Ela',
      supabaseUrl: supabaseUrl.trim() || undefined,
      supabaseKey: supabaseKey.trim() || undefined,
    });
    onClose();
  };

  const handleExportJSON = () => {
    const jsonStr = exportAppDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-nossa-vida-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && importAppDataJSON(content)) {
        setImportStatus('Backup importado com sucesso! Atualize a página.');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setImportStatus('Erro ao importar arquivo de backup.');
      }
    };
    reader.readAsText(file);
  };

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      console.log('User choice:', choiceResult);
    } else {
      alert(
        'Para instalar no celular:\n\n• No iPhone (Safari): Toque no botão Compartilhar e selecione "Adicionar à Tela de Início".\n• No Android (Chrome): Toque nos 3 pontinhos e selecione "Instalar aplicativo" ou "Adicionar à tela inicial".'
      );
    }
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_INSTRUCTIONS);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-6 relative my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Configurações & Sincronização
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6 text-sm">
          {/* Section 1: Nomes do Casal */}
          <div className="space-y-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              1. Nomes do Casal
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Ele (Marido/Parceiro)</label>
                <input
                  type="text"
                  value={husbandName}
                  onChange={(e) => setHusbandName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Ela (Esposa/Parceira)</label>
                <input
                  type="text"
                  value={wifeName}
                  onChange={(e) => setWifeName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Status do Sync */}
          <div className="space-y-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-sky-400" /> Status da Sincronização
              </h4>
              {syncStatus !== 'offline' && manualSync && (
                <button
                  type="button"
                  onClick={manualSync}
                  className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Forçar Sync Agora
                </button>
              )}
            </div>

            <div className="text-xs">
              {syncStatus === 'synced' && (
                <p className="text-emerald-400 font-bold flex items-center gap-1.5">
                  ✅ Nuvem Supabase Conectada e Sincronizando!
                </p>
              )}
              {syncStatus === 'syncing' && (
                <p className="text-amber-300 font-bold flex items-center gap-1.5">
                  🔄 Sincronizando dados com a nuvem...
                </p>
              )}
              {syncStatus === 'offline' && (
                <p className="text-slate-400">
                  📱 Modo Local: Os dados estão salvos com segurança no seu aparelho.
                </p>
              )}
              {syncStatus === 'error' && (
                <p className="text-red-400 font-bold">
                  ⚠️ Erro ao conectar no Supabase. Verifique a URL e a Anon Key abaixo.
                </p>
              )}
            </div>
          </div>

          {/* Section 3: Instalar no Celular */}
          <div className="space-y-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-rose-400" /> 3. Instalação no Celular (iOS & Android)
            </h4>
            <button
              type="button"
              onClick={handleInstallPWA}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 hover:opacity-95"
            >
              <Smartphone className="w-4 h-4" /> Instalar Aplicativo na Tela de Início
            </button>
          </div>

          {/* Section 4: Backup Local (JSON) */}
          <div className="space-y-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              4. Compartilhar / Backup via Arquivo JSON
            </h4>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex-1 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4 text-emerald-400" /> Exportar Backup JSON
              </button>

              <label className="flex-1 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer">
                <Upload className="w-4 h-4 text-sky-400" /> Importar Backup
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus && (
              <p className="text-xs font-bold text-emerald-400 text-center">{importStatus}</p>
            )}
          </div>

          {/* Section 5: Supabase Cloud Credentials */}
          <div className="space-y-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-sky-400" /> 5. Credenciais do Supabase (Nuvem)
            </h4>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Supabase URL</label>
              <input
                type="text"
                placeholder="https://xyz.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Supabase Anon Key / Publishable Key</label>
              <input
                type="password"
                placeholder="sb_publishable_..."
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={copySqlToClipboard}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-950 text-slate-300 text-xs font-mono flex items-center justify-center gap-2 border border-slate-700"
              >
                {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Code className="w-4 h-4" />}
                {copiedSql ? 'Copiado!' : 'Copiar Código SQL Atualizado (Liberar RLS + Realtime)'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-medium text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Salvar Configurações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
