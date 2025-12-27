import { supabase } from "../config/supabaseClient.js"; 

export default class SelfAssessmentService {
  static async getAdminList() {
    const { data, error } = await supabase
      .from("self_assessment")
      .select("id, slug, title, description, tags, is_published, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getDetailByIdAdmin(id) {
    // meta (admin boleh draft)
    const { data: meta, error: e1 } = await supabase
      .from("self_assessment")
      .select("id, slug, title, description, tags, is_published, created_at, updated_at")
      .eq("id", id)
      .maybeSingle();

    if (e1) throw e1;
    if (!meta) return null;

    return await this._hydrateDetail(meta);
  }

  static async _hydrateDetail(meta) {
  // ambil questions
  const { data: qs, error: qErr } = await supabase
    .from("self_assessment_question")
    .select("id, order_no, question, dimension, reverse_scored")
    .eq("assessment_id", meta.id)
    .order("order_no", { ascending: true });

  if (qErr) throw qErr;

  // ambil options
  const questionIds = (qs || []).map((q) => q.id);
  let options = [];
  if (questionIds.length) {
    const { data: ops, error: oErr } = await supabase
      .from("self_assessment_option")
      .select("id, question_id, order_no, label, value")
      .in("question_id", questionIds)
      .order("order_no", { ascending: true });

    if (oErr) throw oErr;
    options = ops || [];
  }

  // ambil rules
  const { data: rules, error: rErr } = await supabase
    .from("self_assessment_result_rule")
    .select("dimension, min_score, max_score, level, summary, recommend_tags")
    .eq("assessment_id", meta.id);

  if (rErr) throw rErr;

  // attach options ke question
  const optionsByQ = new Map();
  for (const o of options) {
    const arr = optionsByQ.get(o.question_id) || [];
    arr.push(o);
    optionsByQ.set(o.question_id, arr);
  }

  const questions = (qs || []).map((q) => ({
    ...q,
    options: optionsByQ.get(q.id) || [],
  }));

  return {
    ...meta,
    questions,
    rules: rules || [],
  };
}

  
  static async listPublished() {
    const { data, error } = await supabase
      .from("self_assessment")
      .select("id, slug, title, description, tags, is_published, created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getBySlug(slug) {
    const { data, error } = await supabase
      .from("self_assessment")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    // ambil questions + options
    const { data: qs, error: qErr } = await supabase
      .from("self_assessment_question")
      .select("id, order_no, question, dimension, reverse_scored")
      .eq("assessment_id", data.id)
      .order("order_no", { ascending: true });

    if (qErr) throw qErr;

    const questionIds = (qs || []).map((q) => q.id);
    let options = [];
    if (questionIds.length) {
      const { data: ops, error: oErr } = await supabase
        .from("self_assessment_option")
        .select("id, question_id, order_no, label, value")
        .in("question_id", questionIds)
        .order("order_no", { ascending: true });

      if (oErr) throw oErr;
      options = ops || [];
    }

    // ambil rules
    const { data: rules, error: rErr } = await supabase
      .from("self_assessment_result_rule")
      .select("dimension, min_score, max_score, level, summary, recommend_tags")
      .eq("assessment_id", data.id);

    if (rErr) throw rErr;

    // attach
    const optionsByQ = new Map();
    for (const o of options) {
      const arr = optionsByQ.get(o.question_id) || [];
      arr.push(o);
      optionsByQ.set(o.question_id, arr);
    }

    const questions = (qs || []).map((q) => ({
      ...q,
      options: optionsByQ.get(q.id) || [],
    }));

    return { ...data, questions, rules: rules || [] };
  }

  static async computeResult({ assessment_id, answers }) {
    if (!Array.isArray(answers) || answers.length === 0) {
      throw new Error("Jawaban tidak valid");
    }

    // fetch question meta
    const { data: qs, error: qErr } = await supabase
      .from("self_assessment_question")
      .select("id, dimension, reverse_scored")
      .eq("assessment_id", assessment_id);

    if (qErr) throw qErr;

    const qMap = new Map((qs || []).map((q) => [q.id, q]));
    const qIds = answers.map((a) => a.question_id);

    // fetch options values if user sends option_id
    const optionIds = answers.map((a) => a.option_id).filter(Boolean);
    let optMap = new Map();
    if (optionIds.length) {
      const { data: ops, error: oErr } = await supabase
        .from("self_assessment_option")
        .select("id, question_id, value")
        .in("id", optionIds);

      if (oErr) throw oErr;
      optMap = new Map((ops || []).map((o) => [o.id, o]));
    }

    // compute scores per dimension
    const scores = {};
    for (const a of answers) {
      const q = qMap.get(a.question_id);
      if (!q) continue;

      let v = typeof a.value === "number" ? a.value : null;
      if (v === null && a.option_id) {
        const o = optMap.get(a.option_id);
        if (o) v = o.value;
      }
      if (v === null) continue;

      // reverse scoring (assume scale 0..4 by default; you can store max in assessment later)
      if (q.reverse_scored) v = 4 - v;

      scores[q.dimension] = (scores[q.dimension] || 0) + v;
    }

    // interpret using rules
    const { data: rules, error: rErr } = await supabase
      .from("self_assessment_result_rule")
      .select("dimension, min_score, max_score, level, summary, recommend_tags")
      .eq("assessment_id", assessment_id);

    if (rErr) throw rErr;

    const result = {};
    const tagSet = new Set();

    for (const [dim, sc] of Object.entries(scores)) {
      const rule = (rules || []).find((r) => r.dimension === dim && sc >= r.min_score && sc <= r.max_score);
      if (rule) {
        result[dim] = { level: rule.level, summary: rule.summary, score: sc };
        (rule.recommend_tags || []).forEach((t) => tagSet.add(String(t).trim()));
      } else {
        result[dim] = { level: "unknown", summary: "Belum ada rule interpretasi.", score: sc };
      }
    }

    return {
      scores,
      result,
      recommend_tags: Array.from(tagSet).filter(Boolean),
    };
  }

  static async saveAttempt(payload) {
    const { data, error } = await supabase
      .from("self_assessment_attempt")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async listAttemptsByUser(user_id) {
    const { data, error } = await supabase
      .from("self_assessment_attempt")
      .select("id, assessment_id, created_at, scores, result, recommend_tags, recommended_konselor")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // ===== content manager ops (basic) =====
  static async create(payload) {
    const { data, error } = await supabase.from("self_assessment").insert(payload).select().single();
    if (error) throw error;
    return data;
  }

  static async update(id, payload) {
    const { data, error } = await supabase.from("self_assessment").update(payload).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }

  static async remove(id) {
    const { error } = await supabase.from("self_assessment").delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  static async upsertQuestions(assessment_id, questions) {
    // strategy simple: delete existing -> reinsert (mudah & aman)
    // (kalau mau benar-benar upsert per id, bisa dibuat, tapi panjang)
    const { error: delQErr } = await supabase
      .from("self_assessment_question")
      .delete()
      .eq("assessment_id", assessment_id);
    if (delQErr) throw delQErr;

    // insert questions
    const qRows = questions.map((q, i) => ({
      assessment_id,
      order_no: q.order_no ?? (i + 1),
      question: q.question,
      dimension: q.dimension,
      reverse_scored: !!q.reverse_scored,
    }));

    const { data: insertedQ, error: insQErr } = await supabase
      .from("self_assessment_question")
      .insert(qRows)
      .select("id, order_no");

    if (insQErr) throw insQErr;

    // options insert
    const optionRows = [];
    for (let i = 0; i < insertedQ.length; i++) {
      const qInserted = insertedQ[i];
      const qInput = questions[i];
      const opts = Array.isArray(qInput.options) ? qInput.options : [];
      opts.forEach((o, idx) => {
        optionRows.push({
          question_id: qInserted.id,
          order_no: o.order_no ?? (idx + 1),
          label: o.label,
          value: Number(o.value),
        });
      });
    }

    if (optionRows.length) {
      const { error: insOErr } = await supabase.from("self_assessment_option").insert(optionRows);
      if (insOErr) throw insOErr;
    }

    return { message: "Questions updated", questions: insertedQ.length, options: optionRows.length };
  }

  static async upsertRules(assessment_id, rules) {
    const { error: delErr } = await supabase
      .from("self_assessment_result_rule")
      .delete()
      .eq("assessment_id", assessment_id);
    if (delErr) throw delErr;

    const rows = (rules || []).map((r) => ({
      assessment_id,
      dimension: r.dimension,
      min_score: Number(r.min_score),
      max_score: Number(r.max_score),
      level: r.level,
      summary: r.summary,
      recommend_tags: r.recommend_tags || [],
    }));

    const { data, error } = await supabase
      .from("self_assessment_result_rule")
      .insert(rows)
      .select();

    if (error) throw error;
    return data || [];
  }
}
