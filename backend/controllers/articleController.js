import ArticleService from "../services/articleService.js";

export const getAllArticles = async (req, res) => {
  try {
    // console.log("PID", process.pid, "PORT", process.env.PORT);
    // console.log("SUPABASE_URL", process.env.SUPABASE_URL);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const { data, total } = await ArticleService.getAll({
      page,
      limit,
    });

    
    res.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await ArticleService.getById(id);

    if (!article) {
      return res.status(404).json({ message: "Artikel tidak ditemukan" });
    }

    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


export const createArticle = async (req, res) => {
  try {
    console.log("testsetsteststsetsetsetst")
    const article = await ArticleService.create({
      judul: req.body.title,
      isi: req.body.content,
      kategori: req.body.category,
      id_konselor: req.user.id,
    });
    res.status(201).json(article);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateArticle = async (req, res) => {
  try {
    const article = await ArticleService.update(req.params.id, {
      judul: req.body.title,
      isi: req.body.content,
      kategori: req.body.category,    
    });
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteArticle = async (req, res) => {
  try {
    await ArticleService.delete(req.params.id);
    res.json({ message: "Artikel berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
