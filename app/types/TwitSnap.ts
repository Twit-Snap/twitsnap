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
  userBookmarked: boolean;
  bookmarkCount: number;
  commentCount: number;
  type: string;
  parent: TwitSnap;
  //entities: Entities;
  //inReplyToTweetId: string | null;
  //inReplyToUserId: string | null;
  //lang: string;
  //retweetCount: number;
}
