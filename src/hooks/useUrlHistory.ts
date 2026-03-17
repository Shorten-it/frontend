import { useState, useEffect } from 'react';

export interface UrlHistoryItem {
  shortUrl: string;
  longUrl: string;
  expiredAt?: string;
  createdAt: string;
}

const STORAGE_KEY = 'shortly-url-history';

function loadHistory(): UrlHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useUrlHistory() {
  const [history, setHistory] = useState<UrlHistoryItem[]>(loadHistory);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const addItem = (item: UrlHistoryItem) => {
    setHistory((prev) => [item, ...prev]);
  };

  const removeItem = (shortUrl: string) => {
    setHistory((prev) => prev.filter((item) => item.shortUrl !== shortUrl));
  };

  const clearHistory = () => setHistory([]);

  return { history, addItem, removeItem, clearHistory };
}
