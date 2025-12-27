import SelfAssessmentService from "../services/selfAssessmentService.js";
import RecommendationService from "../services/recommendationService.js";

export const listPublishedAssessments = async (req, res) => {
  try {
    const data = await SelfAssessmentService.listPublished();
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getAssessmentBySlug = async (req, res) => {
  try {
    const data = await SelfAssessmentService.getBySlug(req.params.slug);
    if (!data) return res.status(404).json({ message: "Assessment tidak ditemukan" });
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const submitAssessment = async (req, res) => {
  try {
    const { slug } = req.params;
    const answers = req.body?.answers; 
    // format: [{ question_id, option_id }] atau [{ question_id, value }]

    const assessment = await SelfAssessmentService.getBySlug(slug);
    if (!assessment || !assessment.is_published) {
      return res.status(404).json({ message: "Assessment tidak tersedia" });
    }

    const computed = await SelfAssessmentService.computeResult({
      assessment_id: assessment.id,
      answers,
    });

    // rekomendasi konselor berdasarkan tags hasil
    const recommendTags = computed.recommend_tags || [];
    const recommended = await RecommendationService.recommendKonselorByTags(recommendTags, {
      limit: 5,
    });

    const payload = {
      assessment: { id: assessment.id, slug: assessment.slug, title: assessment.title },
      scores: computed.scores,
      result: computed.result,
      recommend_tags: recommendTags,
      recommended_konselor: recommended,
      persisted: false,
    };

    // jika login dan mahasiswa -> simpan attempt
    const isLoggedIn = !!req.user?.id; // requireAuth tidak dipasang di route ini, jadi bisa undefined
    const isMahasiswa = req.profile?.type === "mahasiswa";

    if (isLoggedIn && isMahasiswa) {
      const saved = await SelfAssessmentService.saveAttempt({
        assessment_id: assessment.id,
        user_id: req.user.id,
        answers,
        scores: computed.scores,
        result: computed.result,
        recommend_tags: recommendTags,
        recommended_konselor: recommended,
      });
      payload.persisted = true;
      payload.attempt_id = saved.id;
    }

    res.json(payload);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const getMyAssessmentHistory = async (req, res) => {
  try {
    const data = await SelfAssessmentService.listAttemptsByUser(req.user.id);
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// ===== Content Manager =====

export const createAssessment = async (req, res) => {
  try {
    const data = await SelfAssessmentService.create({
      slug: req.body.slug,
      title: req.body.title,
      description: req.body.description,
      tags: req.body.tags || [],
      is_published: !!req.body.is_published,
      created_by: req.user.id,
    });
    res.status(201).json(data);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const updateAssessment = async (req, res) => {
  try {
    const data = await SelfAssessmentService.update(req.params.id, req.body);
    res.json(data);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const deleteAssessment = async (req, res) => {
  try {
    await SelfAssessmentService.remove(req.params.id);
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const upsertAssessmentQuestions = async (req, res) => {
  try {
    // body: { questions: [{... , options:[...]}] }
    const out = await SelfAssessmentService.upsertQuestions(req.params.id, req.body.questions || []);
    res.json(out);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const upsertAssessmentRules = async (req, res) => {
  try {
    const out = await SelfAssessmentService.upsertRules(req.params.id, req.body.rules || []);
    res.json(out);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const getAdminList = async (req, res) => {
  try {
    const data = await SelfAssessmentService.getAdminList();
    res.json(data);
  } catch (err) {
    console.error("[GET /self-assessments/admin/list] ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getAdminDetailById = async (req, res) => {
  try {
    const data = await SelfAssessmentService.getDetailByIdAdmin(req.params.id);
    if (!data) return res.status(404).json({ message: "Assessment tidak ditemukan" });
    res.json(data);
  } catch (err) {
    console.error("[GET /self-assessments/admin/:id] ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};