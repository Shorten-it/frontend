import { useState } from 'react';
import { apiClient } from '../api/client';
import type { ApiError } from '../api/types';
import type { UrlHistoryItem } from '../hooks/useUrlHistory';

interface Props {
  onShorten: (item: UrlHistoryItem) => void;
}

export function UrlShortener({ onShorten }: Props) {
  const [longUrl, setLongUrl] = useState('');
  const [expiredAt, setExpiredAt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const expiredIso = expiredAt ? new Date(expiredAt).toISOString() : undefined;
      const res = await apiClient.shortenUrl(longUrl.trim(), expiredIso);
      setResult(res.short_url);
      onShorten({
        shortUrl: res.short_url,
        longUrl: longUrl.trim(),
        expiredAt: expiredIso,
        createdAt: new Date().toISOString(),
      });
      setLongUrl('');
      setExpiredAt('');
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'URL 단축에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!result) return;
    const fullUrl = `${window.location.origin}/${result}`;
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          URL을 짧게 만들어보세요
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          긴 URL을 간단하고 공유하기 쉬운 링크로 변환합니다
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="https://example.com/very-long-url..."
            required
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 min-w-[120px]"
          >
            {loading ? (
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              '단축하기'
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
            만료일 (선택)
          </label>
          <input
            type="datetime-local"
            value={expiredAt}
            onChange={(e) => setExpiredAt(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-fade-in">
          <p className="text-sm text-green-600 dark:text-green-400 mb-2">단축 URL이 생성되었습니다!</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 rounded border border-green-300 dark:border-green-700 text-gray-900 dark:text-white text-sm break-all">
              {window.location.origin}/{result}
            </code>
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors whitespace-nowrap"
            >
              {copied ? '복사됨!' : '복사'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
