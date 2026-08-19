const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Medication = require('../models/Medication');

const medications = [
  // ========= قلب وضغط (Cardiology) =========
  { name: 'أتينولول 50مج', genericName: 'Atenolol', type: 'خافض للضغط' },
  { name: 'أملوديبين 5مج', genericName: 'Amlodipine', type: 'خافض للضغط' },
  { name: 'ليزينوبريل 10مج', genericName: 'Lisinopril', type: 'خافض للضغط' },
  { name: 'لوسارتان 50مج', genericName: 'Losartan', type: 'خافض للضغط' },
  { name: 'هيدروكلوروثيازيد 25مج', genericName: 'Hydrochlorothiazide', type: 'مدر للبول' },
  { name: 'فيروسيمايد 40مج', genericName: 'Furosemide', type: 'مدر للبول' },
  { name: 'وارفارين 5مج', genericName: 'Warfarin', type: 'أخرى' },
  { name: 'أسبرين 100مج', genericName: 'Aspirin', type: 'مسكن' },
  { name: 'كلوبيدوجريل 75مج', genericName: 'Clopidogrel', type: 'أخرى' },
  { name: 'أتورفاستاتين 20مج', genericName: 'Atorvastatin', type: 'ستاتين' },
  { name: 'روسوفاستاتين 10مج', genericName: 'Rosuvastatin', type: 'ستاتين' },
  { name: 'سيمفاستاتين 20مج', genericName: 'Simvastatin', type: 'ستاتين' },
  { name: 'نيتروجليسرين 0.5مج', genericName: 'Nitroglycerin', type: 'أخرى' },
  { name: 'إيزوسوربيد مونونيترات 40مج', genericName: 'Isosorbide Mononitrate', type: 'أخرى' },
  { name: 'ديجوكسين 0.25مج', genericName: 'Digoxin', type: 'أخرى' },
  { name: 'أميودارون 200مج', genericName: 'Amiodarone', type: 'أخرى' },
  { name: 'بيسوبرولول 5مج', genericName: 'Bisoprolol', type: 'خافض للضغط' },
  { name: 'فالسارتان 80مج', genericName: 'Valsartan', type: 'خافض للضغط' },
  { name: 'كانديسارتان 8مج', genericName: 'Candesartan', type: 'خافض للضغط' },
  { name: 'سبيرونولاكتون 25مج', genericName: 'Spironolactone', type: 'مدر للبول' },

  // ========= سكري (Endocrinology) =========
  { name: 'ميتفورمين 500مج', genericName: 'Metformin', type: 'مضاد سكر' },
  { name: 'ميتفورمين 1000مج', genericName: 'Metformin XR', type: 'مضاد سكر' },
  { name: 'جليبينكلاميد 5مج', genericName: 'Glibenclamide', type: 'مضاد سكر' },
  { name: 'جليكلازيد 60مج', genericName: 'Gliclazide MR', type: 'مضاد سكر' },
  { name: 'سيتاجليبتين 100مج', genericName: 'Sitagliptin', type: 'مضاد سكر' },
  { name: 'إمباجليفلوزين 10مج', genericName: 'Empagliflozin', type: 'مضاد سكر' },
  { name: 'داباجليفلوزين 10مج', genericName: 'Dapagliflozin', type: 'مضاد سكر' },
  { name: 'فيلداجليبتين 50مج', genericName: 'Vildagliptin', type: 'مضاد سكر' },
  { name: 'أنسولين نوفومكس 30', genericName: 'Insulin Novomix 30', type: 'مضاد سكر' },
  { name: 'أنسولين لانتوس', genericName: 'Insulin Glargine', type: 'مضاد سكر' },
  { name: 'ليفوثيروكسين 50ميكروجرام', genericName: 'Levothyroxine', type: 'أخرى' },
  { name: 'ليفوثيروكسين 100ميكروجرام', genericName: 'Levothyroxine 100', type: 'أخرى' },
  { name: 'كاربامازول 5مج', genericName: 'Carbimazole', type: 'أخرى' },

  // ========= مضادات حيوية وميكروبات (Infectious Diseases) =========
  { name: 'أموكسيسيلين 500مج', genericName: 'Amoxicillin', type: 'مضاد حيوي' },
  { name: 'أوجمنتين 1جم', genericName: 'Amoxicillin/Clavulanic Acid', type: 'مضاد حيوي' },
  { name: 'أزيثروميسين 500مج', genericName: 'Azithromycin', type: 'مضاد حيوي' },
  { name: 'كلاريثروميسين 500مج', genericName: 'Clarithromycin', type: 'مضاد حيوي' },
  { name: 'سيبروفلوكساسين 500مج', genericName: 'Ciprofloxacin', type: 'مضاد حيوي' },
  { name: 'ليفوفلوكساسين 500مج', genericName: 'Levofloxacin', type: 'مضاد حيوي' },
  { name: 'ميترونيدازول 500مج', genericName: 'Metronidazole', type: 'مضاد حيوي' },
  { name: 'دوكسيسيكلين 100مج', genericName: 'Doxycycline', type: 'مضاد حيوي' },
  { name: 'سيفالكسين 500مج', genericName: 'Cefalexin', type: 'مضاد حيوي' },
  { name: 'سيفيكسيم 400مج', genericName: 'Cefixime', type: 'مضاد حيوي' },
  { name: 'كليندامايسين 300مج', genericName: 'Clindamycin', type: 'مضاد حيوي' },
  { name: 'سفترياكسون 1جم حقن', genericName: 'Ceftriaxone', type: 'مضاد حيوي' },
  { name: 'أمبيسيلين 500مج', genericName: 'Ampicillin', type: 'مضاد حيوي' },
  { name: 'كوتريموكسازول 480مج', genericName: 'Co-trimoxazole', type: 'مضاد حيوي' },
  { name: 'نيتروفورانتوين 100مج', genericName: 'Nitrofurantoin', type: 'مضاد حيوي' },

  // ========= مسكنات ومضادات التهاب (Pain & NSAIDs) =========
  { name: 'باراسيتامول 500مج', genericName: 'Paracetamol', type: 'مسكن' },
  { name: 'باراسيتامول 1000مج', genericName: 'Paracetamol Extra', type: 'مسكن' },
  { name: 'إيبوبروفين 400مج', genericName: 'Ibuprofen', type: 'مضاد التهاب لا ستيرويدي' },
  { name: 'إيبوبروفين 600مج', genericName: 'Ibuprofen 600', type: 'مضاد التهاب لا ستيرويدي' },
  { name: 'ديكلوفيناك صوديوم 50مج', genericName: 'Diclofenac Sodium', type: 'مضاد التهاب لا ستيرويدي' },
  { name: 'ديكلوفيناك بوتاسيوم 50مج', genericName: 'Diclofenac Potassium', type: 'مضاد التهاب لا ستيرويدي' },
  { name: 'ديكلوفيناك جل 1%', genericName: 'Diclofenac Gel', type: 'مضاد التهاب لا ستيرويدي' },
  { name: 'نابروكسين 500مج', genericName: 'Naproxen', type: 'مضاد التهاب لا ستيرويدي' },
  { name: 'كيتوبروفين 100مج', genericName: 'Ketoprofen', type: 'مضاد التهاب لا ستيرويدي' },
  { name: 'سيلكوكسيب 200مج', genericName: 'Celecoxib', type: 'مضاد التهاب لا ستيرويدي' },
  { name: 'ميلوكسيكام 15مج', genericName: 'Meloxicam', type: 'مضاد التهاب لا ستيرويدي' },
  { name: 'ترامادول 50مج', genericName: 'Tramadol', type: 'مسكن' },
  { name: 'بريجابالين 75مج', genericName: 'Pregabalin', type: 'مسكن' },
  { name: 'جابابنتين 300مج', genericName: 'Gabapentin', type: 'مسكن' },

  // ========= معدة وجهاز هضمي (Gastroenterology) =========
  { name: 'أوميبرازول 20مج', genericName: 'Omeprazole', type: 'أخرى' },
  { name: 'بانتوبرازول 40مج', genericName: 'Pantoprazole', type: 'أخرى' },
  { name: 'إيزوميبرازول 40مج', genericName: 'Esomeprazole', type: 'أخرى' },
  { name: 'لانسوبرازول 30مج', genericName: 'Lansoprazole', type: 'أخرى' },
  { name: 'رانيتيدين 150مج', genericName: 'Ranitidine', type: 'أخرى' },
  { name: 'فاموتيدين 40مج', genericName: 'Famotidine', type: 'أخرى' },
  { name: 'ميتوكلوبراميد 10مج', genericName: 'Metoclopramide', type: 'أخرى' },
  { name: 'دومبيريدون 10مج', genericName: 'Domperidone', type: 'أخرى' },
  { name: 'أوندانسيترون 4مج', genericName: 'Ondansetron', type: 'أخرى' },
  { name: 'لوبيراميد 2مج', genericName: 'Loperamide', type: 'أخرى' },
  { name: 'لاكتولوز شراب', genericName: 'Lactulose', type: 'أخرى' },
  { name: 'بيساكوديل 5مج', genericName: 'Bisacodyl', type: 'أخرى' },
  { name: 'ميبفرين 135مج', genericName: 'Mebeverine', type: 'أخرى' },

  // ========= الجهاز التنفسي والحساسية (Respiratory & Allergy) =========
  { name: 'سالبوتامول بخاخ', genericName: 'Salbutamol Inhaler', type: 'موسع قصبات' },
  { name: 'فلوتيكازون بخاخ', genericName: 'Fluticasone Inhaler', type: 'أخرى' },
  { name: 'بوديسونيد بخاخ', genericName: 'Budesonide Inhaler', type: 'أخرى' },
  { name: 'مونتيلوكاست 10مج', genericName: 'Montelukast', type: 'موسع قصبات' },
  { name: 'سيتريزين 10مج', genericName: 'Cetirizine', type: 'مضاد هيستامين' },
  { name: 'لوراتادين 10مج', genericName: 'Loratadine', type: 'مضاد هيستامين' },
  { name: 'فيكسوفينادين 180مج', genericName: 'Fexofenadine', type: 'مضاد هيستامين' },
  { name: 'ليفوسيتريزين 5مج', genericName: 'Levocetirizine', type: 'مضاد هيستامين' },
  { name: 'ديكساميثازون 4مج حقن', genericName: 'Dexamethasone', type: 'أخرى' },
  { name: 'بريدنيزولون 5مج', genericName: 'Prednisolone', type: 'أخرى' },
  { name: 'أسيتيل سيستايين 600مج فوار', genericName: 'Acetylcysteine', type: 'موسع قصبات' },

  // ========= الجهاز العصبي والنفسي (CNS) =========
  { name: 'فلوكسيتين 20مج', genericName: 'Fluoxetine', type: 'مضاد اكتئاب' },
  { name: 'سيرترالين 50مج', genericName: 'Sertraline', type: 'مضاد اكتئاب' },
  { name: 'إسيتالوبرام 10مج', genericName: 'Escitalopram', type: 'مضاد اكتئاب' },
  { name: 'باروكستين 20مج', genericName: 'Paroxetine', type: 'مضاد اكتئاب' },
  { name: 'أميتريبتيلين 25مج', genericName: 'Amitriptyline', type: 'مضاد اكتئاب' },
  { name: 'ألبرازولام 0.5مج', genericName: 'Alprazolam', type: 'أخرى' },
  { name: 'ديازيبام 5مج', genericName: 'Diazepam', type: 'أخرى' },
  { name: 'كاربامازيبين 200مج', genericName: 'Carbamazepine', type: 'أخرى' },
  { name: 'ليفيتيراسيتام 500مج', genericName: 'Levetiracetam', type: 'أخرى' },
  { name: 'أولانزابين 10مج', genericName: 'Olanzapine', type: 'أخرى' },

  // ========= مضادات الفطريات والفيروسات والجلدية (Antifungal & Antiviral) =========
  { name: 'فلوكونازول 150مج', genericName: 'Fluconazole', type: 'مضاد فطريات' },
  { name: 'إيتراكونازول 100مج', genericName: 'Itraconazole', type: 'مضاد فطريات' },
  { name: 'كلوتريمازول كريم 1%', genericName: 'Clotrimazole Cream', type: 'مضاد فطريات' },
  { name: 'ميكونازول جل فموي', genericName: 'Miconazole Oral Gel', type: 'مضاد فطريات' },
  { name: 'أسيكلوفير 400مج', genericName: 'Acyclovir', type: 'مضاد فيروسات' },
  { name: 'فالاسيكلوفير 500مج', genericName: 'Valaciclovir', type: 'مضاد فيروسات' },
  { name: 'هيدروكورتيزون كريم 1%', genericName: 'Hydrocortisone Cream', type: 'أخرى' },
  { name: 'بيتاميثازون مرهم 0.1%', genericName: 'Betamethasone Ointment', type: 'أخرى' }
];

async function seedMedications() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in .env file');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    let added = 0;
    let updated = 0;

    for (const med of medications) {
      const res = await Medication.findOneAndUpdate(
        { name: med.name },
        med,
        { upsert: true, new: true }
      );
      if (res) {
        added++;
      }
    }

    console.log(`✅ Medications Seed Completed: Processed ${medications.length} medications.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding medications:', error);
    process.exit(1);
  }
}

seedMedications();
