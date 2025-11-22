# دليل الإعداد والتثبيت - FiveM Admin Statistics Bot

## المتطلبات الأساسية

1. **Node.js** - الإصدار 18 أو أحدث
2. **حساب Discord Developer** - لإنشاء البوت
3. **صلاحيات الإدارة** - في السيرفر المراد إضافة البوت له

## خطوات الإعداد

### 1. إنشاء تطبيق Discord

1. انتقل إلى [Discord Developer Portal](https://discord.com/developers/applications)
2. اضغط على "New Application"
3. أدخل اسم البوت واضغط "Create"

### 2. إنشاء البوت

1. في صفحة التطبيق، انتقل إلى قسم "Bot"
2. اضغط "Add Bot" ثم "Yes, do it!"
3. فعّل الخيارات التالية تحت "Privileged Gateway Intents":
   - ✅ PRESENCE INTENT
   - ✅ SERVER MEMBERS INTENT
   - ✅ MESSAGE CONTENT INTENT
4. انسخ الـ Token (ستحتاجه لاحقاً)

### 3. الحصول على معرفات التطبيق

1. في صفحة "General Information"، انسخ:
   - Application ID (CLIENT_ID)
2. في Discord، فعّل وضع المطور:
   - إعدادات → إعدادات متقدمة → وضع المطور
3. انقر بزر الماوس الأيمن على السيرفر وانسخ المعرف (GUILD_ID)
4. انقر بزر الماوس الأيمن على الرتب وانسخ معرفاتها

### 4. دعوة البوت إلى السيرفر

1. في Developer Portal، انتقل إلى "OAuth2" → "URL Generator"
2. اختر Scopes:
   - ✅ bot
   - ✅ applications.commands
3. اختر Bot Permissions:
   - ✅ Read Messages/View Channels
   - ✅ Send Messages
   - ✅ Manage Messages
   - ✅ Embed Links
   - ✅ Read Message History
   - ✅ Connect (Voice)
   - ✅ Manage Roles
   - ✅ Manage Channels
4. انسخ الرابط المُنشأ وافتحه في المتصفح
5. اختر السيرفر واضغط "Authorize"

### 5. إعداد المشروع

```bash
# 1. استنساخ المشروع
git clone https://github.com/AKTROLEK/Admin-Supports.git
cd Admin-Supports

# 2. تثبيت المتطلبات
npm install

# 3. إنشاء ملف البيئة
cp .env.example .env
```

### 6. تكوين ملف .env

افتح ملف `.env` وأضف المعلومات التالية:

```env
# معلومات البوت الأساسية
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here

# إعدادات البوت
DEFAULT_LANGUAGE=ar
TIMEZONE=Asia/Riyadh

# معرفات الرتب الإدارية (افصل بينها بفاصلة)
ADMIN_ROLES=role_id_1,role_id_2,role_id_3
MODERATOR_ROLES=role_id_4,role_id_5
SUPERVISOR_ROLES=role_id_6

# الرتب التي يمكنها إضافة ملاحظات
MANAGEMENT_ROLES=role_id_7,role_id_8

# إعدادات النسخ الاحتياطي
BACKUP_INTERVAL=86400000
BACKUP_RETENTION_DAYS=30
```

### 7. تشغيل البوت

```bash
# تشغيل عادي
npm start

# تشغيل مع التحديث التلقائي (للتطوير)
npm run dev
```

## التحقق من التثبيت

بعد تشغيل البوت، يجب أن تشاهد:

```
✅ Database initialized successfully
✅ Loaded command: stats-daily
✅ Loaded command: stats-weekly
... (المزيد من الأوامر)
✅ Loaded event: ready
✅ Loaded event: voiceStateUpdate
... (المزيد من الأحداث)
✅ Successfully registered X guild commands
✅ Bot is online as YourBot#1234
```

## اختبار الأوامر

في Discord، جرب الأوامر التالية:

```
/stats-daily - إحصائيات اليوم
/dashboard - لوحة التحكم
/note add - إضافة ملاحظة
/backup create - إنشاء نسخة احتياطية
```

## حل المشاكل الشائعة

### البوت لا يستجيب للأوامر

1. تأكد من تفعيل جميع Intents في Developer Portal
2. تأكد من منح البوت الصلاحيات المطلوبة في السيرفر
3. تأكد من تسجيل الأوامر بنجاح (راجع سجل الكونسول)

### خطأ في قاعدة البيانات

1. تأكد من وجود مجلد `data` في المشروع
2. تأكد من صلاحيات الكتابة على المجلد
3. احذف ملف `data/database.db` وأعد تشغيل البوت

### الأوامر لا تظهر في Discord

1. انتظر حتى 5 دقائق (للأوامر الـ Global)
2. استخدم Guild Commands بإضافة GUILD_ID في .env
3. اضغط "/" في Discord وتأكد من ظهور البوت في القائمة

## الصيانة

### النسخ الاحتياطي اليدوي

```bash
# إنشاء نسخة احتياطية
/backup create

# عرض النسخ الاحتياطية
/backup list

# استرجاع نسخة
/backup restore filename.db
```

### تصدير البيانات

```bash
/export period:weekly
```

## الأمان

⚠️ **مهم جداً:**

1. لا تشارك ملف `.env` أبداً
2. لا تنشر Token البوت
3. احفظ النسخ الاحتياطية في مكان آمن
4. حدد الصلاحيات بدقة لكل رتبة

## الدعم

إذا واجهت أي مشاكل:

1. راجع [Issues](https://github.com/AKTROLEK/Admin-Supports/issues)
2. افتح Issue جديد مع وصف المشكلة
3. أرفق سجل الأخطاء (Console Log)

## التحديثات

للحصول على آخر التحديثات:

```bash
git pull origin main
npm install
npm start
```
