import { atom } from 'jotai';

import { TwitSnap } from '@/app/types/TwitSnap';

export const twitsAtom = atom<TwitSnap[] | null>(null);
