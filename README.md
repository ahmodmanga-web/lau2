# T-Shirt Inventory PWA

تطبيق React + TypeScript لإدارة جرد التيشرتات، يعمل كتطبيق PWA على iPhone وAndroid والكمبيوتر.

## الوظائف

- تسجيل رقم التيشرت.
- تسجيل اسم الشخص.
- إضافة ملاحظات اختيارية.
- تعديل وحذف السجلات.
- البحث برقم التيشرت أو الاسم أو الملاحظات.
- تصميم عربي RTL متجاوب.
- تثبيت على شاشة iPhone الرئيسية من Safari.
- ربط Supabase مع طبقة Repository منفصلة.

## التشغيل

```powershell
npm install
Copy-Item .env.example .env.local
```

عدّل `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

ثم:

```powershell
npm run dev
```

## البناء والنشر

```powershell
npm run build
npm run preview
```

ارفع مجلد `dist` إلى Vercel أو Netlify أو Firebase Hosting. يجب أن تكون الاستضافة HTTPS حتى يعمل PWA بشكل صحيح.

على iPhone افتح الرابط من Safari ثم اختر:

`Share` ثم `Add to Home Screen`

## قاعدة البيانات

نفّذ ملف [`supabase/migrations/001_create_tshirt_inventory.sql`](supabase/migrations/001_create_tshirt_inventory.sql)
داخل Supabase SQL Editor.

## الهيكل

```text
src/
  app/                         # تجميع التطبيق والصفحة الرئيسية
  features/inventory/
    components/                # مكونات عرض وإضافة السجلات
    data/                      # اتصال Supabase وعمليات CRUD
    domain/                    # أنواع المجال
    hooks/                     # حالة الجرد والتنسيق مع الواجهة
  shared/components/            # مكونات مشتركة
  styles/                      # CSS العام والمتجاوب
public/                        # الأيقونة وملفات PWA
supabase/migrations/            # مخطط قاعدة البيانات
```

لا تضع مفاتيح Supabase داخل Git؛ ملف `.env.local` مستبعد من Git.
