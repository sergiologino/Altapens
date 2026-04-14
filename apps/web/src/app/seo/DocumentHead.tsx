import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import {
  getAppSiteUrl,
  getSeoForPath,
  isPrivateAppPath,
} from '@/shared/seo/app-seo'

export function DocumentHead() {
  const { pathname } = useLocation()
  const seo = getSeoForPath(pathname)
  const site = getAppSiteUrl()
  const canonical = `${site}${pathname === '/' ? '' : pathname}`
  const noindex = isPrivateAppPath(pathname)

  return (
    <Helmet htmlAttributes={{ lang: 'ru' }}>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords.join(', ')} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="ru_RU" />
      <meta property="og:url" content={canonical} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
    </Helmet>
  )
}
