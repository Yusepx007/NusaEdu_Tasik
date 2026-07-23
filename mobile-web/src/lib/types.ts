// TypeScript interfaces matching the Laravel API responses

export interface Destination {
  id: number;
  name: string;
  description: string;
  category: string;
  location: string;
  image_url: string;
  rating?: number;
  jam_buka?: string;
  tiket?: string;
  wisata_key?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  points?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

export interface CommunityPost {
  id: number;
  user_id: number;
  user_name: string;
  destination_name: string;
  caption: string;
  image_url: string;
  like_count: number;
  comment_count: number;
  is_liked_by_me: boolean;
  created_at: string;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  user_name: string;
  content: string;
  created_at: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answer: number;
  destination?: string;
}

export interface VisitHistory {
  id: number;
  user_id: number;
  destination_name: string;
  wisata_key?: string;
  date: string;
  points: number;
  image_type: string;
  confidence?: number;
  lokasi?: string;
  kategori?: string;
  created_at: string;
}

export interface ScanResult {
  success: boolean;
  recognized?: boolean;   // true = wisata dikenali, false = tidak dikenali
  name: string;
  description: string;
  confidence: number;
  image_url?: string;
  lokasi?: string;
  jam_buka?: string;
  tiket?: string;
  kategori?: string;
  wisata_key?: string;
  has_quiz?: boolean;
  error?: string;
  message?: string;
}
