import { TwitSnap } from '@/app/types/TwitSnap';

export interface SearchedUser {
  username: string;
  name: string;
  birthdate: string;
  createdAt: string;
  twits: TwitSnap[];
  following: boolean;
  followingCount: number;
  followersCount: number;
  followed: boolean;
}

export interface IReducedUser {
  id: number;
  name: string;
  username: string;
  description: string;
  profileImage: string;
}
