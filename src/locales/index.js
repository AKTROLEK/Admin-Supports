import ar from './ar.js';
import en from './en.js';

const locales = { ar, en };
let currentLocale = 'ar';

export function setLocale(locale) {
    if (locales[locale]) {
        currentLocale = locale;
    }
}

export function t(key, replacements = {}) {
    const locale = locales[currentLocale] || locales.ar;
    let text = locale[key] || key;
    
    // Replace placeholders
    Object.keys(replacements).forEach(placeholder => {
        text = text.replace(`{${placeholder}}`, replacements[placeholder]);
    });
    
    return text;
}

export function getCurrentLocale() {
    return currentLocale;
}
