import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import PageHead from "../components/seo/PageHead";
import IconMapper from "../components/ui/IconMapper";
import {
  formatDate,
  getReadingTime,
  getLocalizedPath,
  removeMarkdown,
} from "../lib/utils";

interface Post {
  id: number;
  slug: string;
  created_at: string;
  title: string;
  content: string;
  cover_image?: string;
  categories: {
    slug: string;
    icon: string;
  } | null;
}

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select(`*, categories (slug, icon)`)
      .order("created_at", { ascending: false });

    if (error) console.error("Error:", error);
    else setPosts(data || []);

    setLoading(false);
  }

  const containerVars = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <PageHead titleKey="title.blog" />

      <div className="px-2 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h1 className="text-4xl font-extrabold bg-clip-text text-neutral-800 dark:text-gray-100 transition-colors">
            {t("title.blog")}
          </h1>
        </motion.div>

        {loading ? (
          <p className="text-neutral-800 dark:text-gray-100">
            {t("ui.loading")}
          </p>
        ) : (
          <motion.div
            variants={containerVars}
            initial="hidden"
            animate="visible"
            className="grid gap-6 sm:grid-cols-2"
          >
            {posts.length === 0 ? (
              <p className="text-neutral-800 dark:text-gray-100">
                {t("ui.no_posts_yet")}
              </p>
            ) : (
              posts.map((post) => {
                const readingMinutes = getReadingTime(post.content);
                const minLabel = readingMinutes === 1 ? "min" : "mins";

                return (
                  <motion.article
                    key={post.id}
                    variants={itemVars}
                    className="group relative bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 hover:shadow-xl hover:shadow-zinc-800/5 dark:hover:shadow-gray-100/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  >
                    {post.cover_image && (
                      <Link
                        to={getLocalizedPath(`blog/${post.slug}`, currentLang)}
                        className="block mb-6 -mx-6 -mt-6 overflow-hidden aspect-video"
                      >
                        <img
                          src={post.cover_image}
                          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                    )}

                    {post.categories && (
                      <div className="mb-4">
                        <Link
                          to={getLocalizedPath(
                            `blog/topic/${post.categories.slug}`,
                            currentLang,
                          )}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-600 dark:bg-zinc-50/70 dark:text-zinc-900 text-xs font-bold uppercase tracking-wider hover:bg-blue-200 dark:hover:bg-zinc-300 transition-colors"
                        >
                          <IconMapper
                            name={post.categories.icon}
                            className="w-3 h-3"
                          />
                          {t(`categories.${post.categories.slug}`)}
                        </Link>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-zinc-300 transition-colors mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(post.created_at, currentLang)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {readingMinutes} {minLabel}
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-300 mb-2 group-hover:text-blue-600 dark:group-hover:text-yellow-400 transition-colors">
                      {post.title}
                    </h2>

                    <p className="text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-4">
                      {removeMarkdown(post.content)}
                    </p>

                    <Link
                      to={getLocalizedPath(`blog/${post.slug}`, currentLang)}
                      state={{ from: location }}
                      className="inline-flex items-center text-blue-600 dark:text-yellow-400 font-medium cursor-pointer"
                    >
                      {t("button.read_more")}{" "}
                      <ArrowRight
                        size={16}
                        className="ml-2 group-hover:translate-x-1 transition-transform"
                      />
                    </Link>
                  </motion.article>
                );
              })
            )}
          </motion.div>
        )}
      </div>
    </>
  );
}
