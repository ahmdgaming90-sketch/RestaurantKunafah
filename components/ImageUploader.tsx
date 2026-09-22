"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "restaurant-media";

export default function ImageUploader({
  value,
  onChange,
  folder,
  label = "رفع صورة",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  folder: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      onChange(data.publicUrl);
      setStatus("idle");
    } catch {
      setStatus("error");
      setErrorMessage("حدث خطأ أثناء رفع الصورة، حاول مرة أخرى.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    onChange(null);
  }

  return (
    <div>
      {value ? (
        <div className="relative mb-3 h-40 w-full overflow-hidden rounded-xl bg-cream">
          <Image src={value} alt="معاينة الصورة" fill className="object-cover" sizes="320px" />
        </div>
      ) : null}

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" id={`upload-${folder}`} />

      <div className="flex gap-2">
        <label
          htmlFor={`upload-${folder}`}
          className="btn-secondary cursor-pointer !px-4 !py-2 text-xs"
        >
          {status === "uploading" ? "جارٍ الرفع..." : value ? "استبدال الصورة" : label}
        </label>
        {value ? (
          <button type="button" onClick={handleRemove} className="text-xs text-espresso/50 hover:text-red-600">
            حذف الصورة
          </button>
        ) : null}
      </div>

      {status === "error" ? <p className="mt-2 text-xs text-red-600">{errorMessage}</p> : null}
    </div>
  );
}
