export interface TwitUser {
  userId: number;
  name: string;
  username: string;
  //profilePictureUrl: string;
  //verified: boolean;
}

export interface TwitSnap {
  id: string;
  createdAt: string;
  user: TwitUser;
  content: string;
  likesCount: number;
  userLiked: boolean;
  profilePicture: string;
  //entities: Entities;
  //inReplyToTweetId: string | null;
  //inReplyToUserId: string | null;
  //lang: string;
  //retweetCount: number;
}
