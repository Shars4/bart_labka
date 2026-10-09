'use client';

import { useEffect } from 'react';

const KEY = 'labka:animal-list-query';

/** Stores the list's query string, so "Späť na zoznam" restores the filters. */
export function RememberListUrl({ query }: { query: string }) {
  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, query);
    } catch {
      // Storage can be unavailable (private mode); the link then uses /zvierata.
    }
  }, [query]);
  return null;
}

export function readRememberedListQuery(): string {
  try {
    return sessionStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
}
