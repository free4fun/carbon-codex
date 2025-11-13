import { headers } from "next/headers";
import en from "@/i18n/en.json";
import es from "@/i18n/es.json";

type Locale = "en" | "es";

export default async function SurveyPage({ searchParams = {} }: { searchParams?: any }) {
  const headersList = await headers();
  const locale = (headersList.get("x-locale") as Locale) || "en";
  const t = locale === "en" ? en : es;

  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] px-6">
      <div className="max-w-3xl w-full space-y-6 text-center">
        <h1 className="text-4xl font-bold text-magenta">
          {t["nav.survey"]}
        </h1>
        <p className="text-lg text-text-gray">
          {t["home.surveyDescription"]}
        </p>
        <div className="pt-4">
          <p className="text-sm text-text-gray/70">
            {t["survey.comingSoon"]}
          </p>
        </div>
      </div>
    </main>
  );
}
