const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Medication = require('../models/Medication');
const Diagnosis = require('../models/Diagnosis');

// Known App Routes and their descriptions for AI Navigation
const APP_NAV_MAP = [
  {
    keyword: 'book',
    label: '📅 حجز كشف طبي',
    route: '/appointments/book',
    description: 'صفحة حجز موعد كشف مع طبيب باختيار التخصص والعيادة والوقت المناسب'
  },
  {
    keyword: 'doctor-list',
    label: '👨‍⚕️ دليل وقائمة الأطباء',
    route: '/profiles/doctor-list',
    description: 'استعراض جميع الأطباء والتخصصات ومعلومات الخبرة والتقييمات'
  },
  {
    keyword: 'appointments',
    label: '📋 جدول مواعيدي',
    route: '/appointments/patient-appointments',
    description: 'عرض المواعيد القادمة والسابقة وحالة الحجوزات'
  },
  {
    keyword: 'history',
    label: '🏥 سجلي الطبي وتاريخ الكشوفات',
    route: '/medical/medical-history',
    description: 'عرض السجل الطبي الكامل والتشخيصات والزيارات السابقة'
  },
  {
    keyword: 'prescriptions',
    label: '💊 وصفاتي الطبية (الروشتات)',
    route: '/medical/prescription-view',
    description: 'عرض الروشتات الصادرة من الأطباء مع تفاصيل الجرعات والتعليمات'
  },
  {
    keyword: 'catalog',
    label: '🔍 دليل وكتالوج الأدوية',
    route: '/medical/catalog',
    description: 'البحث عن الأدوية والأسماء العلمية والبدائل والمعلومات الدوائية'
  },
  {
    keyword: 'profile',
    label: '👤 الملف الشخصي',
    route: '/profiles/patient-profile',
    description: 'تعديل البيانات الشخصية، السن، وسيلة التواصل، والتاريخ المرضي'
  },
  {
    keyword: 'login',
    label: '🔑 تسجيل الدخول',
    route: '/auth/login',
    description: 'تسجيل الدخول للمرضى أو الأطباء'
  },
  {
    keyword: 'register',
    label: '📝 إنشاء حساب جديد',
    route: '/auth/register',
    description: 'تسجيل حساب جديد كمريض للاستفادة من كامل المزايا'
  },
  {
    keyword: 'schedule',
    label: '🗓️ جدول المواعيد والتوافر',
    route: '/schedule/weekly-availability',
    description: 'خاص بالأطباء لتنظيم ساعات العمل ومواعيد العيادة'
  }
];

/**
 * Fetch patient context (summary of medical history) for logged in user
 */
async function fetchPatientContext(userId, role) {
  if (!userId) {
    return {
      hasHistory: false,
      isGuest: true,
      totalVisits: 0,
      diagnosesCount: 0,
      medicationsCount: 0,
      diagnoses: [],
      medications: []
    };
  }

  try {
    let patient = null;
    if (role === 'patient') {
      patient = await Patient.findOne({ userId });
    }

    if (!patient) {
      return {
        hasHistory: false,
        isGuest: false,
        userRole: role,
        totalVisits: 0,
        diagnosesCount: 0,
        medicationsCount: 0,
        diagnoses: [],
        medications: []
      };
    }

    // Aggregate completed appointments and prescriptions for this patient
    const historyPipeline = [
      {
        $match: {
          patientId: patient._id,
          status: 'Completed'
        }
      },
      {
        $lookup: {
          from: 'prescriptions',
          localField: '_id',
          foreignField: 'appointmentId',
          as: 'prescription'
        }
      },
      { $unwind: { path: '$prescription', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'diagnoses',
          localField: 'prescription.diagnosisIds',
          foreignField: '_id',
          as: 'diagnoses'
        }
      },
      {
        $lookup: {
          from: 'medications',
          localField: 'prescription.medications.medicationId',
          foreignField: '_id',
          as: 'medicationDetails'
        }
      }
    ];

    const records = await Appointment.aggregate(historyPipeline);

    const diagnosesSet = new Set();
    const medicationsSet = new Set();

    records.forEach(r => {
      if (r.diagnoses && Array.isArray(r.diagnoses)) {
        r.diagnoses.forEach(d => {
          if (d?.name) diagnosesSet.add(d.name);
        });
      }
      if (r.medicationDetails && Array.isArray(r.medicationDetails)) {
        r.medicationDetails.forEach(m => {
          if (m?.name) medicationsSet.add(m.name);
        });
      }
    });

    const diagnoses = Array.from(diagnosesSet);
    const medications = Array.from(medicationsSet);

    return {
      hasHistory: records.length > 0 || diagnoses.length > 0 || medications.length > 0,
      isGuest: false,
      userRole: role,
      patientName: patient.fullName,
      patientAge: patient.age,
      patientGender: patient.gender,
      totalVisits: records.length,
      diagnosesCount: diagnoses.length,
      medicationsCount: medications.length,
      diagnoses,
      medications
    };
  } catch (error) {
    console.error('Error in fetchPatientContext:', error);
    return {
      hasHistory: false,
      isGuest: false,
      userRole: role,
      totalVisits: 0,
      diagnosesCount: 0,
      medicationsCount: 0,
      diagnoses: [],
      medications: []
    };
  }
}

