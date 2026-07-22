import { getSiteSettings } from "@/lib/data/settings";
import { SITE_SETTING_FIELDS } from "@/lib/settings-fields";
import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";

export default async function AdminSettingsPage() {
  const textKeys = SITE_SETTING_FIELDS.map((field) => field.key);
  const settings = await getSiteSettings([...textKeys, "hero_image_url"]);

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium">기본 설정</h1>

      <div className="mt-8 max-w-4xl rounded-lg border border-border p-6">
        <SiteSettingsForm
          initialValues={settings}
          initialHeroImageUrl={settings.hero_image_url || undefined}
        />
      </div>
    </div>
  );
}