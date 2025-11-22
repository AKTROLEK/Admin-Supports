# دليل المساهمة - Contributing Guide

شكراً لاهتمامك بالمساهمة في مشروع FiveM Admin Statistics Bot! 🎉

## كيفية المساهمة

### 🐛 الإبلاغ عن مشكلة (Bug Report)

إذا وجدت مشكلة:

1. تأكد من أن المشكلة لم يتم الإبلاغ عنها مسبقاً
2. افتح [Issue جديد](https://github.com/AKTROLEK/Admin-Supports/issues/new)
3. استخدم عنواناً واضحاً ووصفياً
4. قدم معلومات مفصلة:
   - خطوات إعادة إنتاج المشكلة
   - السلوك المتوقع
   - السلوك الفعلي
   - لقطات شاشة إن أمكن
   - إصدار Node.js والبوت
   - نظام التشغيل

**مثال:**
```markdown
**المشكلة:** البوت لا يتتبع جلسات الصوت

**خطوات إعادة الإنتاج:**
1. تشغيل البوت
2. الدخول إلى روم صوتي
3. الخروج من الروم
4. استخدام `/stats-daily`

**المتوقع:** عرض وقت الصوت
**الفعلي:** لا يظهر وقت صوت
**إصدار Node.js:** 18.0.0
**نظام التشغيل:** Ubuntu 22.04
```

### 💡 اقتراح ميزة جديدة (Feature Request)

لاقتراح ميزة جديدة:

1. تحقق من أن الميزة غير موجودة
2. افتح [Issue جديد](https://github.com/AKTROLEK/Admin-Supports/issues/new)
3. اشرح الميزة المقترحة بالتفصيل
4. اشرح لماذا هذه الميزة مفيدة
5. أضف أمثلة استخدام

### 🔧 المساهمة بالكود (Pull Request)

#### التحضير

1. **Fork المشروع**
```bash
# على GitHub اضغط Fork
```

2. **استنسخ Fork الخاص بك**
```bash
git clone https://github.com/YOUR_USERNAME/Admin-Supports.git
cd Admin-Supports
```

3. **أنشئ فرع جديد**
```bash
git checkout -b feature/amazing-feature
# أو
git checkout -b fix/bug-fix
```

#### التطوير

1. **اتبع معايير الكود**
   - استخدم ESM imports
   - اتبع تسمية متسقة
   - أضف تعليقات للكود المعقد
   - استخدم async/await للعمليات غير المتزامنة

2. **اختبر تغييراتك**
```bash
# فحص syntax
node --check src/index.js

# تشغيل البوت
npm start

# اختبار الأوامر في Discord
```

3. **التزم بالبنية الحالية**
   - ضع الأوامر في المجلد المناسب
   - استخدم نفس نمط الـ embeds
   - اتبع نفس معالجة الأخطاء

#### الـ Commit

```bash
# إضافة التغييرات
git add .

# Commit مع رسالة واضحة
git commit -m "Add: feature description"
# أو
git commit -m "Fix: bug description"
```

**معايير رسائل الـ Commit:**
- `Add:` للمميزات الجديدة
- `Fix:` لإصلاح الأخطاء
- `Update:` لتحديث مميزات موجودة
- `Remove:` لإزالة ميزة
- `Refactor:` لإعادة هيكلة الكود
- `Docs:` لتحديث التوثيق

#### إرسال الـ Pull Request

1. **Push إلى Fork الخاص بك**
```bash
git push origin feature/amazing-feature
```

2. **افتح Pull Request**
   - اذهب إلى صفحة Fork على GitHub
   - اضغط "New Pull Request"
   - اكتب عنواناً ووصفاً واضحين
   - اشرح التغييرات المقدمة
   - أرفق لقطات شاشة للـ UI changes

3. **انتظر المراجعة**
   - كن مستعداً للتعديلات
   - رد على التعليقات
   - قم بالتحديثات المطلوبة

## معايير الكود

### JavaScript Style

```javascript
// ✅ جيد
export default {
    data: new SlashCommandBuilder()
        .setName('command-name')
        .setDescription('Description'),
    
    execute: async (interaction) => {
        try {
            // Implementation
        } catch (error) {
            console.error('Error:', error);
        }
    }
};

// ❌ سيء
export default{
    data:new SlashCommandBuilder().setName('command-name').setDescription('Description'),execute:async(interaction)=>{/*code*/}
};
```

### التسمية

```javascript
// Variables & Functions - camelCase
const userName = 'John';
function getUserStats() { }

// Constants - UPPER_SNAKE_CASE
const MAX_USERS = 100;
const DEFAULT_COLOR = 0x9b59b6;

// Files - kebab-case
stats-daily.js
user-interactions.js

// Database Tables - snake_case
voice_sessions
admin_notes
```

### التعليقات

```javascript
// ✅ جيد - تعليق مفيد
// Calculate duration in milliseconds
const duration = leaveTime - joinTime;

// ✅ جيد - تعليق توضيحي
/**
 * Get user statistics for a date range
 * @param {string} userId - Discord user ID
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Object} Statistics object
 */
function getUserStats(userId, startDate, endDate) { }

// ❌ سيء - تعليق واضح
// Increment i
i++;
```

### معالجة الأخطاء

```javascript
// ✅ جيد
try {
    const result = await someOperation();
    if (!result) {
        throw new Error('Operation failed');
    }
    return result;
} catch (error) {
    console.error('Error in someFunction:', error);
    throw error;
}

// ❌ سيء
try {
    await someOperation();
} catch (e) {
    // Silent failure
}
```

## بنية المشروع

```
src/
├── commands/         # Discord commands
│   ├── stats/       # Statistics commands
│   ├── admin/       # Admin commands
│   ├── archive/     # Backup commands
│   └── config/      # Configuration commands
├── events/          # Discord event handlers
├── database/        # Database layer
│   ├── schema.js   # Table definitions
│   └── queries.js  # Database queries
├── utils/           # Helper functions
├── locales/         # Translations
└── index.js         # Entry point
```

## الاختبار

### قبل الـ Pull Request

1. ✅ تأكد من عدم وجود أخطاء syntax
2. ✅ اختبر الأوامر الجديدة/المعدلة
3. ✅ تأكد من عدم كسر الأوامر الموجودة
4. ✅ راجع التوثيق إذا لزم الأمر
5. ✅ تأكد من تحديث CHANGELOG.md

### Checklist

- [ ] الكود يتبع معايير المشروع
- [ ] التعليقات واضحة ومفيدة
- [ ] لا توجد أخطاء syntax
- [ ] تم اختبار التغييرات
- [ ] التوثيق محدث
- [ ] رسالة الـ commit واضحة

## الأسئلة؟

إذا كان لديك أي سؤال:

1. راجع [README.md](README.md)
2. راجع [SETUP.md](SETUP.md)
3. افتح [Discussion](https://github.com/AKTROLEK/Admin-Supports/discussions)
4. اسأل في [Issues](https://github.com/AKTROLEK/Admin-Supports/issues)

## الترخيص

بمساهمتك، فإنك توافق على أن تكون مساهماتك مرخصة تحت نفس ترخيص المشروع (MIT License).

---

**شكراً لك على مساهمتك! 🙏**

كل مساهمة، مهما كانت صغيرة، تساعد في تحسين المشروع! 🚀
