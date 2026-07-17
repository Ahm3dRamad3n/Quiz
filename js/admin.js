import { apiFetch, auth } from "./shared.js";

// DOM Elements
const authStatus = document.getElementById("auth-status");
const adminContent = document.getElementById("admin-content");
const accessDenied = document.getElementById("access-denied");
const accessDeniedMsg = accessDenied.querySelector("p");

const actionConfirmModal = document.getElementById("action-confirm-modal");
const confirmTitle = document.getElementById("confirm-title");
const confirmMessage = document.getElementById("confirm-message");
const btnCancelAction = document.getElementById("btn-cancel-action");
const btnConfirmAction = document.getElementById("btn-confirm-action");
const confirmIconBg = document.getElementById("confirm-icon-bg");
const confirmIcon = document.getElementById("confirm-icon");

const warningModal = document.getElementById("warning-modal");
const btnCancelWarning = document.getElementById("btn-cancel-warning");
const btnAgreeWarning = document.getElementById("btn-agree-warning");

const bansTableBody = document.getElementById("bans-table-body");
const tabCurrently = document.getElementById("tab-currently");
const tabAll = document.getElementById("tab-all");
const btnRefresh = document.getElementById("btn-refresh");
const activeBansCount = document.getElementById("active-bans-count");
const searchFilterInput = document.getElementById("search-filter");

let currentTab = "currently";
let currentUser = null;
let allFetchedData = []; // متغير لتخزين الداتا عشان الفلتر يشتغل عليها بدون ما يكلم السيرفر كل حرف

// 1. نظام التحقق الصارم
auth.onAuthStateChanged((user) => {
  if (!user) {
    authStatus.className =
      "text-sm font-medium px-3 py-1.5 rounded-full bg-red-900/30 text-red-400 border border-red-500/30";
    authStatus.innerHTML = `<i class="fa-solid fa-lock mr-2"></i> غير مسجل`;

    accessDeniedMsg.innerText =
      "يجب عليك تسجيل الدخول أولاً للتحقق من هويتك وصلاحياتك.";
    adminContent.classList.add("hidden");
    accessDenied.classList.remove("hidden");
    return;
  }

  currentUser = user;
  warningModal.classList.remove("hidden");
});

btnCancelWarning.addEventListener("click", () => {
  window.location.href = "index.html";
});