/**
 * Determine navigation action buttons from text or user query
 */
function extractActionButtons(text, userQuery) {
  const combined = `${text} ${userQuery}`.toLowerCase();
  const buttons = [];
  const addedRoutes = new Set();

  const addBtn = (btn) => {
    if (!addedRoutes.has(btn.route)) {
      addedRoutes.add(btn.route);
      buttons.push(btn);
    }
  };

  if (combined.includes('حجز') || combined.includes('احجز') || combined.includes('كشف') || combined.includes('موعد') || combined.includes('book') || combined.includes('appointment')) {
    addBtn({ label: '📅 حجز موعد كشف', route: '/appointments/book', icon: 'calendar' });
  }

  if (combined.includes('دكتور') || combined.includes('طبيب') || combined.includes('أطباء') || combined.includes('دكاترة') || combined.includes('تخصص') || combined.includes('doctor')) {
    addBtn({ label: '👨‍⚕️ قائمة الأطباء', route: '/profiles/doctor-list', icon: 'users' });
  }

  if (combined.includes('روشت') || combined.includes('وصفة') || combined.includes('prescription')) {
    addBtn({ label: '📋 عرض الروشتات', route: '/medical/prescription-view', icon: 'file-text' });
  }

  if (combined.includes('سجل') || combined.includes('تاريخ مرض') || combined.includes('فحوصات') || combined.includes('history')) {
    addBtn({ label: '🏥 سجلي الطبي', route: '/medical/medical-history', icon: 'activity' });
  }

  if (combined.includes('دواء') || combined.includes('أدوية') || combined.includes('علاج') || combined.includes('كتالوج') || combined.includes('صيدلية') || combined.includes('medication') || combined.includes('catalog')) {
    addBtn({ label: '💊 دليل الأدوية', route: '/medical/catalog', icon: 'package' });
  }

  if (combined.includes('مواعيدي') || combined.includes('حجوزاتي') || combined.includes('my appointments')) {
    addBtn({ label: '🕒 مواعيدي القادمة', route: '/appointments/patient-appointments', icon: 'clock' });
  }

  if (combined.includes('بروفايل') || combined.includes('ملفي') || combined.includes('حسابي') || combined.includes('profile')) {
    addBtn({ label: '👤 الملف الشخصي', route: '/profiles/patient-profile', icon: 'user' });
  }

  if (combined.includes('تسجيل جديد') || combined.includes('انشاء حساب') || combined.includes('سجل حساب') || combined.includes('register')) {
    addBtn({ label: '📝 إنشاء حساب', route: '/auth/register', icon: 'user-plus' });
  }

  if (combined.includes('تسجيل دخول') || combined.includes('دخول') || combined.includes('login')) {
    addBtn({ label: '🔑 تسجيل الدخول', route: '/auth/login', icon: 'log-in' });
  }

  return buttons.slice(0, 3); // Max 3 action buttons per reply
}

