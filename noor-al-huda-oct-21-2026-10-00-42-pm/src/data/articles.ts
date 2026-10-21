import { Article, ArticleCategory } from '../types';

export const ARTICLE_CATEGORIES: ArticleCategory[] = [
  {
    id: 'fiqh-prayer',
    nameAr: 'فقه الصلاة وأوقاتها',
    nameEn: 'Fiqh of Prayer & Times',
    descriptionAr: 'الأحكام الشرعية لمواقيت الصلاة، السنن الرواتب، وسجود السهو',
    descriptionEn: 'Rulings on prayer times, sunnah prayers, and concentration',
    icon: 'Clock',
  },
  {
    id: 'ramadan-fasting',
    nameAr: 'رمضان وأحكام الصيام',
    nameEn: 'Ramadan & Fasting',
    descriptionAr: 'فضل الشهر الكريم، أحكام الإمساك والإفطار، وسنن الصيام',
    descriptionEn: 'Virtues of the holy month, fasting etiquette, and iftar timings',
    icon: 'Moon',
  },
  {
    id: 'dhikr-virtues',
    nameAr: 'فضائل الأذكار والأدعية',
    nameEn: 'Virtues of Dhikr & Duas',
    descriptionAr: 'الأذكار المأثورة الصحيحة عن النبي ﷺ وأثرها في طمأنينة القلب',
    descriptionEn: 'Authentic supplications from the Sunnah and spiritual tranquility',
    icon: 'Heart',
  },
  {
    id: 'qibla-mosque',
    nameAr: 'القبلة وآداب المساجد',
    nameEn: 'Qibla & Mosque Etiquette',
    descriptionAr: 'تحري القبلة، عمارة بيوت الله، وفضل صلاة الجماعة',
    descriptionEn: 'Determining the Qibla, congregational prayer, and mosque manners',
    icon: 'Compass',
  },
];

