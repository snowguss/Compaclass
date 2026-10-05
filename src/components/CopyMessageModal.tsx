import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageSquare, BookOpen, Calendar, Sparkles } from 'lucide-react';
import { ClassGroup } from '../types';
import { getClassColorHex } from '../utils/colorUtils';

interface CopyMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  classGroup: ClassGroup;
  lessonTitle: string;
  hasHomework: boolean;
  homework?: string;
  homeworkDueDate?: string;
}

export const CopyMessageModal: React.FC<CopyMessageModalProps> = ({
  isOpen,
  onClose,
  message,
  classGroup,
  lessonTitle,
  hasHomework,
  homework,
  homeworkDueDate
}) => {
  const [copied, setCopied] = useState(false);
  const [editableMessage, setEditableMessage] = useState(message);

  // Atualiza texto quando a prop mudar
  React.useEffect(() => {
    setEditableMessage(message);
    setCopied(false);
  }, [message, isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editableMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  const handleOpenWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(editableMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        id="copy-message-modal"
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div 
          style={{ backgroundColor: getClassColorHex(classGroup.color) }}
          className="text-white p-5 sm:p-6 relative transition-colors"
        >
          <button
            onClick={onClose}
            id="btn-close-copy-message-modal"
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider bg-white text-slate-900 shadow-2xs">
              {classGroup.code}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-400 text-emerald-950 flex items-center gap-1 shadow-xs">
              <Check className="w-3 h-3" />
              Aula Salva no Diário!
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Mensagem Semanal da Turma
          </h3>
          <p className="text-xs text-white/90 mt-1">
            Copie e envie no grupo de WhatsApp dos alunos para repassar o que foi ensinado e os avisos.
          </p>
        </div>

        {/* Resumo Rápido */}
        <div className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 px-5 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">Lição:</span>
            <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              {lessonTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">Homework:</span>
            {hasHomework ? (
              <span className="bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-md font-bold text-[11px] flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                Sim {homeworkDueDate ? `(Entrega ${homeworkDueDate})` : ''}
              </span>
            ) : (
              <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-bold text-[11px]">
                Não
              </span>
            )}
          </div>
        </div>

        {/* Caixa de Texto Formatada */}
        <div className="p-5 sm:p-6 space-y-4 bg-white dark:bg-slate-900">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                Modelo formatado para WhatsApp:
              </span>
              <span>Você pode editar o texto abaixo se desejar</span>
            </div>

            <textarea
              id="weekly-message-textarea"
              value={editableMessage}
              onChange={(e) => setEditableMessage(e.target.value)}
              rows={11}
              className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850 focus:bg-white dark:focus:bg-slate-900 focus:border-[#002B49] dark:focus:border-sky-400 focus:ring-2 focus:ring-[#002B49]/20 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-sans leading-relaxed outline-hidden transition-all shadow-inner resize-y"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              id="btn-whatsapp-share"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Enviar no WhatsApp
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                id="btn-dismiss-copy-modal"
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Concluir
              </button>

              <button
                type="button"
                onClick={handleCopy}
                id="btn-copy-message-clipboard"
                className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-98 cursor-pointer ${
                  copied 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'bg-[#002B49] dark:bg-sky-600 hover:bg-[#001f35] dark:hover:bg-sky-500'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copiado com Sucesso!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar Mensagem
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
