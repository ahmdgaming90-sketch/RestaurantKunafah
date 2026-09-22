import type { RestaurantSettings } from "@/types/database";

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M4 5c0-.6.4-1 1-1h2.6c.5 0 .9.3 1 .8l.9 3.3c.1.4 0 .8-.3 1.1L7.9 10.6a13 13 0 0 0 5.5 5.5l1.4-1.3c.3-.3.7-.4 1.1-.3l3.3.9c.5.1.8.5.8 1V19c0 .6-.4 1-1 1h-1.5C9.6 20 4 14.4 4 6.5V5Z" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="6.5" width="18" height="13" rx="2.5" />
      <circle cx="12" cy="13" r="3.4" />
      <path d="M8.5 6.5 9.8 4h4.4l1.3 2.5" />
    </svg>
  );
}

export default function RestaurantInfo({ settings }: { settings: RestaurantSettings | null }) {
  if (!settings) return null;

  return (
    <div className="space-y-3 text-sm">
      {settings.address ? (
        <div className="flex items-start gap-2 text-espresso/70">
          <span className="mt-0.5 text-gold">
            <PinIcon />
          </span>
          <span>{settings.address}</span>
        </div>
      ) : null}
      {settings.phone ? (
        <div className="flex items-center gap-2 text-espresso/70">
          <span className="text-gold">
            <PhoneIcon />
          </span>
          <a href={`tel:${settings.phone}`} className="hover:text-gold">
            {settings.phone}
          </a>
        </div>
      ) : null}
      {settings.instagram ? (
        <div className="flex items-center gap-2 text-espresso/70">
          <span className="text-gold">
            <CameraIcon />
          </span>
          <a
            href={`https://instagram.com/${settings.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gold"
          >
            @{settings.instagram}
          </a>
        </div>
      ) : null}
      {settings.maps_url ? (
        <a
          href={settings.maps_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm font-medium text-gold hover:underline"
        >
          فتح الموقع في خرائط جوجل
        </a>
      ) : null}
    </div>
  );
}
