import { supabase } from "../config/supabaseClient.js";

export default class RecommendationService {
  static async recommendKonselorByTags(tags, { limit = 5 } = {}) {
    const cleanTags = (tags || []).map((t) => String(t).toLowerCase().trim()).filter(Boolean);
    if (!cleanTags.length) return [];

    const { data, error } = await supabase
      .from("konselor")
      .select("id, nama_konselor, spesialisasi, foto_profil, deskripsi")
      .order("nama_konselor", { ascending: true });

    if (error) throw error;

    const scored = (data || []).map((k) => {
      const specs = Array.isArray(k.spesialisasi) ? k.spesialisasi : [];
      const specSet = new Set(specs.map((s) => String(s).toLowerCase().trim()));
      let score = 0;
      for (const t of cleanTags) if (specSet.has(t)) score++;
      return { ...k, match_score: score };
    });

    return scored
      .filter((x) => x.match_score > 0)
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, limit);
  }
}
