import I18nLink from "@/components/i18n/I18nLink";
import { languageI18nNames } from "@/const";
import { Trans } from "@lingui/macro";

export default function LanguageFooter({ href, thisLang }: { href: string, thisLang: string }) {
  return <div className="flex flex-col gap-4">
    <Trans>Other Language versions:</Trans>
    {Object.entries(languageI18nNames)
      .filter(([code]) => code !== thisLang)
      .map(([code, name]) => (
        <div key={code} className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mb-6">
          <I18nLink href={href} lang={code}>
            {name}
          </I18nLink>
        </div>
      ))}
  </div>
}
