import ArticleService from "../services/articleService.js";

export const requireArticleOwner = async (req, res, next) => {
  const articleId = req.params.id;
  const userId = req.profile.id;

  const article = await ArticleService.getById(articleId);

  if (!article) {
    return res.status(404).json({ message: "Artikel tidak ditemukan" });
  }
  
  if (article.konselor.id !== userId) {
    return res.status(403).json({
      message: "Anda tidak memiliki akses ke artikel ini",
    });
  }

  req.article = article;
  next();
};
