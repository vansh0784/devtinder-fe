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

/** POST /collaboration/rooms */
export interface ICollabRoomResponse {
  roomId: string;
  yjsWsUrl: string;
  yjsDocName: string;
  codeEditorSocketPath: string;
}

export type PostAuthorPreview = {
  _id?: string;
  username?: string;
  avatar?: string;
};

export interface IComment {
  _id?: string;
  user: string | PostAuthorPreview;
  text: string;
  createdAt?: string;
}

export interface IPost {
  _id: string;
  author: string | PostAuthorPreview;
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
  data?: unknown;
}

export interface IUser {
  _id: string;
  username: string;
  age?: number;
  email: string;
  phone?: string;
  skills?: string[];
  /** Topics / domains the user cares about */
  interests?: string[];
  /** Onboarding step 3 — project kinds */
  projectTypes?: string[];
  bio?: string;
  experienceLevel?: string;

  github?: string;
  linkedin?: string;
  portfolio?: string;

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
