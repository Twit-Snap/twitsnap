import { TwitSnap } from '@/app/types/TwitSnap';

export interface SearchedUser {
  id: number;
  username: string;
  name: string;
  lastname: string;
  email: string;
  providerId: string;
  ssoUid: string;
  description: string;
  birthdate: string;
  createdAt: string;
  profilePicture: string;
  backgroundImage: string;
  twits: TwitSnap[];
  following: boolean;
  followingCount: number;
  followersCount: number;
  followed: boolean;
}

export interface ErrorUser {
  name: string;
  username: string;
  description: string;
}

export interface IReducedUser {
  id: number;
  name: string;
  username: string;
  description: string;
  profilePicture: string;
  expoToken?: string;
  followCreatedAt?: string;
}
