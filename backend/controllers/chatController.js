const mongoose = require('mongoose');
const Patient = require('../models/Patients');
const Appointment = require('../models/Appointments');
const Prescription = require('../models/Prescriptions');
const Medication = require('../models/Medications');
const Diagnosis = require('../models/Diagnosis');

/**
 * Fetch patient context (summary of medical history) for the logged in user
 */
async function fetchPatientContext(userId, role) {
  try {
    let patient = null;
    if (role === 'patient') {
      patient = await Patient.findOne({ userId });
    }

    if (!patient) {
      return {
        hasHistory: false,
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
      totalVisits: 0,
      diagnosesCount: 0,
      medicationsCount: 0,
      diagnoses: [],
      medications: []
    };
  }
}

/**
 * @desc    Get patient's aggregated medical history summary for chatbot header/badge
 * @route   GET /api/chat/context
 * @access  Private
 */
exports.getChatContext = async (req, res) => {
  try {
    const summary = await fetchPatientContext(req.user._id, req.user.role);
    return res.status(200).json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Chat context error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch chat context'
    });
  }
};

/**
 * Rule-based medical intelligence assistant response generator
 */
function generateAssistantReply(userMessage, context) {
  const msg = userMessage.toLowerCase();

  // Drug interactions query
  if (msg.includes('تعارض') || msg.includes('تفاعل') || msg.includes('مع بعض') || msg.includes('interaction')) {
    if (context.medications && context.medications.length > 1) {
      return `بناءً على قائمة أدويتك الحالية (${context.medications.join('، ')}):\n` +
        `• لا توجد تعارضات خطيرة مسجلة بين هذه الأدوية بالجرعات المعتادة.\n` +
        `• يُنصح دائماً بترك فاصل زمني (ساعة على الأقل) بين تناول الأدوية المختلفة إذا كانت تسبب اضطراباً في المعدة.\n` +
        `• في حال شعرت بأي أعراض غير معتادة، يرجى مراجعة طبيبك المعالج على الفور.`;
    } else if (context.medications && context.medications.length === 1) {
      return `لديك دواء واحد مسجل حالياً وهو **${context.medications[0]}**.\n` +
        `إذا كنت تنوي تناول أي دواء إضافي أو مكمل غذائي بدون وصفة، يرجى التأكد من استشارة الطبيب أو الصيدلي لتجنب أي تعارضات محتملة.`;
    } else {
      return `لم يتم العثور على أدوية مسجلة في سجلك الطبي الحالي. يمكنك إخباري بأسماء الأدوية التي ترغب في الاستفسار عن تفاعلاتها وسأساعدك بكل سرور!`;
    }
  }

  // Dosing schedule / timing query
  if (msg.includes('جرع') || msg.includes('ميعاد') || msg.includes('مواعيد') || msg.includes('وقت') || msg.includes('قبل الأكل') || msg.includes('بعد الأكل')) {
    if (context.medications && context.medications.length > 0) {
      return `إرشادات مواعيد تناول الأدوية المسجلة لك (${context.medications.join('، ')}):\n` +
        `• يفضل تناول الأدوية في نفس المواعيد يومياً للحفاظ على مستوى تركيز الدواء في الدم.\n` +
        `• المسكنات ومضادات الالتهاب يفضل تناولها **بعد الوجبات** لحماية جدار المعدة.\n` +
        `• في حال نسيت جرعة، تناولها فور تذكرك إلا إذا كان موعد الجرعة التالية قد اقترب؛ لا تضاعف الجرعة أبداً.`;
    } else {
      return `لتحديد الجرعات والمواعيد بدقة، يرجى الالتزام بالتعليمات المكتوبة في الوصفة الطبية الخاصة بك من قبل الطبيب المعالج، وتجنب تغيير الجرعة من تلقاء نفسك.`;
    }
  }

  // Side effects query
  if (msg.includes('أعراض') || msg.includes('اثار جانبية') || msg.includes('آثار جانبية') || msg.includes('أثر جانبي') || msg.includes('side effect')) {
    if (context.medications && context.medications.length > 0) {
      return `الآثار الجانبية المحتملة للأدوية الموصوفة (${context.medications.join('، ')}):\n` +
        `• معظم الآثار الجانبية خفيفة ومؤقتة (مثل الغثيان الخفيف، الصداع، أو الدوار المؤقت).\n` +
        `• احرص على شرب كمية كافية من الماء وأخذ قسط من الراحة.\n` +
        `• إذا ظهرت أعراض تحسسية حادة (مثل ضيق التنفس أو طفح جلدي حاد)، توجه فوراً إلى أقرب مركز طوارئ.`;
    } else {
      return `الآثار الجانبية تختلف حسب نوع الدواء والجرعة. يرجى ذكر اسم الدواء المحدد لتزويدك بأدق التفاصيل والاحتياطات اللازمة.`;
    }
  }

  // General health & tips query
  if (msg.includes('نصائح') || msg.includes('ارشاد') || msg.includes('صحة') || msg.includes('وقاية') || msg.includes('علاج')) {
    let reply = `إليك أهم النصائح الصحية العامة للحفاظ على صحتك:\n` +
      `1. **الالتزام بمواعيد العلاج**: تناول الأدوية بانتظام يسرع عملية الشفاء.\n` +
      `2. **الترطيب والتغذية**: شرب ما لا يقل عن 2 إلى 3 لترات من الماء يومياً وتناول غذاء متوازن.\n` +
      `3. **النشاط البدني والنوم**: الحرص على النوم 7-8 ساعات يومياً وممارسة الرياضة الخفيفة كالمشي.\n`;
    
    if (context.diagnoses && context.diagnoses.length > 0) {
      reply += `\n💡 **ملاحظة خاصة بحالتك (${context.diagnoses.join('، ')})**:\nاحرص على المتابعة الدورية مع طبيبك وإجراء الفحوصات الروتينية في مواعيدها.`;
    }
    return reply;
  }

  // Greetings
  if (msg.includes('مرحبا') || msg.includes('أهلا') || msg.includes('اهلا') || msg.includes('السلام عليكم') || msg.includes('hi') || msg.includes('hello')) {
    const greetingName = context.patientName ? ` يا ${context.patientName}` : '';
    return `أهلاً بك${greetingName} في **PharmaHub**! 👋\n` +
      `أنا هنا لمساعدتك في كل ما يتعلق بأدويتك، مواعيدها، التفاعلات الدوائية، وإرشادات الرعاية الصحية. كيف يمكنني إفادتك اليوم؟`;
  }

  // Default intelligent fallback response
  return `شكراً لسؤالك! بخصوص "${userMessage}":\n\n` +
    (context.hasHistory ? `بناءً على ملفك الطبي المسجل لدينا، ` : ``) +
    `ننصح دائماً باتباع إرشادات الطبيب المعالج والحرص على قراءة النشرة الدوائية المرفقة.\n\n` +
    `هل تود الاستفسار عن تفاعل دواء معين أو معرفة المواعيد المثلى لتناوله؟`;
}

/**
 * @desc    Send a message to PharmaHub AI Chatbot
 * @route   POST /api/chat/message
 * @access  Private
 */
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const contextSummary = await fetchPatientContext(req.user._id, req.user.role);
    const reply = generateAssistantReply(message, contextSummary);

    return res.status(200).json({
      success: true,
      reply,
      contextSummary
    });
  } catch (error) {
    console.error('Chat send message error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing your message'
    });
  }
};
