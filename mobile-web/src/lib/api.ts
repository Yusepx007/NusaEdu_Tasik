const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nusaedu.kotapintar.my.id/api';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Add Content-Type for JSON bodies (not for FormData)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err: unknown) {
    // Network-level errors: server down, wrong IP, CORS preflight fail, no internet
    const msg = err instanceof Error ? err.message.toLowerCase() : '';
    if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('load failed')) {
      throw new Error(
        'Tidak dapat terhubung ke server.\n' +
        'Pastikan Backend Laravel sudah aktif dan periksa koneksi internet.'
      );
    }
    throw new Error('Terjadi kesalahan jaringan. Coba lagi.');
  }

  if (!res.ok) {
    // Parse server error message
    let serverMsg = '';
    try {
      const body = await res.json();
      serverMsg = body.message || body.error || '';
    } catch { /* ignore parse error */ }

    if (res.status === 401) throw new Error(serverMsg || 'Email atau password salah.');
    if (res.status === 422) throw new Error(serverMsg || 'Data yang dimasukkan tidak valid.');
    if (res.status === 404) throw new Error(serverMsg || 'Data tidak ditemukan.');
    if (res.status === 500) throw new Error('Server mengalami kesalahan internal. Coba lagi nanti.');
    if (res.status === 502 || res.status === 503) throw new Error('Server sedang tidak tersedia. Coba beberapa saat lagi.');
    throw new Error(serverMsg || `Permintaan gagal (HTTP ${res.status}).`);
  }

  return res.json() as Promise<T>;
}

// ── Auth ─────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    request<{ user: { id: number; name: string; email: string; points?: number }; token: string }>(
      '/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    ),

  register: (name: string, email: string, password: string) =>
    request<{ user: { id: number; name: string; email: string }; token: string }>(
      '/register',
      { method: 'POST', body: JSON.stringify({ name, email, password }) }
    ),

  logout: () =>
    request<{ message: string }>('/logout', { method: 'POST' }),
};

// ── Destinations ─────────────────────────────────────────────────────────
const AI_URL = process.env.NEXT_PUBLIC_AI_URL || 'https://kotapintar.my.id/ai';

export const destinationApi = {
  getAll: () =>
    request<{ status: string; data: import('./types').Destination[] }>('/destinations'),

  /**
   * Scan gambar langsung ke Python AI Flask (https://kotapintar.my.id/ai/scan)
   * — sama persis dengan cara Flutter memanggil AI.
   * Setelah sukses, simpan hasil ke Laravel DB via /api/scan/save (fire & forget).
   */
  scan: async (formData: FormData): Promise<import('./types').ScanResult> => {
    const url = `${AI_URL}/scan`;
    let res: Response;
    try {
      res = await fetch(url, { method: 'POST', body: formData });
    } catch {
      throw new Error(
        'Tidak dapat terhubung ke server AI.\n' +
        'Pastikan koneksi internet aktif.'
      );
    }
    if (!res.ok) {
      throw new Error(`AI Server error (HTTP ${res.status}). Coba lagi nanti.`);
    }
    const data = await res.json() as import('./types').ScanResult;
    if (!data.success) {
      throw new Error(data.error || 'AI tidak dapat mengenali gambar ini.');
    }
    return data;
  },

  saveScan: (data: {
    user_id?: number;
    wisata_key?: string;
    destination_name: string;
    confidence?: number;
    lokasi?: string;
    kategori?: string;
  }) =>
    request<{ success: boolean; points_earned: number; total_points: number }>(
      '/scan/save',
      { method: 'POST', body: JSON.stringify(data) }
    ),
};


// ── Community ─────────────────────────────────────────────────────────────
export const communityApi = {
  getPosts: async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await request<any>('/posts');
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      return [];
    } catch {
      return [];
    }
  },

  createPost: (formData: FormData) =>
    request<{ success: boolean; post: import('./types').CommunityPost }>(
      '/posts',
      { method: 'POST', body: formData }
    ),

  getComments: (postId: number) =>
    request<import('./types').Comment[]>(`/posts/${postId}/comments`),

  addComment: (postId: number, content: string, userId?: number) =>
    request<{ success: boolean; comment: import('./types').Comment }>(
      `/posts/${postId}/comments`,
      { method: 'POST', body: JSON.stringify({ content, user_id: userId }) }
    ),

  toggleLike: (postId: number) =>
    request<{ liked: boolean; like_count: number }>(
      `/posts/${postId}/likes`,
      { method: 'POST' }
    ),
};

// ── Quiz ──────────────────────────────────────────────────────────────────
export const quizApi = {
  getQuizzes: () =>
    request<import('./types').QuizQuestion[]>('/quizzes'),

  submitScore: (userId: number, score: number) =>
    request<{ success: boolean; total_points: number }>(
      '/quizzes/submit',
      { method: 'POST', body: JSON.stringify({ user_id: userId, score }) }
    ),
};

// ── Visit History ─────────────────────────────────────────────────────────
export const historyApi = {
  getHistory: (userId?: number) =>
    request<import('./types').VisitHistory[]>(
      userId ? `/history?user_id=${userId}` : '/history'
    ),
};
