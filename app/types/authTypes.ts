export type UserAuth = {
  id: number;
  username: string;
  email: string;
  name: string;
  lastname: string;
  birthdate: string;
  createdAt: string;
  ssoUid: string;
  providerId: string;
  profilePicture: string;
  token: string;
  expoToken: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  phoneNumber: string;
};

export type UserSSORegisterDto = {
  token: string;
  uid: string;
  providerId: string;
  username: string;
  birthdate: string;
  profilePicture?: string;
  phoneNumber: string;
};