export const ARTICLES: Article[] = [
  {
    id: 'understanding-prayer-times',
    slug: 'understanding-prayer-times-astronomically',
    categoryId: 'fiqh-prayer',
    titleAr: 'كيف تُحدد مواقيت الصلاة فلكياً وشرعياً؟',
    titleEn: 'How Are Prayer Times Calculated Astronomically and Legally?',
    readTimeMinutes: 5,
    authorAr: 'هيئة التحرير الشرعية والعلمية',
    authorEn: 'Shariah & Astronomical Research Board',
    publishedDate: '15 ربيع الأول 1448 هـ',
    excerptAr: 'بيان الضوابط الشرعية المعتمدة لحساب أوقات الصلوات الخمس وفق حركة الشمس والزوايا الفلكية المعتمدة لدى دور الإفتاء العالمية.',
    excerptEn: 'An explanation of the Shariah standards for computing the five daily prayer times based on solar motion and astronomical twilight angles.',
    contentAr: `
### الأصل الشرعي لمواقيت الصلاة
حدد القرآن الكريم مواقيت الصلاة في أوقات معلومة، كما في قوله تعالى: ﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا﴾ [النساء: 103]. 
وقد فصّلها رسول الله ﷺ في حديث جبريل عليه السلام المشهور وحديث عبد الله بن عمرو في صحيح مسلم:
- **وقت الفجر:** يبدأ من طلوع الفجر الصادق (وهو البياض المستطير المعترض في الأفق) حتى طلوع الشمس. ويُحسب فلكياً عندما تصبح الشمس تحت الأفق بزاوية تتراوح بين 18° إلى 19.5° وفق المعايير الإقليمية.
- **وقت الظهر:** يبدأ من زوال الشمس عن وسط السماء وميلها نحو الغرب، وينتهي إذا صار ظل كل شيء مثله سوى فيء الزوال.
- **وقت العصر:** يدخل إذا صار ظل كل شيء مثله (وهو قول الجمهور من الشافعية والمالكية والحنابلة)، وعند الحنفية إذا صار ظل كل شيء مثليه.
- **وقت المغرب:** يدخل بغروب كامل قرص الشمس تحت الأفق الحقيقي.
- **وقت العشاء:** يدخل بمغيب الشفق الأحمر، ويستمر إلى نصف الليل اختياراً.

### الجمع بين الحساب الفلكي الدقيق والرؤية الشرعية
إن الحسابات الفلكية الحديثة لا تناقض النصوص الشرعية، بل هي أدوات منضبطة لحساب موقع الشمس بدقة بالغة حتى أجزاء الثانية، وتراعي خطوط العرض والارتفاع عن سطح البحر والانكسار الضوئي للغلاف الجوي.
    `,
    contentEn: `
### The Islamic Foundation of Prayer Times
The Holy Quran stipulates in Surah An-Nisa (4:103): "Indeed, prayer has been decreed upon the believers a decree of specified times." The specific boundaries were demonstrated by the Prophet Muhammad (peace be upon him):
- **Fajr (Dawn):** Begins at true dawn (when a horizontal white thread of light spreads across the eastern horizon) and ends at sunrise. Astronomically, this corresponds to a solar depression angle between 18° and 19.5°.
- **Dhuhr (Midday):** Begins immediately after the sun passes its zenith (meridian) and begins its decline westward.
- **Asr (Afternoon):** Begins when the shadow of an object equals its original height plus the noon shadow (majority view: Shafi'i, Maliki, Hanbali), or double its length (Hanafi juristic school).
- **Maghrib (Sunset):** Begins the instant the solar disc has completely dipped beneath the horizon.
- **Isha (Nightfall):** Begins when the red twilight disappears from the sky, extending until the middle of the night.
    `,
    sources: [
      'صحيح مسلم، كتاب المساجد ومواضع الصلاة، باب أوقات الصلوات الخمس (حديث رقم 612)',
      'تفسير ابن كثير، سورة النساء آية 103',
      'قرارات مجمع الفقه الإسلامي الدولي بشأن أوقات الصلوات وحساباتها الفلكية',
    ],
  },
  {
    id: 'etiquette-of-dua-and-supplication',
    slug: 'etiquette-of-dua-and-supplication',
    categoryId: 'dhikr-virtues',
    titleAr: 'آداب الدعاء وأسباب الإجابة في هدي النبي ﷺ',
    titleEn: 'The Manners of Supplication (Dua) and Causes of Acceptance',
    readTimeMinutes: 4,
    authorAr: 'قسم الدراسات والسنّة النبوية',
    authorEn: 'Prophetic Studies & Sunnah Department',
    publishedDate: '10 رجب 1448 هـ',
    excerptAr: 'كيف يتقرب العبد إلى ربه بالدعاء الصادق، وما هي أفضل أوقات الإجابة بين الأذان والإقامة وفي الثلث الأخير من الليل.',
    excerptEn: 'How the believer approaches Allah with sincere supplication, and the peak times of divine acceptance between Adhan, Iqamah, and the last third of the night.',
    contentAr: `
### مكانة الدعاء في الإسلام
قال النبي ﷺ: «الدُّعَاءُ هُوَ الْعِبَادَةُ» (رواه الترمذي وصححه الألباني). والدعاء عنوان الافتقار إلى الله تعالى واليقين بقدرته ورحمته.

### أهم آداب الدعاء المستجابة:
1. **الإخلاص واليقين بالإجابة:** أن يدعو بقلب حاضر موقن بأن الله سميع قريب مجيب.
2. **البدء بحمد الله والثناء عليه والصلاة على النبي ﷺ:** فإن ذلك مفتاح القبول.
3. **استقبال القبلة ورفع اليدين:** من سنن الدعاء المستحبة التي تظهر التذلل والافتقار.
4. **تحري أوقات الإجابة الفاضلة:**
   - بين الأذان والإقامة: «الدُّعَاءُ لَا يُرَدُّ بَيْنَ الْأَذَانِ وَالْإِقَامَةِ».
   - في السجود: «أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ، فَأَكْثِرُوا الدُّعَاءَ».
   - الثلث الأخير من الليل: حين يتنزل ربنا تبارك وتعالى تنزلاً يليق بجلاله قائلاً: «مَنْ يَدْعُونِي فَأَسْتَجِيبَ لَهُ».
   - ساعة الجمعة المباركة في آخر نهار يوم الجمعة.
    `,
    contentEn: `
### The Noble Station of Dua
The Prophet (peace be upon him) declared: "Supplication is the essence of worship" (Sunan at-Tirmidhi). 

### Essential Manners for Answered Prayers:
1. **Sincerity and Firm Conviction:** Supplicate with an attentive heart, confident in Allah's boundless mercy.
2. **Praising Allah and Sending Blessings on the Prophet:** Opening with Tahmeed and Salawat is the key to acceptance.
3. **Facing the Qibla and Raising the Hands:** A proven sunnah demonstrating humility and reliance.
4. **Seeking Auspicious Times:**
   - Between the Adhan and Iqamah: "A supplication between the call to prayer and the second call is never rejected."
   - In Sujood (Prostration): "The nearest a servant comes to his Lord is while prostrating, so supplicate abundantly."
   - The Last Third of the Night: When our Lord descends in majesty, asking: "Who calls upon Me so that I may answer him?"
    `,
    sources: [
      'جامع الترمذي، أبواب الدعوات (رقم 3372)',
      'صحيح مسلم، باب ما يقال في الركوع والسجود (رقم 482)',
      'رياض الصالحين للإمام النووي، كتاب الدعوات',
    ],
  },
  {
    id: 'ramadan-preparation-and-rulings',
    slug: 'ramadan-preparation-and-rulings',
    categoryId: 'ramadan-fasting',
    titleAr: 'دليل المسلم العملي لاستقبال شهر رمضان المبارك',
    titleEn: 'A Practical Guide to Welcoming the Blessed Month of Ramadan',
    readTimeMinutes: 6,
    authorAr: 'لجنة الفتوى والتوعية الدينية',
    authorEn: 'Islamic Guidance & Education Bureau',
    publishedDate: '1 شعبان 1448 هـ',
    excerptAr: 'خطوات عملية لتنظيم الورد القرآني، ضبط وقت الإمساك والسحور، وخطة ختم القرآن الكريم بكل يسر وسكينة.',
    excerptEn: 'Actionable steps for Quranic scheduling, accurate Suhoor and Iftar management, and pacing a peaceful Quran Khatmah.',
    contentAr: `
### فضائل شهر الصيام
شهر رمضان هو شهر القرآن والرحمة والعتق من النيران، قال الله تعالى: ﴿شَهْرُ رَمَضَانَ الَّذِي أُنْزِلَ فِيهِ الْقُرْآنُ هُدًى لِلنَّاسِ وَبَيِّنَاتٍ مِنَ الْهُدَىٰ وَالْفُرْقَانِ﴾ [البقرة: 185].

### خطة ختم القرآن في رمضان (الختمة الهادئة)
يحتوي المصحف الشريف على 604 صفحات:
- **ختمة واحدة في الشهر:** قراءة 20 صفحة يومياً (ما يعادل 4 صفحات دبر كل صلاة مكتوبة من الصلوات الخمس).
- **ختمتان في الشهر:** قراءة 40 صفحة يومياً (ما يعادل 8 صفحات دبر كل صلاة مكتوبة).

### سنة السحور والإفطار
- **تأخير السحور:** قال ﷺ: «تَسَحَّرُوا فَإِنَّ فِي السَّحُورِ بَرَكَةً» (متفق عليه). والسنة تأخيره إلى قبيل الفجر الصادق.
- **تعجيل الفطر:** قال ﷺ: «لَا يَزَالُ النَّاسُ بِخَيْرٍ مَا عَجَّلُوا الْفِطْرَ» (متفق عليه)، وذلك بمجرد تحقق غروب قرص الشمس.
    `,
    contentEn: `
### Virtues of the Month of Fasting
Ramadan is the month of the Quran, divine mercy, and spiritual elevation. Allah states in Surah Al-Baqarah (2:185): "The month of Ramadan in which was revealed the Quran, a guidance for the people and clear proofs of guidance and criterion."

### A Sustainable Khatmah Plan
The standard Mus'haf comprises 604 pages:
- **One Complete Khatmah:** Read 20 pages per day (divided effortlessly into 4 pages after each of the 5 daily prayers).
- **Two Khatmahs:** Read 40 pages per day (8 pages after each prayer).

### Prophetic Sunnah of Suhoor and Iftar
- **Delaying Suhoor:** The Prophet advised: "Take Suhoor, for indeed in Suhoor there is blessing" (Bukhari & Muslim).
- **Hasting Iftar:** "People will remain in goodness as long as they hasten the breaking of the fast upon sunset."
    `,
    sources: [
      'صحيح البخاري، كتاب الصوم، باب بركة السحور (حديث رقم 1923)',
      'صحيح مسلم، كتاب الصيام، باب فضل السحور (حديث رقم 1095)',
      'مغني المحتاج في شرح المنهاج، كتاب الصيام',
    ],
  },
  {
    id: 'rules-and-history-of-the-qibla',
    slug: 'rules-and-history-of-the-qibla',
    categoryId: 'qibla-mosque',
    titleAr: 'تحويل القبلة: دلالاتها الإيمانية وحساب سمتها الدقيق',
    titleEn: 'The Turning of the Qibla: Spiritual Significance and True Bearing',
    readTimeMinutes: 4,
    authorAr: 'فريق التاريخ والفلك الإسلامي',
    authorEn: 'Islamic History & Astronomy Team',
    publishedDate: '20 جمادى الآخرة 1448 هـ',
    excerptAr: 'قصة تحويل القبلة من بيت المقدس إلى الكعبة المشرفة في مكة المكرمة، وكيف يحسب المسلم اتجاه القبلة في أي بقعة من الأرض.',
    excerptEn: 'The historical turning of the Qibla from Jerusalem to the Holy Kaaba in Makkah, and modern geometric determination across any coordinate.',
    contentAr: `
### التحول التاريخي نحو البيت الحرام
كان النبي ﷺ يصلي نحو بيت المقدس ستة عشر أو سبعة عشر شهراً بعد الهجرة إلى المدينة المنورة، وكان يقلب وجهه في السماء رجاء أن يوجهه الله نحو قبلة إبراهيم وإسماعيل عليهما السلام، حتى نزل قوله تعالى:
﴿قَدْ نَرَىٰ تَقَلُّبَ وَجْهِكَ فِي السَّمَاءِ ۖ فَلَنُوَلِّيَنَّكَ قِبْلَةً تَرْضَاهَا ۚ فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ ۚ وَحَيْثُ مَا كُنْتُمْ فَوَلُّوا وُجُوهَكُمْ شَطْرَهُ﴾ [البقرة: 144].

### حكم استقبال القبلة للمصلي
- **المعاين للكعبة في المسجد الحرام:** يجب عليه التوجه إلى عين الكعبة بدقة.
- **البعيد عن الكعبة:** فرضه التوجه إلى جهتها وسمتها، لقول النبي ﷺ لأهل المدينة: «مَا بَيْنَ الْمَشْرِقِ وَالْمَغْرِبِ قِبْلَةٌ» (رواه الترمذي).
- ويُحدد السمت رياضياً عبر أقصر قوس من دائرة عظمى (Great-Circle Bearing) تربط بين موقع المصلي وإحداثيات الكعبة المشرفة (21.4225° ش، 39.8262° ق).
    `,
    contentEn: `
### The Divine Command to Turn
For 16 or 17 months following the Hijrah to Madinah, the believers faced Jerusalem (Al-Quds). The Prophet's longing was answered in Surah Al-Baqarah (2:144): "We have certainly seen the turning of your face toward the heaven, and We will surely turn you to a qibla with which you will be pleased. So turn your face toward al-Masjid al-Haram."

### Juristic Requirements
- **Those physically facing the Kaaba:** Must face the exact physical structure.
- **Those distant from Makkah:** The obligation is to face the general direction (azimuth), as the Prophet remarked: "Whatever is between the east and the west is a Qibla" for those facing north/south.
- Today, exact azimuth is determined using spherical trigonometry along the great circle route connecting the user's GPS coordinates to the Kaaba at (21.4225° N, 39.8262° E).
    `,
    sources: [
      'صحيح البخاري، كتاب الصلاة، باب التوجه نحو القبلة حيث كان (حديث رقم 399)',
      'سنن الترمذي، أبواب الصلاة، ما جاء أن ما بين المشرق والمغرب قبلة (حديث رقم 342)',
      'المجموع شرح المهذب للإمام النووي، باب استقبال القبلة',
    ],
  },
];
