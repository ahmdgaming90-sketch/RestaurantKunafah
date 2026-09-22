# كنافة سكره — موقع المطعم ولوحة الإدارة

مشروع Next.js + Supabase كامل لمطعم "كنافة سكره": موقع عام (منيو، سلة، طلبات عبر واتساب) ولوحة إدارة محمية.

## 1. تثبيت المشروع

```bash
npm install
```

## 2. إنشاء مشروع Supabase

1. أنشئ مشروعًا جديدًا على [supabase.com](https://supabase.com).
2. من إعدادات المشروع (Project Settings → API) انسخ:
   - `Project URL`
   - `anon public key`

## 3. تشغيل SQL Migrations

في Supabase SQL Editor، شغّل الملفين بالترتيب:

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_orders_addons.sql`

هذا ينشئ كل الجداول، RLS، دالة إنشاء الطلب الآمنة (`create_order`)، وبيانات المطعم الأساسية (الاسم، العنوان، المنتجات الثلاثة، أوقات العمل).

## 4. إعداد Storage

الـ Migration الأول ينشئ تلقائيًا bucket باسم `restaurant-media` (عام للقراءة، ويتطلب تسجيل دخول للرفع). لا حاجة لأي إعداد يدوي إضافي.

## 5. إنشاء حساب المدير

1. من Supabase Dashboard → Authentication → Users → Add User، أنشئ مستخدمًا بالبريد وكلمة المرور التي تريدها.
2. من SQL Editor نفّذ (استبدل `USER_UUID` بمعرّف المستخدم الذي أنشأته):

```sql
insert into public.profiles (id, restaurant_id, full_name, role)
values ('USER_UUID', '00000000-0000-0000-0000-000000000001', 'مدير المطعم', 'admin');
```

## 6. متغيرات البيئة

انسخ `.env.example` إلى `.env.local` واملأ القيم:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## 7. تشغيل المشروع محليًا

```bash
npm run dev
```

الموقع العام: `http://localhost:3000`
لوحة الإدارة: `http://localhost:3000/admin/login`

## 8. رفعه إلى GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <رابط-المستودع>
git push -u origin main
```

## 9. النشر على Vercel

1. اربط المستودع من [vercel.com](https://vercel.com).
2. أضف نفس متغيرات البيئة (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) في إعدادات المشروع على Vercel.
3. اختياري: أضف `NEXT_PUBLIC_SITE_URL` (رابط الموقع النهائي) لتحسين `sitemap.xml`.
4. اضغط Deploy.

## 10. إضافة Domain

من Vercel → Project Settings → Domains، أضف الدومين الخاص بك واتبع تعليمات DNS.

## 11. Google Search Console

بعد النشر، أضف الموقع في [Google Search Console](https://search.google.com/search-console)، تحقق من الملكية، ثم أرسل رابط `sitemap.xml` (مثال: `https://your-domain.com/sitemap.xml`).

---

## ملاحظات مهمة

- **الأسعار**: لا يُعتمد على السعر المُرسل من المتصفح إطلاقًا — كل طلب يُعاد احتسابه بالكامل داخل قاعدة البيانات عبر دالة `create_order` قبل الحفظ.
- **رقم الطلب**: يتم توليده بشكل ذري (race-safe) داخل قاعدة البيانات بصيغة `KS-YYYYMMDD-NNN`.
- **الصور**: تُرفع إلى Supabase Storage مباشرة من الجوال (بدون Base64 في قاعدة البيانات).
- **إعادة الاستخدام لمطعم آخر**: عدّل `RESTAURANT_SLUG` في `types/database.ts` وبيانات المطعم في جدول `restaurants`/`restaurant_settings`.
- **الشعار الحالي**: الأيقونات في `public/icons/` هي Placeholder مؤقت (علامة ذهبية بسيطة) — استبدلها بشعار المطعم الحقيقي بنفس المقاسات (192×192، 512×512، 180×180) عند توفره.
