"use client";

import { useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import { DAY_NAMES_AR } from "@/types/database";
import type { OpeningHour, Restaurant, RestaurantSettings as Settings } from "@/types/database";
import type { SettingsInput, OpeningHourInput } from "@/app/admin/(dashboard)/settings/actions";

type Actions = {
  updateSettings: (input: SettingsInput) => Promise<{ error?: string; success?: boolean }>;
  updateOpeningHours: (hours: OpeningHourInput[]) => Promise<{ error?: string; success?: boolean }>;
};

export default function RestaurantSettingsForm({
  restaurant,
  settings,
  hours,
  actions,
}: {
  restaurant: Restaurant;
  settings: Settings | null;
  hours: OpeningHour[];
  actions: Actions;
}) {
  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(settings?.description ?? "");
  const [phone, setPhone] = useState(settings?.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(settings?.whatsapp ?? "");
  const [instagram, setInstagram] = useState(settings?.instagram ?? "");
  const [address, setAddress] = useState(settings?.address ?? "");
  const [mapsUrl, setMapsUrl] = useState(settings?.maps_url ?? "");
  const [logoUrl, setLogoUrl] = useState<string | null>(settings?.logo_url ?? null);
  const [coverUrl, setCoverUrl] = useState<string | null>(settings?.cover_url ?? null);
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const [hourRows, setHourRows] = useState(
    hours.map((h) => ({
      id: h.id,
      dayOfWeek: h.day_of_week,
      openTime: h.open_time?.slice(0, 5) ?? "14:00",
      closeTime: h.close_time?.slice(0, 5) ?? "00:00",
      isClosed: h.is_closed,
    }))
  );
  const [savingHours, setSavingHours] = useState(false);
  const [hoursMessage, setHoursMessage] = useState<string | null>(null);

  async function handleInfoSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingInfo(true);
    setInfoMessage(null);

    const res = await actions.updateSettings({
      name,
      description,
      phone,
      whatsapp,
      instagram,
      address,
      mapsUrl,
      logoUrl,
      coverUrl,
    });

    setSavingInfo(false);
    setInfoMessage(res.error ?? "تم حفظ التغييرات");
  }

  function updateHourRow(id: string, patch: Partial<(typeof hourRows)[number]>) {
    setHourRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  async function handleHoursSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingHours(true);
    setHoursMessage(null);

    const res = await actions.updateOpeningHours(hourRows);

    setSavingHours(false);
    setHoursMessage(res.error ?? "تم حفظ أوقات العمل");
  }

  return (
    <div className="space-y-10">
      <form onSubmit={handleInfoSubmit} className="space-y-4">
        <h2 className="text-sm font-semibold text-espresso">معلومات المطعم</h2>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-espresso">اسم المطعم</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-espresso/15 px-4 py-2.5 text-sm outline-none focus:border-gold" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-espresso">الوصف</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-xl border border-espresso/15 px-4 py-2.5 text-sm outline-none focus:border-gold" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-espresso">الهاتف</label>
            <input dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-espresso/15 px-4 py-2.5 text-sm outline-none focus:border-gold" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-espresso">واتساب</label>
            <input dir="ltr" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="9665xxxxxxxx" className="w-full rounded-xl border border-espresso/15 px-4 py-2.5 text-sm outline-none focus:border-gold" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-espresso">Instagram (بدون @)</label>
          <input dir="ltr" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="w-full rounded-xl border border-espresso/15 px-4 py-2.5 text-sm outline-none focus:border-gold" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-espresso">العنوان</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-xl border border-espresso/15 px-4 py-2.5 text-sm outline-none focus:border-gold" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-espresso">رابط خرائط جوجل</label>
          <input dir="ltr" value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} className="w-full rounded-xl border border-espresso/15 px-4 py-2.5 text-sm outline-none focus:border-gold" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-espresso">الشعار</label>
            <ImageUploader value={logoUrl} onChange={setLogoUrl} folder="branding" label="رفع الشعار" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-espresso">صورة الغلاف</label>
            <ImageUploader value={coverUrl} onChange={setCoverUrl} folder="branding" label="رفع صورة الغلاف" />
          </div>
        </div>

        {infoMessage ? <p className="text-sm text-gold">{infoMessage}</p> : null}

        <button type="submit" disabled={savingInfo} className="btn-primary w-full disabled:opacity-50">
          {savingInfo ? "جارٍ الحفظ..." : "حفظ معلومات المطعم"}
        </button>
      </form>

      <form onSubmit={handleHoursSubmit} className="space-y-4">
        <h2 className="text-sm font-semibold text-espresso">أوقات العمل</h2>

        <div className="space-y-3">
          {hourRows.map((row) => (
            <div key={row.id} className="rounded-xl border border-espresso/10 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-espresso">{DAY_NAMES_AR[row.dayOfWeek]}</span>
                <label className="flex items-center gap-1.5 text-xs text-espresso/60">
                  <input type="checkbox" checked={row.isClosed} onChange={(e) => updateHourRow(row.id, { isClosed: e.target.checked })} />
                  إغلاق اليوم
                </label>
              </div>
              {!row.isClosed ? (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    value={row.openTime}
                    onChange={(e) => updateHourRow(row.id, { openTime: e.target.value })}
                    className="rounded-lg border border-espresso/15 px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                  <input
                    type="time"
                    value={row.closeTime}
                    onChange={(e) => updateHourRow(row.id, { closeTime: e.target.value })}
                    className="rounded-lg border border-espresso/15 px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {hoursMessage ? <p className="text-sm text-gold">{hoursMessage}</p> : null}

        <button type="submit" disabled={savingHours} className="btn-primary w-full disabled:opacity-50">
          {savingHours ? "جارٍ الحفظ..." : "حفظ أوقات العمل"}
        </button>
      </form>
    </div>
  );
}
