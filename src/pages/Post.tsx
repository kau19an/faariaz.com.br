import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import { Calendar, Clock, AlertCircle, Home, ChevronRight } from "lucide-react";
import PageHead from "../components/seo/PageHead";
import { motion, useScroll, useSpring } from "framer-motion";
import { formatDate, getReadingTime, getLocalizedPath } from "../lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "../components/ui/CodeBlock";

export default function Post() {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const contentRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: contentRef,
    offset: ["start start", "end end"],
  });
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    async function fetchPost() {
      if (!slug) return;
      const { data, error } = await supabase
        .from("posts")
        .select(`*, categories (slug, icon)`)
        .eq("slug", slug)
        .single();

      if (error) console.error("Erro:", error);
      else setPost(data);
      setLoading(false);
    }
    fetchPost();
  }, [slug]);

  if (loading)
    return (
      <div className="text-center mt-32 animate-pulse text-gray-400">
        {t("ui.loading_post")}
      </div>
    );

  if (!post)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <AlertCircle size={64} className="text-gray-300 mb-4" />
        <h2 className="text-3xl font-bold mb-2 text-gray-900">
          {t("ui.post_not_found")}
        </h2>
        <Link
          to={getLocalizedPath("blog", currentLang)}
          className="px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition"
        >
          {t("button.return")}
        </Link>
      </div>
    );

  const readingMinutes = getReadingTime(post.content);
  const minLabel = readingMinutes === 1 ? "min" : "mins";
  const readLabel = t("common.read_suffix", { defaultValue: "de leitura" });
  const blogRootLink = getLocalizedPath("blog", currentLang);

  const categoryLink = post.categories
    ? getLocalizedPath(`blog/topic/${post.categories.slug}`, currentLang)
    : "#";

  return (
    <>
      <PageHead
        titleKey={post.title}
        descriptionKey={post.content.substring(0, 100)}
      />

      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-blue-600 dark:bg-yellow-400 origin-left z-60"
        style={{ scaleX }}
      />

      <article className="pt-0 md:pt-4 pb-12 px-0 md:px-6 mx-auto w-full max-w-5xl">
        <nav className="flex items-center flex-wrap gap-2 text-sm text-gray-900/50 dark:text-zinc-300/50 mb-4 max-w-3xl mx-auto">
          <Link
            to={blogRootLink}
            className="p-1.5 hover:bg-gray-300/25 dark:hover:bg-zinc-700/30 hover:text-blue-600 dark:hover:text-yellow-400 rounded-lg transition-colors text-gray-900/50 dark:text-zinc-300/50"
          >
            <Home size={16} />
          </Link>

          <ChevronRight size={14} className="opacity-50 hover:opacity-75" />

          {post.categories ? (
            <Link
              to={categoryLink}
              className="font-medium hover:text-blue-600 dark:hover:text-yellow-400 transition-colors hover:underline underline-offset-4"
            >
              {t(`categories.${post.categories.slug}`)}
            </Link>
          ) : (
            <span />
          )}

          <ChevronRight size={14} className="opacity-50 hover:opacity-75" />

          <span className="text-gray-600 hover:text-gray-800/65 dark:text-zinc-300 dark:hover:text-zinc-400/95 transition-colors font-semibold truncate max-w-37.5 md:max-w-xs block">
            {post.title}
          </span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          {post.cover_image && (
            <div className="w-full max-w-5xl mb-3">
              <div className="w-full aspect-video md:aspect-21/9 rounded-3xl overflow-hidden shadow-lg md:shadow-6xl shadow-gray-800/25 md:shadow-gray-800/60 dark:shadow-gray-200/15 md:dark:shadow-gray-200/5 relative group">
                <img
                  src={post.cover_image}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {post.cover_image && post.image_caption && (
            <div className="w-full max-w-2xl text-center mb-4">
              <p className="text-xs md:text-sm text-gray-400 dark:text-zinc-500 transition-colors italic">
                {post.image_caption}
              </p>
            </div>
          )}

          <div className="w-full max-w-2xl px-4 md:px-0">
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-3 leading-tight md:leading-tight text-left">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-zinc-200/70 mb-8 pb-8 border-b border-gray-300 dark:border-zinc-700 transition-colors">
              <span className="flex items-center gap-2">
                <Calendar size={16} className="text-blue-500" />
                {formatDate(post.created_at, currentLang)}
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-600 transition-colors"></span>
              <span className="flex items-center gap-2">
                <Clock size={16} className="text-purple-500" />
                {readingMinutes} {minLabel} {readLabel}
              </span>
            </div>

            <div
              ref={contentRef}
              className="prose prose-lg max-w-none text-zinc-800 dark:text-gray-200 transition-colors leading-relaxed 
  prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-2xl prose-img:shadow-lg
  prose-code:before:content-none prose-code:after:content-none
  prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code: CodeBlock,
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </div>
        </motion.div>
      </article>
    </>
  );
}
