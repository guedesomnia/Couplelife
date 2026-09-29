import React, { useState } from 'react';
import type { AppSettings } from '../types';
import { X, Save, Download, Upload, Smartphone, Cloud, Code, Check, RefreshCw, Share2 } from 'lucide-react';
import { exportAppDataJSON, importAppDataJSON, generateWhatsAppSyncLink } from '../utils/storage';
import { SQL_SCHEMA_INSTRUCTIONS, formatSupabaseUrl } from '../utils/supabase';
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
  const [copiedLink, setCopiedLink] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      husbandName: husbandName.trim() || 'Ele',
      wifeName: wifeName.trim() || 'Ela',
      supabaseUrl: formatSupabaseUrl(supabaseUrl) || undefined,
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

  const handleShareWhatsAppSyncLink = () => {
    const link = generateWhatsAppSyncLink();
    const message = `Olá amor! Abra este link no seu celular para sincronizar os dados do nosso aplicativo:\n\n${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
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

          {/* Section 2: 1-Click WhatsApp Sync Link (ZERO SERVER NEEDED!) */}
          <div className="space-y-3 bg-gradient-to-r from-emerald-950/60 to-slate-800 p-4 rounded-xl border border-emerald-500/40 shadow">
            <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-emerald-400" /> 2. Sincronização 1-Clique via WhatsApp
            </h4>
            <p className="text-xs text-slate-300">
              Gere um link com todas as suas finanças e rotinas e envie pelo WhatsApp. Quando ela clicar no link no celular dela, os dados se juntam instantaneamente!
            </p>
            <button
              type="button"
              onClick={handleShareWhatsAppSyncLink}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition"
            >
              <Share2 className="w-4 h-4" /> Enviar Link de Atualização pelo WhatsApp
            </button>
            {copiedLink && (
              <p className="text-xs text-emerald-300 font-bold text-center">
                Link aberto para envio no WhatsApp!
              </p>
            )}
          </div>

          {/* Section 3: Status do Supabase */}
          <div className="space-y-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-sky-400" /> 3. Nuvem Supabase
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
                <p className="text-emerald-400 font-bold">
                  ✅ Nuvem Supabase Conectada e Sincronizando!
                </p>
              )}
              {syncStatus === 'syncing' && (
                <p className="text-amber-300 font-bold">
                  🔄 Sincronizando dados com a nuvem...
                </p>
              )}
              {syncStatus === 'offline' && (
                <p className="text-slate-400">
                  📱 Modo Local: Cole a URL da aba Data API do Supabase para ativar a nuvem.
                </p>
              )}
              {syncStatus === 'error' && (
                <p className="text-red-400 font-bold">
                  ⚠️ Erro ao conectar no Supabase. Vá no Supabase e clique em 'Data API' no menu esquerdo para copiar a URL correta.
                </p>
              )}
            </div>
          </div>

          {/* Section 4: Instalar no Celular */}
          <div className="space-y-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-rose-400" /> 4. Instalação no Celular
            </h4>
            <button
              type="button"
              onClick={handleInstallPWA}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 hover:opacity-95"
            >
              <Smartphone className="w-4 h-4" /> Instalar Aplicativo na Tela de Início
            </button>
          </div>

          {/* Section 5: Backup JSON */}
          <div className="space-y-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              5. Backup em Arquivo JSON
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

          {/* Section 6: Supabase Credentials */}
          <div className="space-y-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-sky-400" /> 6. Configurar Credenciais Supabase
            </h4>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Supabase URL (Disponível na aba Data API no menu esquerdo do Supabase)
              </label>
              <input
                type="text"
                placeholder="https://xyz.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setSupabaseUrl('https://zxjwvvfehmfhnrxryohg.supabase.co')}
                className="mt-1.5 text-[11px] text-sky-400 hover:text-sky-300 underline font-medium block"
              >
                ⚡ Inserir URL Correta (https://zxjwvvfehmfhnrxryohg.supabase.co)
              </button>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Supabase Key (Publishable key)</label>
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
                {copiedSql ? 'Copiado!' : 'Copiar Código SQL Atualizado'}
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
