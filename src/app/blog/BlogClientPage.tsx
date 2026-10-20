'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './blog.module.css';
import { urlFor } from '@/lib/sanity';
import type { Post } from '@/lib/sanity';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import ScrollReveal from '@/components/ScrollReveal/ScrollReveal';

const POSTS_PER_PAGE = 6;

function formatDate(dateStr: string, lang: string): string {
  try {
    return new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : 'en-US', {
      day: '2-digit', month: 'short', year: 'numeric',
    }).format(new Date(dateStr));
  } catch { return dateStr; }
}

function PostCard({ post }: { post: Post }) {
  const { language } = useLanguage();
  const title   = (language === 'en' && post.titleEn)   ? post.titleEn   : post.title;
  const excerpt = (language === 'en' && post.excerptEn) ? post.excerptEn : post.excerpt;

  return (
    <Link href={`/blog/${post.slug.current}`} className={styles.card}>
      <div className={styles.cardImage}>
        {(post.mainImage as any)?.asset ? (
          <Image
            src={urlFor(post.mainImage).width(600).height(380).url()}
            alt={(post.mainImage as any)?.alt || post.title}
            fill
            className={styles.cardImg}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className={styles.cardImgPlaceholder}>
            <span>📰</span>
          </div>
        )}
        {post.category && <span className={styles.cardBadge}>{post.category}</span>}
      </div>
      <div className={styles.cardBody}>
        <h2 className={styles.cardTitle}>{title}</h2>
        {excerpt && <p className={styles.cardExcerpt}>{excerpt}</p>}
        <div className={styles.cardMeta}>
          <span className={styles.cardDate}>{formatDate(post.publishedAt, language)}</span>
          <span className={styles.cardReadMore}>
            {language === 'pt' ? 'Ler artigo' : 'Read article'}
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

const t = {
  pt: {
    eyebrow: 'Blog',
    title: 'Conteúdo para o\nbrasileiro nos EUA',
    search: 'Pesquisar artigos...',
    all: 'Todos',
    results: (n: number, page: number, total: number) =>
      n === 0 ? 'Nenhum artigo encontrado.' : `${n} artigo${n !== 1 ? 's' : ''} página ${page} de ${total}`,
    empty: 'Nenhum resultado para',
    reset: 'Ver todos os artigos',
    ctaTitle: 'Tem dúvidas sobre documentação?',
    ctaBtn: 'Falar no WhatsApp',
  },
  en: {
    eyebrow: 'Blog',
    title: 'Content for\nBrazilians in the USA',
    search: 'Search articles...',
    all: 'All',
    results: (n: number, page: number, total: number) =>
      n === 0 ? 'No articles found.' : `${n} article${n !== 1 ? 's' : ''} page ${page} of ${total}`,
    empty: 'No results for',
    reset: 'See all articles',
    ctaTitle: 'Have questions about documentation?',
    ctaBtn: 'Chat on WhatsApp',
  },
};

export default function BlogClientPage({
  initialPosts,
  initialCategories,
}: {
  initialPosts: Post[];
  initialCategories: string[];
}) {
  const { language } = useLanguage();
  const copy = t[language];
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((p) => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.excerpt || '').toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [initialPosts, activeCategory, search]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginated  = filteredPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  const handleCat    = (cat: string) => { setActiveCategory(cat); setCurrentPage(1); };
  const handleSearch = (val: string) => { setSearch(val); setCurrentPage(1); };

  return (
    <main>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden />
        <div className="container">
          <div className={styles.heroContent}>
            <span className={styles.heroEyebrow}>{copy.eyebrow}</span>
            <h1 className={styles.heroTitle}>
              {copy.title.split('\n').map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </h1>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className={styles.filterBar}>
        <div className={`container ${styles.filterInner}`}>
          {/* Search */}
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="blog-search"
              type="text"
              placeholder={copy.search}
              className={styles.searchInput}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {search && (
              <button className={styles.searchClear} onClick={() => handleSearch('')} aria-label="Limpar busca">×</button>
            )}
          </div>

          {/* Pills */}
          <div className={styles.pills}>
            <button
              className={`${styles.pill} ${activeCategory === 'all' ? styles.pillActive : ''}`}
              onClick={() => handleCat('all')}
            >
              {copy.all}
            </button>
            {initialCategories.map((cat) => (
              <button
                key={cat}
                className={`${styles.pill} ${activeCategory === cat ? styles.pillActive : ''}`}
                onClick={() => handleCat(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className={styles.postsSection}>
        <div className="container">
          <p className={styles.resultsCount}>{copy.results(filteredPosts.length, currentPage, totalPages || 1)}</p>

          {paginated.length > 0 ? (
            <>
              <div className={styles.grid}>
                {paginated.map((post, i) => (
                  <ScrollReveal key={post._id} variant="fadeUp" delay={i % 3 * 100}>
                    <PostCard post={post} />
                  </ScrollReveal>
                ))}
              </div>

              {totalPages > 1 && (
                <nav className={styles.pagination} aria-label="Paginação">
                  <button
                    className={`${styles.pageBtn} ${styles.pageBtnArrow}`}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    aria-label="Anterior"
                  >‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`${styles.pageBtn} ${page === currentPage ? styles.pageBtnActive : ''}`}
                      onClick={() => setCurrentPage(page)}
                      aria-current={page === currentPage ? 'page' : undefined}
                    >{page}</button>
                  ))}
                  <button
                    className={`${styles.pageBtn} ${styles.pageBtnArrow}`}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Próxima"
                  >›</button>
                </nav>
              )}
            </>
          ) : (
            <div className={styles.emptyState}>
              <span>🔍</span>
              <p>
                {copy.empty}
                {(search || activeCategory !== 'all') && (
                  <> <strong>"{search || activeCategory}"</strong></>
                )}
              </p>
              <button className={styles.emptyReset} onClick={() => { handleSearch(''); handleCat('all'); }}>
                {copy.reset}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>{copy.ctaTitle}</h2>
            <a
              href={`https://api.whatsapp.com/send/?phone=19046515886&text=${encodeURIComponent('Olá! Vim pelo blog da Atheros e tenho uma dúvida.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaBtn}
            >
              {copy.ctaBtn}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
