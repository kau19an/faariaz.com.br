import { useTranslation } from "react-i18next";
import PageHead from "../components/seo/PageHead";

export default function Home() {
  const { t } = useTranslation();

  return (
    <>
      <PageHead titleKey="title.home" />
      <div className="text-center">
        <h1 className="text-xl font-bold mb-2">{t("wip.title")}</h1>
        <p>{t("wip.text")}</p>
      </div>
    </>
  );
}