btnAgreeWarning.addEventListener("click", async () => {
  warningModal.classList.add("hidden");

  authStatus.className =
    "text-sm font-medium px-3 py-1.5 rounded-full bg-yellow-900/30 text-yellow-400 border border-yellow-500/30";
  authStatus.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> جاري التحقق من الصلاحيات...`;

  try {
    const res = await apiFetch("/admin/bans/currently", { method: "GET" });

    if (res.ok) {
      allFetchedData = await res.json();

      authStatus.className =
        "text-sm font-medium px-3 py-1.5 rounded-full bg-green-900/30 text-green-400 border border-green-500/30";
      authStatus.innerHTML = `<i class="fa-solid fa-user-shield mr-2"></i> ${currentUser.displayName || "مدير النظام"}`;

      accessDenied.classList.add("hidden");
      adminContent.classList.remove("hidden");

      renderTable(allFetchedData);
      activeBansCount.innerText = allFetchedData.length;
    } else {
      handleErrorAuth(res);
    }
  } catch (error) {
    accessDeniedMsg.innerText =
      "تعذر الاتصال بالسيرفر. يرجى التحقق من اتصال الإنترنت.";
    adminContent.classList.add("hidden");
    accessDenied.classList.remove("hidden");
  }
});

// 2. التحكم في التبويبات
tabCurrently.addEventListener("click", () => {
  currentTab = "currently";
  updateTabStyles(tabCurrently, tabAll);
  fetchBansData();
});

tabAll.addEventListener("click", () => {
  currentTab = "all";
  updateTabStyles(tabAll, tabCurrently);
  fetchBansData();
});

btnRefresh.addEventListener("click", () => {
  searchFilterInput.value = ""; // تفريغ الفلتر عند التحديث
  fetchBansData();
});

function updateTabStyles(active, inactive) {
  active.classList.add("active", "bg-gray-700", "text-white");
  active.classList.remove("text-gray-400");
  inactive.classList.remove("active", "bg-gray-700", "text-white");
  inactive.classList.add("text-gray-400");
}

// 3. نظام الفلترة المباشرة
searchFilterInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value.trim().toLowerCase();

  if (searchTerm === "") {
    renderTable(allFetchedData); // لو فاضي، اعرض كل الداتا
    return;
  }

  // فلترة المصفوفة الأصلية
  const filteredData = allFetchedData.filter((user) =>
    user.identifier.toLowerCase().includes(searchTerm),
  );

  renderTable(filteredData);
});

// 4. جلب وبناء الجدول
async function fetchBansData() {
  bansTableBody.innerHTML = `<tr><td colspan="4" class="px-6 py-10 text-center text-indigo-400"><i class="fa-solid fa-circle-notch fa-spin text-2xl mb-2"></i><br>جاري تحميل البيانات...</td></tr>`;

  const endpoint =
    currentTab === "currently" ? "/admin/bans/currently" : "/admin/bans/all";

  try {
    const res = await apiFetch(endpoint, { method: "GET" });

    if (res.ok) {
      allFetchedData = await res.json();

      // لو كان فيه كلام في الفلتر، طبقه على الداتا الجديدة
      const currentSearch = searchFilterInput.value.trim().toLowerCase();
      if (currentSearch) {
        const filteredData = allFetchedData.filter((u) =>
          u.identifier.toLowerCase().includes(currentSearch),
        );
        renderTable(filteredData);
      } else {
        renderTable(allFetchedData);
      }

      if (currentTab === "currently")
        activeBansCount.innerText = allFetchedData.length;
    } else {
      bansTableBody.innerHTML = `<tr><td colspan="4" class="px-6 py-10 text-center text-red-500">❌ فشل في جلب البيانات (Code: ${res.status})</td></tr>`;
    }
  } catch (error) {
    bansTableBody.innerHTML = `<tr><td colspan="4" class="px-6 py-10 text-center text-red-500"><i class="fa-solid fa-wifi text-2xl mb-2"></i><br>خطأ في الاتصال بالسيرفر</td></tr>`;
  }
}

// بناء صفوف الجدول
function renderTable(users) {
  if (!users || users.length === 0) {
    bansTableBody.innerHTML = `<tr><td colspan="4" class="px-6 py-10 text-center text-gray-500"><i class="fa-solid fa-filter-circle-xmark text-2xl mb-2 text-gray-500/50"></i><br>لا توجد نتائج مطابقة</td></tr>`;
    return;
  }

  let html = "";
  // الحصول على الوقت الحالي بتوقيت UTC للمقارنة السليمة مع السيرفر
  const currentUtcTime =
    new Date().getTime() + new Date().getTimezoneOffset() * 60000;

  users.forEach((user) => {
    // تحويل التاريخ القادم من السيرفر (والذي يُفترض أنه UTC) إلى كائن Date
    const banEndDate = new Date(user.bannedUntil);
    const banEndUtcTime = banEndDate.getTime();

    // هل الحظر منتهي؟ نقارن أوقات UTC ببعضها
    const isExpired =
      banEndUtcTime < currentUtcTime &&
      user.bannedUntil !== "0001-01-01T00:00:00Z";

    // عرض التاريخ: يتم تحويله تلقائياً لتوقيت المستخدم المحلي عند استخدام toLocaleString
    let dateStr = "غير محظور حالياً";
    if (user.bannedUntil !== "0001-01-01T00:00:00Z" && !isExpired) {
      dateStr = `<span class="text-red-300 font-medium">${banEndDate.toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })}</span>`;
    } else if (isExpired) {
      dateStr = `<span class="text-gray-500">انتهى في: ${banEndDate.toLocaleDateString("ar-EG")}</span>`;
    }

    let levelBadge = "";
    if (user.violationCount >= 4)
      levelBadge = `<span class="bg-red-900/50 text-red-400 border border-red-500/20 px-2 py-1 rounded text-xs font-bold">Level ${user.violationCount} (Max)</span>`;
    else if (user.violationCount > 0)
      levelBadge = `<span class="bg-yellow-900/50 text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded text-xs font-medium">Level ${user.violationCount}</span>`;
    else
      levelBadge = `<span class="bg-green-900/50 text-green-400 border border-green-500/20 px-2 py-1 rounded text-xs font-medium">نظيف (0)</span>`;

    html += `
            <tr class="hover:bg-gray-700/30 transition border-b border-gray-700/50">
                <td class="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-300 dir-ltr text-left">${user.identifier}</td>
                <td class="px-6 py-4 whitespace-nowrap">${levelBadge}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${dateStr}</td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    <div class="flex items-center justify-center gap-2 hidden md:flex">
                        <!-- أزرار بالنص للأحجام الكبيرة -->
                        <button onclick="executeAction('${user.identifier}', 'reduce')" class="bg-yellow-600/20 hover:bg-yellow-600 text-yellow-400 hover:text-white border border-yellow-600/50 px-3 py-1.5 rounded transition text-xs font-medium flex items-center gap-1">
                            <i class="fa-solid fa-arrow-down"></i> تخفيف
                        </button>
                        <button onclick="executeAction('${user.identifier}', 'unban')" class="bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white border border-green-600/50 px-3 py-1.5 rounded transition text-xs font-medium flex items-center gap-1">
                            <i class="fa-solid fa-unlock"></i> فك الحظر
                        </button>
                    </div>
                    <div class="flex items-center justify-center gap-2 md:hidden">
                        <!-- أزرار أيقونات فقط للأحجام الصغيرة (موبايل) -->
                        <button onclick="executeAction('${user.identifier}', 'reduce')" class="bg-yellow-600/20 hover:bg-yellow-600 text-yellow-400 hover:text-white border border-yellow-600/50 px-3 py-1.5 rounded transition text-xs" title="تخفيف درجة">
                            <i class="fa-solid fa-arrow-down"></i>
                        </button>
                        <button onclick="executeAction('${user.identifier}', 'unban')" class="bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white border border-green-600/50 px-3 py-1.5 rounded transition text-xs" title="فك الحظر">
                            <i class="fa-solid fa-unlock"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
  });

  bansTableBody.innerHTML = html;
}

