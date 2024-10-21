import { TwitSnap } from '@/app/types/TwitSnap';

export interface SearchedUser {
  id: number;
  username: string;
  name: string;
  description: string;
  birthdate: string;
  createdAt: string;
  profileImage: string;
  backgroundImage: string;
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
