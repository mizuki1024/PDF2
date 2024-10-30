export interface PDFDocument {
  id: string;
  name: string;
  url: string;
  summary: string;
  notes: Note[];
  userId: string;
  isLocal: boolean;
}

export interface Note {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}