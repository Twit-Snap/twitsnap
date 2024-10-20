import { TwitSnap } from '@/app/types/TwitSnap';

export interface SearchedUser {
  id: number;
  username: string;
  name: string;
  lastname: string;
  birthdate: string;
  createdAt: string;
  email: string;
  profilePicture: string;
  providerId: string;
  ssoUid: string;
  followed: boolean;
  followersCount: number;
  following: boolean;
  followingCount: number;
  twits: TwitSnap[];
}