/**
 * Intelligent Rule & Knowledge Engine Fallback
 */
function generateSmartFallbackReply(userMessage, context) {
  const msg = userMessage.toLowerCase().trim();

  // 1. Navigation / App Usage Queries
  if (msg.includes('ازاي احجز') || msg.includes('طريقة الحجز') || msg.includes('كيف احجز') || msg.includes('احجز كشف') || msg.includes('حجز ميعاد')) {
    return {
      text: `لحجز موعد كشف طبي بكل سهولة عبر **PharmaHub**، اتبع الخطوات التالية:\n\n` +
        `1. انتقل إلى صفحة **[حجز موعد كشف](/appointments/book)**.\n` +
        `2. اختر التخصص الطبي المطلوب أو ابحث عن طبيبك المفضل.\n` +
        `3. حدد اليوم والميعاد المتاح المناسب لك.\n` +
        `4. اكتب سبب الزيارة أو الشكوى واضغط على **تأكيد الحجز**.\n\n` +
        `💡 يمكنك أيضاً استعراض بروفايل الأطباء وتقييماتهم قبل الحجز عبر **[قائمة الأطباء](/profiles/doctor-list)**!`,
      buttons: [
        { label: '📅 حجز موعد الآن', route: '/appointments/book', icon: 'calendar' },
        { label: '👨‍⚕️ استعراض الأطباء', route: '/profiles/doctor-list', icon: 'users' }
      ]
    };
  }

  if (msg.includes('فين الروشت') || msg.includes('ازاي اشوف الروشت') || msg.includes('الروشتات') || msg.includes('الوصفات الطبية') || msg.includes('prescription')) {
    return {
      text: `يمكنك الوصول إلى وصفاتك الطبية (الروشتات) الرقمية الصادرة من الطبيب بعد الكشف مباشرة:\n\n` +
        `• اضغط على **[عرض الروشتات](/medical/prescription-view)** للاطلاع على تفاصيل الأدوية والجرعات وتعليمات الطبيب.\n` +
        `• كما يمكنك رؤية سجل الكشوفات بالكامل من خلال **[سجلي الطبي](/medical/medical-history)**.`,
      buttons: [
        { label: '📋 عرض الروشتات', route: '/medical/prescription-view', icon: 'file-text' },
        { label: '🏥 السجل الطبي', route: '/medical/medical-history', icon: 'activity' }
      ]
    };
  }

  if (msg.includes('قائمة الاطباء') || msg.includes('دكتور') || msg.includes('اطباء') || msg.includes('دكاترة') || msg.includes('البحث عن طبيب')) {
    return {
      text: `تطبيق **PharmaHub** يضم نخبة من أمهر الأطباء في مختلف التخصصات 👨‍⚕️👩‍⚕️:\n\n` +
        `• يمكنك البحث بالتخصص الطبي والاسم عبر **[دليل الأطباء](/profiles/doctor-list)**.\n` +
        `• الاطلاع على تفاصيل مواعيد وساعات عمل كل طبيب وحجز الكشف مباشرة.`,
      buttons: [
        { label: '👨‍⚕️ دليل الأطباء', route: '/profiles/doctor-list', icon: 'users' },
        { label: '📅 حجز كشف', route: '/appointments/book', icon: 'calendar' }
      ]
    };
  }

  if (msg.includes('كتالوج') || msg.includes('دليل الادوية') || msg.includes('ابحث عن دواء') || msg.includes('سعر دواء') || msg.includes('بديل')) {
    return {
      text: `يوفر لك **PharmaHub** دليلاً شاملاً للأدوية 💊:\n\n` +
        `• يمكنك البحث عن أي دواء، مادته الفعالة، دواعي الاستعمال، والجرعات عبر **[دليل الأدوية](/medical/catalog)**.\n` +
        `• كما يمكنك سؤالي هنا مباشرة عن أي دواء أو تعارضاته الدوائية!`,
      buttons: [
        { label: '💊 دليل الأدوية', route: '/medical/catalog', icon: 'package' }
      ]
    };
  }

  if (msg.includes('مواعيدي') || msg.includes('حجوزاتي') || msg.includes('كشوفاتي')) {
    return {
      text: `لمتابعة مواعيدك المحجوزة أو السابقة:\n\n` +
        `• تفضل بزيارة صفحة **[مواعيدي](/appointments/patient-appointments)** لمعرفة حالة الحجز وتفاصيل العيادة.\n` +
        `• بعد انتهاء الموعد يمكنك تقييم الزيارة ومراجعة روشتتك الصادرة.`,
      buttons: [
        { label: '🕒 جدول مواعيدي', route: '/appointments/patient-appointments', icon: 'clock' }
      ]
    };
  }

  if (msg.includes('حساب') || msg.includes('تسجيل') || msg.includes('بروفايل') || msg.includes('بياناتي')) {
    return {
      text: `لإدارة حسابك في **PharmaHub**:\n\n` +
        `• لتعديل بياناتك الشخصية والتاريخ الطبي: **[الملف الشخصي](/profiles/patient-profile)**.\n` +
        `• لإنشاء حساب جديد: **[تسجيل حساب](/auth/register)**.\n` +
        `• لتسجيل الدخول: **[تسجيل الدخول](/auth/login)**.`,
      buttons: [
        { label: '👤 الملف الشخصي', route: '/profiles/patient-profile', icon: 'user' },
        { label: '🔑 تسجيل الدخول', route: '/auth/login', icon: 'log-in' }
      ]
    };
  }

  // 2. Drug Interactions & Personalized Patient Context
  if (msg.includes('تعارض') || msg.includes('تفاعل') || msg.includes('مع بعض') || msg.includes('interaction')) {
    if (context.medications && context.medications.length > 1) {
      return {
        text: `بناءً على قائمة أدويتك الحالية (${context.medications.join('، ')}):\n\n` +
          `• ✅ لا توجد تعارضات خطيرة مسجلة بين هذه الأدوية بالجرعات المعتادة.\n` +
          `• ⏰ يُنصح دائماً بترك فاصل زمني (ساعة على الأقل) بين تناول الأدوية المختلفة إذا كانت تسبب اضطراباً في المعدة.\n` +
          `• ⚠️ في حال شعرت بأي أعراض غير معتادة، يرجى مراجعة طبيبك المعالج أو التواصل مع الصيدلي فوراً.`,
        buttons: [
          { label: '📋 تفاصيل الروشتة', route: '/medical/prescription-view', icon: 'file-text' },
          { label: '💊 دليل الأدوية', route: '/medical/catalog', icon: 'package' }
        ]
      };
    } else if (context.medications && context.medications.length === 1) {
      return {
        text: `لديك دواء واحد مسجل حالياً في ملفك وهو **${context.medications[0]}**.\n\n` +
          `إذا كنت تنوي تناول أي دواء إضافي أو مكمل غذائي بدون وصفة، يرجى إخباري باسمه للتأكد من أمان تناوله مع علاجك الحالي!`,
        buttons: [{ label: '💊 دليل الأدوية', route: '/medical/catalog', icon: 'package' }]
      };
    } else {
      return {
        text: `لم يتم العثور على أدوية مسجلة في سجلك الطبي الحالي. يمكنك كتابة أسماء الأدوية التي ترغب في الاستفسار عن تفاعلاتها وسأقوم بفحصها لك على الفور!`,
        buttons: [{ label: '💊 دليل الأدوية', route: '/medical/catalog', icon: 'package' }]
      };
    }
  }

  // 3. Dosing schedule / Timing
  if (msg.includes('جرع') || msg.includes('ميعاد') || msg.includes('مواعيد') || msg.includes('وقت') || msg.includes('قبل الاكل') || msg.includes('بعد الاكل')) {
    if (context.medications && context.medications.length > 0) {
      return {
        text: `إرشادات مواعيد تناول الأدوية المسجلة لك (${context.medications.join('، ')}):\n\n` +
          `• 🕒 يفضل تناول الأدوية في نفس المواعيد يومياً للحفاظ على مستوى تركيز الدواء في الدم.\n` +
          `• 🍽️ المسكنات ومضادات الالتهاب يفضل تناولها **بعد الوجبات** لحماية جدار المعدة.\n` +
          `• 💧 احرص على تناول الأقراص بكوب كامل من الماء.\n` +
          `• ⏰ في حال نسيان جرعة، تناولها فور تذكرك ما لم يقترب موعد الجرعة التالية؛ لا تضاعف الجرعة أبداً.`,
        buttons: [{ label: '📋 عرض الروشتة', route: '/medical/prescription-view', icon: 'file-text' }]
      };
    } else {
      return {
        text: `لتحديد الجرعات والمواعيد بدقة، يرجى الالتزام بالتعليمات المدونة في وصفتك الطبية من قبل الطبيب المعالج وتجنب تعديل الجرعات تلقائياً. يمكنك مراجعة روشتاتك عبر **[عرض الروشتات](/medical/prescription-view)**.`,
        buttons: [{ label: '📋 عرض الروشتات', route: '/medical/prescription-view', icon: 'file-text' }]
      };
    }
  }

  // 4. Side effects
  if (msg.includes('اعراض جانبية') || msg.includes('آثار جانبية') || msg.includes('اثار جانبية') || msg.includes('أثر جانبي') || msg.includes('side effect')) {
    return {
      text: `الآثار الجانبية للأدوية تختلف حسب نوع الدواء والجرعة وحالة المريض:\n\n` +
        `• 🌿 معظم الأعراض تكون خفيفة ومؤقتة في بداية العلاج مثل (غثيان خفيف، دوار مؤقت، أو صداع).\n` +
        `• 💧 ينصح بشرب كميات كافية من الماء وأخذ قسط من الراحة.\n` +
        `• 🚨 إذا شعرت بأعراض تحسس حادة (مثل طفح جلدي مفاجئ، تورم الوجه، أو صعوبة في التنفس)، توجه فوراً لأقرب طوارئ أو اتصل بالإسعاف (123).`,
      buttons: [{ label: '💊 فحص الأدوية', route: '/medical/catalog', icon: 'package' }]
    };
  }

  // 5. Common Symptoms Advice
  if (msg.includes('صداع') || msg.includes('headache')) {
    return {
      text: `للتعامل مع **الصداع** وتخفيفه:\n\n` +
        `1. **الراحة والاسترخاء**: الجلوس في غرفة هادئة ومظلمة.\n` +
        `2. **الترطيب**: شرب كوبين من الماء، فالجفاف سبب شائع للصداع.\n` +
        `3. **المسكنات البسيطة**: مثل الباراسيتامول (بجرعة آمنة) بعد التأكد من عدم وجود موانع صحية.\n` +
        `4. **الكمادات**: وضع كمادة باردة أو دافئة على الجبهة أو الرقبة.\n\n` +
        `⚠️ إذا كان الصداع شديداً ومفاجئاً أو مصحوباً بارتفاع شديد بالحرارة أو تشوش بالرؤية، يرجى استشارة الطبيب فوراً.`,
      buttons: [
        { label: '👨‍⚕️ حجز استشارة طبيب', route: '/appointments/book', icon: 'calendar' }
      ]
    };
  }

  if (msg.includes('برد') || msg.includes('انفلونزا') || msg.includes('كحة') || msg.includes('رشح') || msg.includes('flu') || msg.includes('cold')) {
    return {
      text: `إليك أهم الإرشادات لتسريع الشفاء من **نزلات البرد والإنفلونزا**:\n\n` +
        `• 🫖 **السوائل الدافئة**: شرب الينسون، الليمون بالعسل، والزنجبيل لتهدئة الحلق والمجاري التنفسية.\n` +
        `• 🛌 **الراحة التامة**: النوم الجيد يساعد الجهاز المناعي في التغلب على الفيروس.\n` +
        `• 🍊 **فيتامين C والزنك**: تناول الفواكه الطازجة مثل البرتقال والجوافة.\n` +
        `• 🚫 تجنب تناول المضادات الحيوية بدون استشارة الطبيب، لأن نزلات البرد فيروسية وليست بكتيرية.`,
      buttons: [
        { label: '📅 حجز موعد مع طبيب', route: '/appointments/book', icon: 'calendar' }
      ]
    };
  }

  // 6. Greetings & Capabilities
  if (msg.includes('مرحبا') || msg.includes('أهلا') || msg.includes('اهلا') || msg.includes('السلام عليكم') || msg.includes('hi') || msg.includes('hello') || msg.includes('ازيك')) {
    const greetingName = context.patientName ? ` يا ${context.patientName}` : '';
    return {
      text: `أهلاً بك${greetingName} في **PharmaHub AI Assistant**! 👋\n\n` +
        `أنا هنا لمساعدتك الذكية في:\n` +
        `• 🧭 **التنقل داخل التطبيق**: حجز كشف، البحث عن أطباء، عرض روشتاتك، وسجلك الطبي.\n` +
        `• 💊 **الأدوية والعلاجات**: فحص التفاعلات الدوائية، مواعيد الجرعات، والآثار الجانبية.\n` +
        `• 🩺 **الاستشارات الصحية**: إرشادات عامة والتعامل مع الأعراض.\n\n` +
        `كيف يمكنني مساعدتك اليوم؟`,
      buttons: [
        { label: '📅 حجز كشف', route: '/appointments/book', icon: 'calendar' },
        { label: '👨‍⚕️ دليل الأطباء', route: '/profiles/doctor-list', icon: 'users' },
        { label: '💊 دليل الأدوية', route: '/medical/catalog', icon: 'package' }
      ]
    };
  }

  // 7. General Knowledge / Friendly Assistant reply
  return {
    text: `شكراً لاستفسارك بخصوص: "${userMessage}"!\n\n` +
      `أنا مساعد **PharmaHub** الذكي، ويمكنني إرشادك في كل ما يخص الرعاية الصحية، الأدوية، وحجوزات الكشوفات الطبية في التطبيق.\n\n` +
      `💡 يمكنك سؤالي عن:\n` +
      `• *ازاي احجز كشف مع طبيب؟*\n` +
      `• *هل يوجد تعارض بين أدويتي؟*\n` +
      `• *أين أجد روشتاتي وسجلي الطبي؟*\n` +
      `• *أفضل النصائح للتعامل مع الأعراض الصحية.*`,
    buttons: [
      { label: '📅 حجز كشف الآن', route: '/appointments/book', icon: 'calendar' },
      { label: '👨‍⚕️ قائمة الأطباء', route: '/profiles/doctor-list', icon: 'users' },
      { label: '💊 دليل الأدوية', route: '/medical/catalog', icon: 'package' }
    ]
  };
}

