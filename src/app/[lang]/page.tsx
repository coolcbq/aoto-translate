import I18nLink from '@/components/i18n/I18nLink'
import LanguageFooter from '@/components/LanguageFooter'
import { canonicalUrl, getI18nInstance } from '@/i18n'
import { t, Trans } from '@lingui/macro'
import { setI18n } from '@lingui/react/server'
import { Metadata } from 'next'

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const i18n = getI18nInstance(params.lang)

  return {
    title: t(i18n)`auto-i18n-next-lingui-tiny-demo, add a new language to your website in 5 minutes`,
    description: t(i18n)`Use Lingui to add a new language to your website in 5 minutes with AI`,
    alternates: {
      canonical: canonicalUrl('/', params.lang),
    },
  }
}

export default function HomePage({ params }: { params: { lang: string } }) {
  const lang = params.lang
  const i18n = getI18nInstance(lang)
  setI18n(i18n)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">
          <Trans>
            Welcome to <a href="https://nextjs.org" className="text-blue-400 hover:underline">Next.js!</a>
          </Trans>
        </h1>
        <I18nLink href="/subpage" lang={lang} className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mb-6">
          <Trans>
            To Sub Page
          </Trans>
        </I18nLink>
        <div className="space-y-2 mb-6">
          <Trans>
            <p className="bg-gray-800 p-2 rounded">Keyword 1 (do not translate in keywords.txt)</p>
            <p className="bg-gray-800 p-2 rounded">Keyword 2</p>
            <p className="bg-gray-800 p-2 rounded">Keyword 3 (do not translate in keywords.txt)</p>
          </Trans>
        </div>
        <LanguageFooter href="/" thisLang={lang} />
      </main>
    </div>
  )
}