// دالة بديلة للـ Confirm العادية وتدعم الألوان بناءً على نوع العملية
function showCustomConfirm(actionName, identifier, actionType) {
  return new Promise((resolve) => {
    // تخصيص الألوان والنصوص بناءً على العملية (أخضر لفك الحظر، أصفر للتخفيف)
    if (actionType === "unban") {
      confirmTitle.innerText = "تأكيد فك الحظر";
      confirmTitle.className = "text-xl font-bold text-green-400 mb-2";
      confirmIconBg.className =
        "w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30";
      confirmIcon.className = "fa-solid fa-unlock text-green-500 text-3xl";
      btnConfirmAction.className =
        "flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-xl transition shadow-lg shadow-green-600/20";
      btnConfirmAction.innerText = "نعم، فك الحظر";
    } else {
      confirmTitle.innerText = "تأكيد تخفيف العقوبة";
      confirmTitle.className = "text-xl font-bold text-yellow-400 mb-2";
      confirmIconBg.className =
        "w-16 h-16 bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/30";
      confirmIcon.className = "fa-solid fa-arrow-down text-yellow-500 text-3xl";
      btnConfirmAction.className =
        "flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2.5 rounded-xl transition shadow-lg shadow-yellow-600/20";
      btnConfirmAction.innerText = "نعم، خفف العقوبة";
    }

    // كتابة الرسالة وتنسيق الـ IP أو الـ ID بشكل بارز
    confirmMessage.innerHTML = `هل أنت متأكد من <strong>${actionName}</strong>:<br><span class="text-indigo-300 font-mono mt-3 p-2 bg-gray-900 rounded block border border-gray-700">${identifier}</span>`;

    // إظهار النافذة
    actionConfirmModal.classList.remove("hidden");

    // لو ضغط موافق
    btnConfirmAction.onclick = () => {
      actionConfirmModal.classList.add("hidden");
      resolve(true); // الكود هيكمل
    };

    // لو ضغط إلغاء
    btnCancelAction.onclick = () => {
      actionConfirmModal.classList.add("hidden");
      resolve(false); // الكود هيقف
    };
  });
}

// 5. تنفيذ الأكشن
window.executeAction = async function (identifier, action) {
  const actionName = action === "unban" ? "فك الحظر نهائياً عن" : "تخفيف عقوبة";

  const isConfirmed = await showCustomConfirm(actionName, identifier, action);

  if (!isConfirmed) return; // لو ضغط إلغاء، هنوقف التنفيذ

  const originalHtml = bansTableBody.innerHTML;
  bansTableBody.innerHTML = `<tr><td colspan="4" class="px-6 py-10 text-center text-yellow-400"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><br>جاري تنفيذ الأمر...</td></tr>`;

  try {
    const endpoint = `/admin/bans/${encodeURIComponent(identifier)}/${action}`;
    const res = await apiFetch(endpoint, { method: "POST" });

    if (res.ok) {
      fetchBansData();
    } else {
      alert(`❌ فشلت العملية (كود الخطأ: ${res.status})`);
      bansTableBody.innerHTML = originalHtml;
    }
  } catch (error) {
    alert("تعذر الاتصال بالسيرفر.");
    bansTableBody.innerHTML = originalHtml;
  }
};

// دالة مساعدة لمعالجة أخطاء التحقق الأولية
function handleErrorAuth(res) {
  if (res.status === 403) {
    authStatus.className =
      "text-sm font-medium px-3 py-1.5 rounded-full bg-red-900/30 text-red-400 border border-red-500/30";
    authStatus.innerHTML = `<i class="fa-solid fa-ban mr-2"></i> حساب محظور`;
    accessDeniedMsg.innerText =
      "وصول مرفوض! حسابك لا يمتلك صلاحيات مدير النظام. تم تسجيل هذه المحاولة وتطبيق الحظر عليك.";
  } else {
    accessDeniedMsg.innerText = `حدث خطأ أثناء محاولة التحقق من السيرفر (كود: ${res.status})`;
  }
  adminContent.classList.add("hidden");
  accessDenied.classList.remove("hidden");
}
