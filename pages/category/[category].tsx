import React from 'react'
import Head from 'next/head'
import { capitalizeFirstLetter, debounce, makeCategory } from '../../utils'
import {
  IArticle,
  ICategory,
  ICollectionResponse,
  IPagination,
  IQueryOptions,
} from '../../types'
import Tabs from '../../components/Tabs'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { fetchArticles, fetchCategories } from '../../http'
import { AxiosResponse } from 'axios'
import qs from 'qs'
import ArticleList from '../../components/ArticleList'
import Pagination from '../../components/Pagination'

interface IPropType {
  categories: {
    items: ICategory[]
    pagination: IPagination
  }
  articles: {
    items: IArticle[]
    pagination: IPagination
  }
  slug: string
}

const category = ({ categories, articles, slug }: IPropType) => {
  const router = useRouter()
  const { category: categorySlug } = router.query
  const { page, pageCount } = articles.pagination

  const handleSearch = (query: string) => {
    router.push(`/category/${categorySlug}/?search=${query}`)
  }

  const formattedCategory = () => {
    return capitalizeFirstLetter(makeCategory(slug))
  }

  return (
    <>
      <Head>
        <title>DevMirza Blog | {formattedCategory()}</title>
        <meta name="description" content="DevMirza Blog" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Tabs
        categories={categories.items}
        handleOnSearch={debounce(handleSearch, 500)}
      />
      <ArticleList articles={articles.items} />
      <Pagination
        page={page}
        pageCount={pageCount}
        redirectUrl={`/category/${categorySlug}`}
      />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const options: IQueryOptions = {
    populate: ['author.avatar'],
    sort: ['id:desc'],
    filters: {
      category: {
        slug: query.category,
      },
    },
    pagination: {
      page: query.page ? +query.page : 1,
      pageSize: 1,
    },
  }

  if (query.search) {
    options.filters = {
      Title: {
        $containsi: query.search,
      },
    }
  }

  const queryString = qs.stringify(options)

  const { data: articles }: AxiosResponse<ICollectionResponse<IArticle[]>> =
    await fetchArticles(queryString)

  const { data: categories }: AxiosResponse<ICollectionResponse<ICategory[]>> =
    await fetchCategories()

  return {
    props: {
      categories: {
        items: categories.data,
        pagination: categories.meta.pagination,
      },
      articles: {
        items: articles.data,
        pagination: articles.meta.pagination,
      },
      slug: query.category,
    },
  }
}

export default category
