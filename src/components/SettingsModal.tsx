import React, { useState } from 'react';
import type { AppSettings } from '../types';
import { X, Save, Download, Upload, Smartphone, Cloud, Code, Check } from 'lucide-react';
import { exportAppDataJSON, importAppDataJSON } from '../utils/storage';
import { SQL_SCHEMA_INSTRUCTIONS } from '../utils/supabase';

interface SettingsModalProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onClose: () => void;
  deferredPrompt: any; // PWA install prompt event
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
  onClose,
  deferredPrompt,
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

          {/* Section 2: Instalar no Celular */}
          <div className="space-y-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-rose-400" /> 2. Instalação no Celular (iOS & Android)
            </h4>
            <p className="text-xs text-slate-300">
              Funciona 100% no seu telefone sem ocupar espaço no seu servidor!
            </p>
            <button
              type="button"
              onClick={handleInstallPWA}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 hover:opacity-95"
            >
              <Smartphone className="w-4 h-4" /> Instalar Aplicativo na Tela de Início
            </button>
          </div>

          {/* Section 3: Backup Local (JSON) */}
          <div className="space-y-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              3. Compartilhar / Backup via Arquivo JSON
            </h4>
            <p className="text-xs text-slate-300">
              Você pode exportar seus dados em 1 clique e enviar pelo WhatsApp para sincronizar no celular do seu cônjuge.
            </p>

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

          {/* Section 4: Supabase Sync (Opcional - Gratuito) */}
          <div className="space-y-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-sky-400" /> 4. Sincronização em Tempo Real (Supabase Grátis)
            </h4>
            <p className="text-xs text-slate-300">
              Se quiser que cada alteração feita no seu telefone apareça instantaneamente no celular da sua esposa via nuvem (sem pagar nada de servidor), configure abaixo:
            </p>

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
              <label className="block text-xs text-slate-300 mb-1">Supabase Anon Key</label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
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
                {copiedSql ? 'Copiado!' : 'Copiar Código SQL para criar Tabela no Supabase'}
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
