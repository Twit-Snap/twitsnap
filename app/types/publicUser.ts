import { TwitSnap } from '@/app/types/TwitSnap';

export interface SearchedUser {
  username: string;
  name: string;
  birthdate: string;
  createdAt: string;
  twits: TwitSnap[];
}
