# البنية المعمارية - FiveM Admin Statistics Bot

## نظرة عامة على النظام

هذا البوت مصمم باستخدام معماريات حديثة وأفضل الممارسات في تطوير بوتات Discord.

## المكونات الرئيسية

### 1. نظام قاعدة البيانات (Database Layer)

**الملفات:**
- `src/database/schema.js` - تعريف الجداول والفهارس
- `src/database/queries.js` - استعلامات قاعدة البيانات

**التقنية:** SQLite مع better-sqlite3
- استخدام WAL mode لتحسين الأداء
- الفهرسة الصحيحة لتسريع الاستعلامات
- تخزين بيانات منظمة مع timestamps

**الجداول:**
1. `voice_sessions` - جلسات الصوت
2. `user_interactions` - تفاعلات المستخدمين
3. `role_changes` - تغييرات الرتب
4. `channel_changes` - تغييرات القنوات
5. `admin_notes` - ملاحظات الإدارة
6. `message_activity` - نشاط الرسائل
7. `server_actions` - إجراءات السيرفر
8. `alerts_config` - إعدادات التنبيهات
9. `role_permissions` - صلاحيات الرتب

### 2. نظام الأوامر (Commands System)

**البنية:**
```
commands/
├── stats/      # أوامر الإحصائيات
├── admin/      # أوامر الإدارة
├── archive/    # أوامر الأرشفة
└── config/     # أوامر التكوين
```

**المميزات:**
- تحميل ديناميكي للأوامر
- دعم Slash Commands
- ترجمة الأوامر (عربي/إنجليزي)
- Permissions-based access control

### 3. نظام الأحداث (Events System)

**الملفات:**
- `ready.js` - عند تشغيل البوت
- `voiceStateUpdate.js` - تتبع الصوت
- `guildMemberUpdate.js` - تغييرات الأعضاء
- `channelUpdate.js` - تغييرات القنوات
- `messageCreate.js` - نشاط الرسائل
- `interactionCreate.js` - معالج الأوامر

**آلية العمل:**
1. Discord يرسل حدث
2. Event handler يستلم البيانات
3. حفظ في قاعدة البيانات
4. تسجيل في Console

### 4. نظام المساعدات (Utils)

**الوظائف:**
- `formatDate()` - تنسيق التواريخ
- `formatDuration()` - تنسيق المدة الزمنية
- `getDateRange()` - حساب نطاق التواريخ
- `hasPermission()` - فحص الصلاحيات
- `createBackup()` - إنشاء نسخة احتياطية
- `calculatePercentageChange()` - حساب نسبة التغيير

### 5. نظام الترجمة (i18n)

**الملفات:**
- `locales/ar.js` - الترجمة العربية
- `locales/en.js` - الترجمة الإنجليزية
- `locales/index.js` - نظام الترجمة

**الاستخدام:**
```javascript
import { t } from './locales/index.js';
const text = t('stats_title', { period: 'daily' });
```

## تدفق البيانات (Data Flow)

### تتبع جلسة صوت:

```
1. User joins voice channel
   ↓
2. Discord → voiceStateUpdate event
   ↓
3. Event handler detects join
   ↓
4. Create entry in voice_sessions table
   ↓
5. User leaves voice channel
   ↓
6. Discord → voiceStateUpdate event
   ↓
7. Event handler detects leave
   ↓
8. Calculate duration
   ↓
9. Update voice_sessions entry
```

### عرض إحصائيات:

```
1. User uses /stats-daily command
   ↓
2. interactionCreate event fires
   ↓
3. Command handler executes
   ↓
4. Query database for date range
   ↓
5. Calculate statistics
   ↓
6. Format data in embed
   ↓
7. Send response to Discord
```

## الأمان (Security)

### حماية البيانات:
- قاعدة البيانات محلية (لا تخزين سحابي)
- Token في ملف .env (لا يتم رفعه)
- Permissions على مستوى الأوامر
- صلاحيات على مستوى الرتب

### معالجة الأخطاء:
```javascript
try {
    // Code execution
} catch (error) {
    console.error('Error:', error);
    await interaction.reply({ content: 'حدث خطأ', ephemeral: true });
}
```

### Validation:
- فحص null/undefined
- التحقق من division by zero
- التحقق من صلاحيات المستخدم
- Sanitization للمدخلات

## الأداء (Performance)

### التحسينات:
1. **Database Indexes** - فهرسة الحقول المهمة
2. **WAL Mode** - تحسين الكتابة المتزامنة
3. **Pagination** - تحديد عدد النتائج
4. **Caching** - تخزين مؤقت للبيانات

### معايير الأداء:
- استعلام بسيط: < 10ms
- استعلام معقد: < 100ms
- تحميل أمر: < 200ms
- استجابة embed: < 500ms

## التوسعة (Scalability)

### إضافة أمر جديد:

1. إنشاء ملف في المجلد المناسب:
```javascript
// src/commands/stats/new-command.js
import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('new-command')
        .setDescription('Description'),
    execute: async (interaction) => {
        // Implementation
    }
};
```

2. البوت سيحمله تلقائياً عند إعادة التشغيل

### إضافة جدول جديد:

1. تعريف في `schema.js`:
```javascript
db.exec(`
    CREATE TABLE IF NOT EXISTS new_table (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        // columns...
    )
`);
```

2. إنشاء queries في `queries.js`:
```javascript
export const newTable = {
    create: (params) => { /* ... */ },
    get: (id) => { /* ... */ }
};
```

### إضافة لغة جديدة:

1. إنشاء `locales/lang.js`
2. تصدير الترجمات
3. إضافة في `locales/index.js`

## الصيانة (Maintenance)

### النسخ الاحتياطي التلقائي:
- يعمل كل 24 ساعة افتراضياً
- يمكن تغيير الفترة في `.env`
- يحفظ في `data/backups/`

### تنظيف البيانات القديمة:
```sql
DELETE FROM voice_sessions 
WHERE date < date('now', '-90 days');
```

### مراقبة الأداء:
```bash
# حجم قاعدة البيانات
ls -lh data/database.db

# عدد السجلات
sqlite3 data/database.db "SELECT COUNT(*) FROM voice_sessions;"
```

## التطوير (Development)

### متطلبات:
- Node.js >= 18
- npm >= 9
- SQLite3
- Discord.js v14

### Environment:
```env
NODE_ENV=development
DEBUG=true
```

### Testing:
```bash
# تشغيل مع watch mode
npm run dev

# فحص الأخطاء
node --check src/index.js
```

### Debugging:
```javascript
console.log('Debug:', variable);
console.error('Error:', error);
```

## البنية المستقبلية

### تحسينات مخططة:
- [ ] Web Dashboard
- [ ] API REST endpoint
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Machine learning insights
- [ ] Multi-server support

### قابلية التوسع:
- Microservices architecture
- Redis للتخزين المؤقت
- PostgreSQL للإنتاج
- Load balancing
- Horizontal scaling

## الخلاصة

البوت مصمم بمعمارية نظيفة وقابلة للصيانة مع:
- ✅ فصل واضح للمسؤوليات
- ✅ معالجة قوية للأخطاء
- ✅ أداء محسّن
- ✅ أمان عالي
- ✅ سهولة التوسعة
- ✅ توثيق شامل
