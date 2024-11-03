export interface TwitUser {
  userId: number;
  name: string;
  username: string;
  profilePicture?: string;
  // verified: boolean;
}

export interface TwitSnap {
  id: string;
  createdAt: string;
  user: TwitUser;
  content: string;
  likesCount: number;
  userLiked: boolean;
  retwitCount: number;
  userRetwitted: boolean;
  //entities: Entities;
  //inReplyToTweetId: string | null;
  //inReplyToUserId: string | null;
  //lang: string;
  //retweetCount: number;
}
