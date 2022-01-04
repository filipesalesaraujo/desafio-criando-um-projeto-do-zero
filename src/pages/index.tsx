import { GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { BiCalendarAlt, BiUser } from 'react-icons/bi';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';
import Header from '../components/Header';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({
  postsPagination,
  preview,
}: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  function loadMorePosts(): void {
    fetch(nextPage)
      .then(response => response.json())
      .then(data => {
        const dataPosts = {
          uid: data.results[0].uid,
          first_publication_date: String(
            format(
              new Date(data.results[0].first_publication_date),
              'dd MMMM yyyy',
              {
                locale: ptBR,
              }
            )
          ),
          data: {
            title: data.results[0].data.title,
            subtitle: data.results[0].data.subtitle,
            author: data.results[0].data.author,
          },
        };
        const morePosts = [...posts, dataPosts];
        setPosts(morePosts);
        setNextPage(data.next_page);
      });
  }
  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>
      <div className={styles.wrap}>
        <Header />
      </div>
      <main className={`${commonStyles.container} ${styles.mainContainer}`}>
        <section className={commonStyles.content}>
          <div className={styles.postlist}>
            {posts.map(post => (
              <Link key={post.uid} href={`/post/${post.uid}`}>
                <a>
                  <strong>{post.data.title}</strong>
                  <p>{post.data.subtitle}</p>
                  <div>
                    <span>
                      <BiCalendarAlt />
                      <small>
                        <time>
                          {String(
                            format(
                              new Date(post.first_publication_date),
                              'dd MMM yyyy',
                              {
                                locale: ptBR,
                              }
                            )
                          )}
                        </time>
                      </small>
                    </span>
                    <span>
                      <BiUser />
                      <small>{post.data.author}</small>
                    </span>
                  </div>
                </a>
              </Link>
            ))}
          </div>
          {nextPage && (
            <button
              className={styles.morePosts}
              onClick={() => loadMorePosts()}
              type="button"
            >
              Carregar mais posts
            </button>
          )}
          {preview && (
            <aside>
              <Link href="/api/exit-preview">
                <a>Sair do modo Preview</a>
              </Link>
            </aside>
          )}
        </section>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData = {},
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 2,
      ref: previewData?.ref ?? null,
    }
  );
  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });
  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
      preview,
    },
  };
};