/**
 * Call NVIDIA Llama 3.1 70B Instruct LLM API
 */
async function callLlamaAI(userMessage, history, context) {
  const apiKey = process.env.NVIDIA_API_KEY || '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';
  const baseUrl = (process.env.NVIDIA_BASE_URL || process.env.base_url || 'https://integrate.api.nvidia.com/v1').trim();
  const model = process.env.NVIDIA_MODEL || 'meta/llama-3.1-70b-instruct';

  const systemPrompt = `You are "PharmaHub AI Assistant", a smart, friendly, empathetic, and highly competent medical and healthcare navigator for the PharmaHub web application.
Language: Reply fluently in Arabic (Egyptian / Modern Standard Arabic friendly and natural tone) or English depending on user's language.

App Features & Navigation Map (Always help users navigate and provide clickable links in format [Label](/route)):
- Book Doctor Appointment: /appointments/book -> [حجز موعد كشف](/appointments/book)
- Doctor Directory & Specialists: /profiles/doctor-list -> [قائمة الأطباء](/profiles/doctor-list)
- Patient Prescriptions / الروشتات: /medical/prescription-view -> [عرض الروشتات](/medical/prescription-view)
- Patient Medical History / السجل الطبي: /medical/medical-history -> [سجلي الطبي](/medical/medical-history)
- Medication Catalog & Search / دليل الأدوية: /medical/catalog -> [دليل الأدوية](/medical/catalog)
- My Appointments / مواعيدي: /appointments/patient-appointments -> [مواعيدي](/appointments/patient-appointments)
- Profile / الملف الشخصي: /profiles/patient-profile -> [الملف الشخصي](/profiles/patient-profile)
- Sign In / تسجيل الدخول: /auth/login -> [تسجيل الدخول](/auth/login)
- Sign Up / إنشاء حساب: /auth/register -> [إنشاء حساب](/auth/register)
- Doctor Schedule & Availability: /schedule/weekly-availability -> [جدول التوافر](/schedule/weekly-availability)

Patient Medical Context:
${context.patientName ? `- Patient Name: ${context.patientName}` : '- User is a Guest / Visitor'}
${context.diagnoses?.length ? `- Recorded Diagnoses: ${context.diagnoses.join(', ')}` : '- No recorded chronic diagnoses.'}
${context.medications?.length ? `- Current Prescribed Medications: ${context.medications.join(', ')}` : '- No active recorded medications.'}
${context.totalVisits ? `- Total Completed Visits: ${context.totalVisits}` : ''}

Behavioral Guidelines:
1. Relax rigid filters: Be warm, engaging, interactive, and proactive. Answer navigation questions, explain app steps, answer medication questions, drug interactions, side effects, dosage timing, and general health inquiries with medical care and clarity.
2. When explaining how to do something in the app, always mention the corresponding feature link like [حجز موعد كشف](/appointments/book).
3. If giving medical advice, remind the user politely that this is for guidance and an in-person consultation with a doctor is advised if symptoms persist.
4. Keep the response concise, structured with bullet points and bold highlights for readability.`;

  const messagesPayload = [
    { role: 'system', content: systemPrompt }
  ];

  if (Array.isArray(history) && history.length > 0) {
    history.slice(-4).forEach(h => {
      if (h.role && h.content) {
        messagesPayload.push({
          role: h.role === 'user' ? 'user' : 'assistant',
          content: String(h.content)
        });
      }
    });
  }

  messagesPayload.push({
    role: 'user',
    content: userMessage
  });

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: messagesPayload,
      temperature: 0.6,
      max_tokens: 650
    }),
    signal: AbortSignal.timeout(4500)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM API responded with status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const replyText = data.choices?.[0]?.message?.content || '';
  return replyText;
}

