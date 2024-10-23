import LanguageFooter from "@/components/LanguageFooter"
import { canonicalUrl, getI18nInstance } from "@/i18n"
import { t, Trans } from "@lingui/macro"
import { setI18n } from "@lingui/react/server"

import { Metadata } from "next"

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const i18n = getI18nInstance(params.lang)

  return {
    title: t(i18n)`This is a subpage`,
    description: t(i18n)`This is subpage's description`,
    alternates: {
      canonical: canonicalUrl('/subpage', params.lang),
    },
  }
}

export default function SubPage({ params }: { params: { lang: string } }) {
  const lang = params.lang
  const i18n = getI18nInstance(lang)
  setI18n(i18n)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">
          <Trans>Sub Page</Trans>
        </h1>
        <LanguageFooter href="/subpage" thisLang={lang} />
      </main>
    </div>
  )
}
