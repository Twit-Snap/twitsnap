export interface TwitUser {
    userId: number;
    name: string;
    username: string;
    //profileImageUrl: string;
    //verified: boolean;
}

export interface TwitSnap {
    id: string;
    createdAt: string;
    user: TwitUser;
    content: string;
    //entities: Entities;
    //inReplyToTweetId: string | null;
    //inReplyToUserId: string | null;
    //lang: string;
    //favoriteCount: number;
    //retweetCount: number;
}