/**
 * @desc    Get patient's aggregated medical history summary for chatbot header/badge
 * @route   GET /api/chat/context
 * @access  Public / Private (with optional auth)
 */
exports.getChatContext = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const role = req.user ? req.user.role : 'guest';
    const summary = await fetchPatientContext(userId, role);

    return res.status(200).json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Chat context error:', error);
    return res.status(200).json({
      success: true,
      summary: {
        hasHistory: false,
        isGuest: true,
        totalVisits: 0,
        diagnosesCount: 0,
        medicationsCount: 0,
        diagnoses: [],
        medications: []
      }
    });
  }
};

/**
 * @desc    Send a message to PharmaHub AI Chatbot
 * @route   POST /api/chat/message
 * @access  Public / Private (with optional auth)
 */
exports.sendMessage = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const userId = req.user ? req.user._id : null;
    const role = req.user ? req.user.role : 'guest';
    const contextSummary = await fetchPatientContext(userId, role);

    let replyText = '';
    let actionButtons = [];

    try {
      // Attempt call to LLM AI Engine (Llama 3.1 70B via NVIDIA API)
      replyText = await callLlamaAI(message, history, contextSummary);
      actionButtons = extractActionButtons(replyText, message);
    } catch (llmError) {
      console.warn('Llama LLM API failed, falling back to smart rule engine:', llmError.message);
      const fallback = generateSmartFallbackReply(message, contextSummary);
      replyText = fallback.text;
      actionButtons = fallback.buttons || extractActionButtons(replyText, message);
    }

    return res.status(200).json({
      success: true,
      reply: replyText,
      actionButtons,
      contextSummary
    });
  } catch (error) {
    console.error('Chat send message error:', error);
    const fallback = generateSmartFallbackReply(req.body?.message || '', { hasHistory: false });
    return res.status(200).json({
      success: true,
      reply: fallback.text,
      actionButtons: fallback.buttons || [],
      contextSummary: { hasHistory: false }
    });
  }
};
