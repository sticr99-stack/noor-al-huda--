import React, { useState } from 'react';
import { Language } from '../types';
import { HelpCircle, Mail, Send, CheckCircle2, ChevronDown } from 'lucide-react';

interface FAQAndContactProps {
  lang: Language;
}

export const FAQAndContact: React.FC<FAQAndContactProps> = ({ lang }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isAr = lang === 'ar';

  const faqs = [
    {
      qAr: 'كيف تختلف طرق حساب مواقيت الصلاة بين الهيئات الإسلامية؟',
      qEn: 'How do prayer calculation methods differ between Islamic authorities?',
      aAr: 'تختلف الطرق أساساً في تحديد زاوية انخفاض الشمس تحت الأفق لصلاتي الفجر والعشاء. مثلاً، تعتمد جامعة أم القرى زاوية 18.5° للفجر ووقت ثابت (90 دقيقة بعد المغرب) للعشاء، بينما تعتمد رابطة العالم الإسلامي 18° للفجر و17° للعشاء، والهيئة المصرية 19.5° للفجر و17.5° للعشاء. يمكنك ضبط الهيئة المناسبة لبلدك من إعدادات التطبيق.',
      aEn: 'The variation lies primarily in the sun\'s depression angle below the horizon for Fajr and Isha. For example, Umm Al-Qura uses 18.5° for Fajr and a fixed 90 minutes after Maghrib for Isha, whereas the Muslim World League uses 18°/17°, and Egyptian General Authority uses 19.5°/17.5°. You can customize your authority in the settings.',
    },
    {
      qAr: 'ما هو الفرق بين مذهب الجمهور والمذهب الحنفي في صلاة العصر؟',
      qEn: 'What is the juristic difference between the Standard school and Hanafi for Asr?',
      aAr: 'يرى جمهور الفقهاء (المالكية والشافعية والحنابلة) أن وقت العصر يدخل إذا صار ظل الشيء مثله بعد فيء الزوال. ويرى الإمام أبو حنيفة أن وقت العصر يدخل إذا صار ظل الشيء مثليه، وهو ما يجعل وقت العصر متأخراً بنحو 45 إلى 60 دقيقة في المذهب الحنفي.',
      aEn: 'According to the majority of scholars (Maliki, Shafi\'i, Hanbali), Asr enters when the shadow of an object equals its height plus noon shadow. In the Hanafi school, Asr enters when the shadow reaches twice the object\'s height, which typically falls 45 to 60 minutes later.',
    },
    {
      qAr: 'كيف يتم حساب مواقيت الصلاة في المناطق ذات خطوط العرض العليا (مثل شمال أوروبا)؟',
      qEn: 'How are prayer times resolved in high-latitude regions (e.g. Northern Europe)?',
      aAr: 'في بعض فترات الصيف بشمال أوروبا، قد لا تغيب الشمس بالكامل أو لا يصل الشفق إلى زاوية الفجر المعتادة. في هذه الحالات يُطبق مبدأ "نصف الليل" أو "نسبة السبع" أو حساب الزوايا النسبية تقديراً للأوقات وفق الفتاوى المعتمدة من المجامع الفقهية.',
      aEn: 'During high summer in northern regions, astronomical twilight may persist throughout the night. In such situations, juristic rules like Middle of the Night or 1/7th proportion are applied to estimate Fajr and Isha in accordance with international Fiqh council resolutions.',
    },
    {
      qAr: 'ما مدى دقة بوصلة القبلة وكيف يمكن معايرتها؟',
      qEn: 'How accurate is the Qibla compass and how should I calibrate it?',
      aAr: 'تعتمد بوصلة التطبيق على معادلة الدائرة العظمى الكروية لحساب السمت بدقة رياضية بالغة حتى أجزاء الدرجة. للمعايرة: احرص على وضع الهاتف في وضع أفقي مستوٍ بعيداً عن أغطية الهواتف المغناطيسية أو المعادن، وقم بتدوير الهاتف في الهواء على شكل رقم 8.',
      aEn: 'The compass calculates true azimuth using spherical trigonometry along the great circle arc to the Kaaba. For best accuracy, place your phone flat horizontally away from magnetic phone cases and electronic interference, rotating it in a figure-8 motion if needed.',
    },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 1500);
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-sky-100 dark:border-stone-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
      {/* FAQ Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-sky-100 dark:border-stone-800">
          <HelpCircle className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            {isAr ? 'الأسئلة الشائعة والأحكام الفلكية' : 'Frequently Asked Questions & Astronomical Rulings'}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-sky-100 dark:border-stone-800 bg-white dark:bg-stone-800/30 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full text-start p-4 flex items-center justify-between gap-4 font-semibold text-sm text-stone-900 dark:text-stone-100 hover:text-sky-700 transition-colors"
                >
                  <span>{isAr ? faq.qAr : faq.qEn}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-sky-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-stone-600 dark:text-stone-300 leading-relaxed border-t border-sky-100 dark:border-stone-700/60 bg-sky-50/20 dark:bg-transparent">
                    {isAr ? faq.aAr : faq.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact & Inquiries Form */}
      <div className="pt-6 border-t border-sky-100 dark:border-stone-800 space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            {isAr ? 'التواصل والاستفسارات الشرعية والتقنية' : 'Contact & Inquiries'}
          </h3>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {isAr
            ? 'نسعد بملاحظاتكم حول دقة المواقيت في مدينتكم واقتراحاتكم لتطوير التطبيق.'
            : 'We welcome your feedback on local prayer accuracy and feature suggestions.'}
        </p>

        {isSubmitted ? (
          <div className="p-4 bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800 rounded-2xl flex items-center gap-3 text-sky-900 dark:text-sky-200 text-xs shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" />
            <span>
              {isAr
                ? 'جزاكم الله خيراً، تم إرسال رسالتكم بنجاح وسيتواصل معكم فريق العمل.'
                : 'Thank you for reaching out. Your feedback has been received.'}
            </span>
          </div>
        ) : (
          <form onSubmit={handleContactSubmit} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  {isAr ? 'الاسم الكريم:' : 'Your Name:'}
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder={isAr ? 'عبد الله' : 'Your name'}
                  className="w-full text-xs py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-sky-100 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  {isAr ? 'البريد الإلكتروني:' : 'Email Address:'}
                </label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs py-2 px-3 bg-stone-50 dark:bg-stone-800 border border-sky-100 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {isAr ? 'نص الرسالة أو الاستفسار:' : 'Message or Inquiry:'}
              </label>
              <textarea
                required
                rows={3}
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder={isAr ? 'اكتب ملاحظتك أو استفسارك هنا...' : 'Write your feedback or question...'}
                className="w-full text-xs p-3 bg-stone-50 dark:bg-stone-800 border border-sky-100 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 py-2.5 px-5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isAr ? 'إرسال الرسالة' : 'Send Message'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
