const admin = require('firebase-admin');

// 1. قراءة المفتاح السري من بيئة جيت هاب
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// 2. تسجيل الدخول للداتا بيز بصلاحيات الأدمن
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function deleteExpiredQuizzes() {
  console.log("Starting cleanup process...");
  const now = admin.firestore.Timestamp.now();

  try {
    // 3. البحث عن الكويزات اللي وقتها أقدم من اللحظة دي
    const snapshot = await db.collection('quizzes').where('expireAt', '<', now).get();

    if (snapshot.empty) {
      console.log('✅ No expired quizzes found. Database is clean.');
      return;
    }

    // 4. حذف الكويزات المنتهية (باستخدام Batch لسرعة الأداء)
    const batch = db.batch();
    let count = 0;

    snapshot.forEach(doc => {
      batch.delete(doc.ref);
      count++;
    });

    await batch.commit();
    console.log(`✅ Successfully deleted ${count} expired quizzes!`);

  } catch (error) {
    console.error('❌ Error deleting quizzes:', error);
    process.exit(1); // إيقاف السكريبت في حالة الخطأ
  }
}

deleteExpiredQuizzes();
