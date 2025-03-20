import { useTranslation } from "@renderer/i18n/useTranslation";

export const RecommendationCard = (): JSX.Element => {
  const { t } = useTranslation();
  return (
    <div
      className="shadow-drop rounded-md border border-neutral-100 border-opacity-20 px-2 py-1"
      style={{
        background:
          "linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.25) 50%, rgba(255, 255, 255, 0) 100%)",
      }}
    >
      <p className="caption-12-regular text-neutral-50">{t("appSetting.recommendataion")}</p>
    </div>
  );
};
