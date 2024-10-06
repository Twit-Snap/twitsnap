import { atom } from 'jotai';

export const feedRefreshIntervalAtom = atom<NodeJS.Timeout | null>(null);
