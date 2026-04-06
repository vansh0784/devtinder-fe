export interface IUser {
  _id: string;
  username: string;
  email: string;
}

export interface ILoginResponse {
  statusCode: number;
  message: string;
  access_token?: string;
}

export interface ICreateRequest {
  username: string;
  email: string;
  password: string;
}

export interface IAuth0 {
  email: string | undefined;
  username: string | undefined;
  avatar: string | undefined;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IMessage {
  _id?: string;
  roomId: string;
  senderId: string;
  receiverId: string;
  content: string;
  read?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isTyping: boolean;
  cursorPosition: number;
}

export interface IComment {
  _id: string;
  user: string;
  text: string;
  createdAt: string;
}

export interface IPost {
  _id: string;
  author: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorVerified: boolean;
  text: string;
  images: string[];
  code: string;
  projectLink: string;
  tags: string[];
  likes: string[];
  comments: IComment[];
  shares: number;
  isPinned: boolean;
  visibility: "public" | "private";
  createdAt: string;
  updatedAt: string;
}

export interface IComment {
  _id: string;
  user: string;
  text: string;
  createdAt: string;
}

export interface IPost {
  _id: string;
  author: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorVerified: boolean;
  text: string;
  images: string[];
  code: string;
  projectLink: string;
  tags: string[];
  likes: string[];
  comments: IComment[];
  shares: number;
  isPinned: boolean;
  visibility: "public" | "private";
  createdAt: string;
  updatedAt: string;
}

export interface IBaseResponse {
  statusCode: number;
  message: string;
  access_token?: string;
  data?: any;
}

export interface IUser {
  _id: string;
  username: string;
  age?: number;
  email: string;
  phone?: string;
  skills?: string[];
  bio?: string;
  experienceLevel?: string;

  github?: string;
  linkedin?: string;
  portfolio?: string;
  interests?: [];

  avatar?: string;
  location?: string;
  followers?: string;
  following?: string;
  isActive?: boolean;
  isOnline?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

export interface IUpdateUser {
  firstname?: string;
  lastname?: string;
  username?: string;
  email?: string;
  bio?: string;
  image?: File;
}

export interface Friend {
  id: string;
  name: string;
  username: string;
  avatar: string;
  status: "online" | "offline";
  matchScore: number;
}
