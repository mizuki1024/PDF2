import React from 'react';
import { FileText, Plus, RefreshCw, Loader2, Share2, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { PDFDocument } from '../types';

interface PDFListProps {
  documents: PDFDocument[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpload: (file: File) => void;
  isSyncing: boolean;
  onRefresh: () => void;
  isLoggedIn: boolean;
}

export const PDFList: React.FC<PDFListProps> = ({
  documents,
  selectedId,
  onSelect,
  onUpload,
  isSyncing,
  onRefresh,
  isLoggedIn
}) => {
  const { driveService } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [sharing, setSharing] = React.useState<{ [key: string]: boolean }>({});

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onUpload(file);
    }
  };

  const handleShare = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!driveService || sharing[id]) return;

    try {
      setSharing(prev => ({ ...prev, [id]: true }));
      await driveService.shareFile(id);
      const doc = documents.find(d => d.id === id);
      if (doc?.url) {
        await navigator.clipboard.writeText(doc.url);
        alert('共有リンクをコピーしました！');
      }
    } catch (error) {
      console.error('Failed to share file:', error);
      alert('ファイルの共有に失敗しました。');
    } finally {
      setSharing(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Documents</h2>
        <div className="flex gap-2">
          {isLoggedIn && (
            <button
              onClick={onRefresh}
              disabled={isSyncing}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              title="Sync with Google Drive"
            >
              {isSyncing ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5 text-blue-600" />
              )}
            </button>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isSyncing}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            title="Upload PDF"
          >
            <Plus className="w-5 h-5 text-blue-600" />
          </button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="application/pdf"
          className="hidden"
        />
      </div>

      {!isLoggedIn && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 mb-2">
            ログインするとGoogle Driveと同期できます
          </p>
          <div className="flex items-center gap-1 text-xs text-blue-600">
            <LogIn className="w-4 h-4" />
            <span>ヘッダーからログイン</span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`group flex items-center gap-2 p-2 rounded-lg transition-colors ${
              selectedId === doc.id
                ? 'bg-blue-50'
                : 'hover:bg-gray-50'
            }`}
          >
            <button
              onClick={() => onSelect(doc.id)}
              className="flex-1 flex items-center gap-2 min-w-0"
            >
              <FileText className={`w-5 h-5 flex-shrink-0 ${
                selectedId === doc.id ? 'text-blue-600' : 'text-gray-700'
              }`} />
              <span className={`truncate text-sm text-left ${
                selectedId === doc.id ? 'text-blue-600' : 'text-gray-700'
              }`}>
                {doc.name}
              </span>
            </button>
            {!doc.isLocal && isLoggedIn && (
              <button
                onClick={(e) => handleShare(doc.id, e)}
                className={`p-1.5 rounded-full ${
                  sharing[doc.id]
                    ? 'bg-gray-100'
                    : 'opacity-0 group-hover:opacity-100 hover:bg-gray-100'
                } transition-all`}
                title="Share document"
              >
                {sharing[doc.id] ? (
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                ) : (
                  <Share2 className="w-4 h-4 text-gray-600" />
                )}
              </button>
            )}
          </div>
        ))}
        {documents.length === 0 && !isSyncing && (
          <p className="text-sm text-gray-500 text-center py-4">
            PDFファイルをアップロードしてください
          </p>
        )}
      </div>
    </div>
  );
};