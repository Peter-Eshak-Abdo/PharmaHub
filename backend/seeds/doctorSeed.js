const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Doctor = require('../models/Doctor');

const doctors = [
  {
    user: { email: 'dr.ahmed.hassan@clinic.com', password: 'Password123!', role: 'doctor' },
    profile: {
      fullName: 'د. أحمد حسن',
      specialization: 'باطنة',
      education: 'بكالوريوس طب وجراحة — جامعة القاهرة',
      qualifications: 'زمالة الباطنة المصرية، عضو الجمعية المصرية لأمراض الجهاز الهضمي',
      yearsOfExperience: 15,
      bio: 'متخصص في أمراض الجهاز الهضمي والكبد مع خبرة واسعة في التشخيص والعلاج.',
      rating: 4.8,
      consultationFeeSnapshot: 250
    }
  },
  {
    user: { email: 'dr.mona.ali@clinic.com', password: 'Password123!', role: 'doctor' },
    profile: {
      fullName: 'د. منى علي',
      specialization: 'أطفال',
      education: 'بكالوريوس طب — جامعة عين شمس',
      qualifications: 'دكتوراه في طب الأطفال، زمالة أمراض الدم للأطفال',
      yearsOfExperience: 12,
      bio: 'طبيبة أطفال ذات خبرة في رعاية حديثي الولادة وأمراض الدم عند الأطفال.',
      rating: 4.9,
      consultationFeeSnapshot: 200
    }
  },
  {
    user: { email: 'dr.khaled.omar@clinic.com', password: 'Password123!', role: 'doctor' },
    profile: {
      fullName: 'د. خالد عمر',
      specialization: 'قلب',
      education: 'بكالوريوس طب — جامعة الإسكندرية',
      qualifications: 'زمالة القلب الأمريكية (FACC)، دبلوم القسطرة القلبية',
      yearsOfExperience: 20,
      bio: 'استشاري قلب وأوعية دموية متخصص في القسطرة وجراحة القلب التدخلية.',
      rating: 4.7,
      consultationFeeSnapshot: 350
    }
  },
  {
    user: { email: 'dr.sara.mahmoud@clinic.com', password: 'Password123!', role: 'doctor' },
    profile: {
      fullName: 'د. سارة محمود',
      specialization: 'جراحة',
      education: 'بكالوريوس طب — جامعة المنصورة',
      qualifications: 'ماجستير جراحة عامة، زمالة الجراحة التنظيرية',
      yearsOfExperience: 10,
      bio: 'جراحة عامة متخصصة في الجراحة بالمنظار وجراحة السمنة.',
      rating: 4.6,
      consultationFeeSnapshot: 300
    }
  },
  {
    user: { email: 'dr.youssef.ibrahim@clinic.com', password: 'Password123!', role: 'doctor' },
    profile: {
      fullName: 'د. يوسف إبراهيم',
      specialization: 'عيون',
      education: 'بكالوريوس طب — جامعة أسيوط',
      qualifications: 'دكتوراه طب وجراحة عيون، زمالة جراحة الليزك',
      yearsOfExperience: 18,
      bio: 'متخصص في جراحة الليزك وعمليات الماء الأبيض وشبكية العين.',
      rating: 4.8,
      consultationFeeSnapshot: 280
    }
  },
  {
    user: { email: 'dr.nadia.youssef@clinic.com', password: 'Password123!', role: 'doctor' },
    profile: {
      fullName: 'د. نادية يوسف',
      specialization: 'نساء وتوليد',
      education: 'بكالوريوس طب — جامعة طنطا',
      qualifications: 'ماجستير أمراض النساء والتوليد، دبلوم الحقن المجهري',
      yearsOfExperience: 14,
      bio: 'متخصصة في متابعة الحمل الخطر والعقم وتقنيات الإنجاب المساعد.',
      rating: 4.9,
      consultationFeeSnapshot: 260
    }
  },
  {
    user: { email: 'dr.tarek.hussein@clinic.com', password: 'Password123!', role: 'doctor' },
    profile: {
      fullName: 'د. طارق حسين',
      specialization: 'عظام',
      education: 'بكالوريوس طب — جامعة القاهرة',
      qualifications: 'دكتوراه جراحة العظام، زمالة تبديل المفاصل',
      yearsOfExperience: 16,
      bio: 'جراح عظام متخصص في تبديل الركبة والورك والكسور المعقدة.',
      rating: 4.7,
      consultationFeeSnapshot: 320
    }
  },
  {
    user: { email: 'dr.heba.salem@clinic.com', password: 'Password123!', role: 'doctor' },
    profile: {
      fullName: 'د. هبة سالم',
      specialization: 'باطنة',
      education: 'بكالوريوس طب — جامعة الزقازيق',
      qualifications: 'ماجستير الباطنة، دبلوم السكري والغدد الصماء',
      yearsOfExperience: 9,
      bio: 'متخصصة في علاج السكري وأمراض الغدة الدرقية وأمراض الكلى.',
      rating: 4.5,
      consultationFeeSnapshot: 220
    }
  },
  {
    user: { email: 'dr.mostafa.ragab@clinic.com', password: 'Password123!', role: 'doctor' },
    profile: {
      fullName: 'د. مصطفى رجب',
      specialization: 'أطفال',
      education: 'بكالوريوس طب — جامعة بنها',
      qualifications: 'ماجستير طب الأطفال، دبلوم التغذية',
      yearsOfExperience: 7,
      bio: 'طبيب أطفال متخصص في اضطرابات النمو والتغذية عند الرضع والأطفال.',
      rating: 4.4,
      consultationFeeSnapshot: 180
    }
  },
  {
    user: { email: 'dr.dina.fouad@clinic.com', password: 'Password123!', role: 'doctor' },
    profile: {
      fullName: 'د. دينا فؤاد',
      specialization: 'قلب',
      education: 'بكالوريوس طب — جامعة عين شمس',
      qualifications: 'زمالة الإيكو القلبي، دبلوم ضغط الدم',
      yearsOfExperience: 11,
      bio: 'أخصائية قلب متخصصة في الإيكو القلبي وعلاج ضغط الدم وضعف عضلة القلب.',
      rating: 4.6,
      consultationFeeSnapshot: 310
    }
  },
  {
    user: { email: 'dr.ibrahim.mansour@clinic.com', password: 'Password123!', role: 'doctor' },
    profile: {
      fullName: 'د. إبراهيم منصور',
      specialization: 'جراحة',
      education: 'بكالوريوس طب — جامعة الإسماعيلية',
      qualifications: 'دكتوراه الجراحة العامة، زمالة جراحة الأورام',
      yearsOfExperience: 22,
      bio: 'جراح أورام بخبرة واسعة في استئصال أورام الكبد والقولون والبنكرياس.',
      rating: 4.8,
      consultationFeeSnapshot: 400
    }
  },
  {
    user: { email: 'dr.rania.abdel@clinic.com', password: 'Password123!', role: 'doctor' },
    profile: {
      fullName: 'د. رانيا عبد الغني',
      specialization: 'عيون',
      education: 'بكالوريوس طب — جامعة الأزهر',
      qualifications: 'ماجستير عيون، زمالة شبكية العين',
      yearsOfExperience: 13,
      bio: 'متخصصة في أمراض شبكية العين والزرق والإبر الداخلية.',
      rating: 4.7,
      consultationFeeSnapshot: 240
    }
  },
  {
    user: { email: 'dr.walid.nour@clinic.com', password: 'Password123!', role: 'doctor' },
    profile: {
      fullName: 'د. وليد نور',
      specialization: 'نساء وتوليد',
      education: 'بكالوريوس طب — جامعة المنوفية',
      qualifications: 'ماجستير التوليد، زمالة الجراحة التنظيرية النسائية',
      yearsOfExperience: 17,
      bio: 'متخصص في الجراحة التنظيرية النسائية واستئصال الأورام الليفية.',
      rating: 4.5,
      consultationFeeSnapshot: 290
    }
  },
  {
    user: { email: 'dr.amira.kamal@clinic.com', password: 'Password123!', role: 'doctor' },
    profile: {
      fullName: 'د. أميرة كمال',
      specialization: 'عظام',
      education: 'بكالوريوس طب — جامعة سوهاج',
      qualifications: 'ماجستير جراحة العمود الفقري، دبلوم إصابات الملاعب',
      yearsOfExperience: 8,
      bio: 'متخصصة في إصابات الملاعب وجراحة العمود الفقري وعلاج الهشاشة.',
      rating: 4.3,
      consultationFeeSnapshot: 250
    }
  },
  {
    user: { email: 'dr.hassan.zaki@clinic.com', password: 'Password123!', role: 'doctor' },
    profile: {
      fullName: 'د. حسن زكي',
      specialization: 'باطنة',
      education: 'بكالوريوس طب — جامعة أسوان',
      qualifications: 'دكتوراه الباطنة العامة، زمالة أمراض الروماتيزم',
      yearsOfExperience: 19,
      bio: 'استشاري الروماتيزم وأمراض المناعة والتهاب المفاصل.',
      rating: 4.9,
      consultationFeeSnapshot: 300
    }
  },
  {
    user: { email: 'dr.ola.samy@clinic.com', password: 'Password123!', role: 'doctor' },
    profile: {
      fullName: 'د. علا سامي',
      specialization: 'أطفال',
      education: 'بكالوريوس طب — جامعة كفر الشيخ',
      qualifications: 'دكتوراه طب الأطفال، زمالة أمراض الجهاز العصبي للأطفال',
      yearsOfExperience: 15,
      bio: 'متخصصة في اضطرابات الجهاز العصبي والتوحد وصعوبات التعلم عند الأطفال.',
      rating: 4.8,
      consultationFeeSnapshot: 270
    }
  },
  {
    user: { email: 'dr.fady.botros@clinic.com', password: 'Password123!', role: 'doctor' },
    profile: {
      fullName: 'د. فادي بطرس',
      specialization: 'قلب',
      education: 'بكالوريوس طب — جامعة أكتوبر',
      qualifications: 'زمالة أمراض القلب، دبلوم رسم القلب التشخيصي',
      yearsOfExperience: 6,
      bio: 'أخصائي قلب يُركّز على الوقاية من أمراض القلب وإعادة التأهيل القلبي.',
      rating: 4.4,
      consultationFeeSnapshot: 230
    }
  },
  {
    user: { email: 'dr.magda.ali@clinic.com', password: 'Password123!', role: 'doctor' },
    profile: {
      fullName: 'د. مجدة علي',
      specialization: 'جراحة',
      education: 'بكالوريوس طب — جامعة الفيوم',
      qualifications: 'ماجستير جراحة الأورام، دبلوم جراحة الثدي',
      yearsOfExperience: 13,
      bio: 'جراحة متخصصة في أورام الثدي والغدة الدرقية بالمنظار.',
      rating: 4.6,
      consultationFeeSnapshot: 330
    }
  },
  {
    user: { email: 'dr.adel.naguib@clinic.com', password: 'Password123!', role: 'doctor' },
    profile: {
      fullName: 'د. عادل نجيب',
      specialization: 'عيون',
      education: 'بكالوريوس طب — جامعة بورسعيد',
      qualifications: 'دكتوراه جراحة المياه البيضاء، زمالة طب العيون التشخيصي',
      yearsOfExperience: 21,
      bio: 'رائد في جراحة الماء الأبيض بالليزر وزراعة العدسات الإضافية.',
      rating: 4.7,
      consultationFeeSnapshot: 350
    }
  },
  {
    user: { email: 'dr.yasmin.hamdy@clinic.com', password: 'Password123!', role: 'doctor' },
    profile: {
      fullName: 'د. ياسمين حمدي',
      specialization: 'نساء وتوليد',
      education: 'بكالوريوس طب — جامعة دمنهور',
      qualifications: 'ماجستير نساء وتوليد، دبلوم تنظيم الأسرة',
      yearsOfExperience: 10,
      bio: 'متخصصة في صحة المرأة وسرطانات النساء والإجراءات التنظيرية.',
      rating: 4.5,
      consultationFeeSnapshot: 260
    }
  }
];

async function seedDoctors() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in .env file');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    let createdCount = 0;
    let updatedCount = 0;

    for (const docData of doctors) {
      let user = await User.findOne({ email: docData.user.email });
      if (!user) {
        user = new User({
          email: docData.user.email,
          password: docData.user.password,
          role: 'doctor'
        });
        await user.save();
        createdCount++;
      }

      await Doctor.findOneAndUpdate(
        { userId: user._id },
        {
          userId: user._id,
          ...docData.profile
        },
        { upsert: true, new: true }
      );
      updatedCount++;
    }

    console.log(`✅ Seed Completed: Processed ${doctors.length} doctors.`);
    console.log(`Created Users: ${createdCount}, Doctor Profiles Synchronized: ${updatedCount}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding doctors:', error);
    process.exit(1);
  }
}

seedDoctors();
