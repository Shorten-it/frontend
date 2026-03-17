import { useState } from 'react';
import { apiClient } from '../api/client';
import type { ApiError } from '../api/types';
import type { UrlHistoryItem } from '../hooks/useUrlHistory';

interface Props {
  history: UrlHistoryItem[];
  onRemove: (shortUrl: string) => void;
  onClear: () => void;
}

export function UrlHistory({ history, onRemove, onClear }: Props) {
  const [preview, setPreview] = useState<{ shortUrl: string; longUrl: string } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (history.length === 0) return null;

  const handlePreview = async (shortUrl: string) => {
    if (preview?.shortUrl === shortUrl) {
      setPreview(null);
      return;
    }
    try {
      const res = await apiClient.previewUrl(shortUrl);
      setPreview({ shortUrl, longUrl: res.long_url });
    } catch (err) {
      const apiErr = err as ApiError;
      setPreview({ shortUrl, longUrl: `오류: ${apiErr.message}` });
    }
  };

  const handleDelete = async (shortUrl: string) => {
    if (confirmDelete !== shortUrl) {
      setConfirmDelete(shortUrl);
      return;
    }

    setDeleting(shortUrl);
    try {
      await apiClient.deleteUrl(shortUrl);
      onRemove(shortUrl);
    } catch {
      // 서버에서 삭제 실패해도 로컬에서는 제거
      onRemove(shortUrl);
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  };

  const copyUrl = async (shortUrl: string) => {
    const fullUrl = `${window.location.origin}/${shortUrl}`;
    await navigator.clipboard.writeText(fullUrl);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          최근 단축 URL ({history.length})
        </h3>
        <button
          onClick={onClear}
          className="text-sm text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
        >
          전체 삭제
        </button>
      </div>

      <div className="space-y-3">
        {history.map((item) => (
          <div
            key={item.shortUrl}
            className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg animate-fade-in"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                  /{item.shortUrl}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                  {item.longUrl}
                </p>
                {item.expiredAt && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    만료: {new Date(item.expiredAt).toLocaleString('ko-KR')}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => copyUrl(item.shortUrl)}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  title="복사"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={() => handlePreview(item.shortUrl)}
                  className={`p-1.5 transition-colors ${preview?.shortUrl === item.shortUrl ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                  title="미리보기"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(item.shortUrl)}
                  disabled={deleting === item.shortUrl}
                  className={`p-1.5 transition-colors ${confirmDelete === item.shortUrl ? 'text-red-600 dark:text-red-400' : 'text-gray-400 hover:text-red-600 dark:hover:text-red-400'}`}
                  title={confirmDelete === item.shortUrl ? '한번 더 클릭하여 삭제' : '삭제'}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            {preview?.shortUrl === item.shortUrl && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">원본 URL:</p>
                <p className="text-sm text-gray-900 dark:text-white break-all">{preview.longUrl}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
