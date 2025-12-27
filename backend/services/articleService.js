import { supabase } from "../config/supabaseClient.js";

export default class ArticleService {
  static async getAll({ page = 1, limit = 5 }) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("artikel")
      .select(
        `
        id,
        judul,
        isi,
        kategori,
        tanggal_terbit,
        link_cover,
        konselor (
          id,
          nama_konselor
        )
      `,
        { count: "exact" }
      )
      .order("tanggal_terbit", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data,
      total: count,
    };
  }

  static async getById(id) {
    const { data, error } = await supabase
      .from("artikel")
      .select(`
        id,
        judul,
        isi,
        kategori,
        tanggal_terbit,
        link_cover,
        konselor (
          id,
          nama_konselor
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }


  static async create({ judul, isi, kategori, id_konselor }) {
    const { data, error } = await supabase
      .from("artikel")
      .insert({
        judul,
        isi,
        kategori,
        id_konselor,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id, payload) {
    const { data, error } = await supabase
      .from("artikel")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id) {
    const { error } = await supabase
      .from("artikel")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  }
}
