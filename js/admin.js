import { apiFetch, getCurrentUser, auth } from "./shared.js";

const authStatus = document.getElementById("auth-status");
const adminControls = document.getElementById("admin-controls");
const targetValueInput = document.getElementById("target-value");
const resultMessage = document.getElementById("result-message");
const actionButtons = document.querySelectorAll(".action-btn");

auth.onAuthStateChanged((user) => {
  if (user) {
    authStatus.className =
      "bg-green-900/20 border border-green-500/30 p-3 rounded-lg text-center text-sm text-green-400";
    authStatus.innerHTML = `مرحباً بك: <span class="font-bold">${user.displayName || "أدمن"}</span>`;
    adminControls.classList.remove("hidden");
  } else {
    authStatus.className =
      "bg-red-900/20 border border-red-500/30 p-3 rounded-lg text-center text-sm text-red-400";
    authStatus.innerHTML =
      "❌ عذراً، يجب تسجيل الدخول أولاً للوصول لهذه الصفحة.";
    adminControls.classList.add("hidden");
  }
});

actionButtons.forEach((button) => {
  button.addEventListener("click", async (e) => {
    const action = e.target.getAttribute("data-action");
    const targetValue = targetValueInput.value.trim();

    if (!targetValue) {
      showResult("⚠️ يرجى إدخال الـ IP أو معرّف المستخدم أولاً.", false, true);
      return;
    }

    const endpoint = `/admin/bans/${encodeURIComponent(targetValue)}/${action}`;

    if (typeof ShowLoadingScreen === "function") ShowLoadingScreen();
    setButtonsState(true);
    resultMessage.classList.add("hidden");

    try {
      // استخدام الفيتش الأصلية بتاعتك
      const res = await apiFetch(endpoint, {
        method: "POST",
      });

      // 🚨 الفحص اليدوي لحالة الرد (لأن apiFetch مبترجعش خطأ تلقائي للـ HTTP Status)
      if (res.ok) {
        // السيرفر رد بـ 200 OK
        const actionText =
          action === "unban" ? "فك الحظر بالكامل" : "تخفيف العقوبة درجة واحدة";
        showResult(
          `✅ تمت عملية ${actionText} لـ (${targetValue}) بنجاح!`,
          true,
          false,
        );
        targetValueInput.value = "";
      } else {
        // السيرفر رجع خطأ (403, 404, 500, etc.)
        if (res.status === 403) {
          let errMsg = await res.text();
          errMsg = errMsg || `\nالرسالة: ${errMsg}`;
          showResult(
            `❌ وصول مرفوض: حسابك لا يمتلك صلاحيات الإدارة! تم تسجيل المحاولة وتطبيق الحظر.${errMsg}`,
            false,
            false,
          );
        } else if (res.status === 404) {
          showResult(
            "⚠️ لم يتم العثور على هذا المستخدم أو الـ IP في قائمة الحظر.",
            false,
            true,
          );
        } else if (res.status === 401) {
          showResult("❌ وصول مرفوض: يرجى تسجيل الدخول أولاً.", false, false);
        } else {
          showResult(
            `❌ حدث خطأ من السيرفر (كود الخطأ: ${res.status}).`,
            false,
            false,
          );
        }
      }
    } catch (error) {
      // ده هيمسك الأخطاء الخاصة بالشبكة (النت فاصل، السيرفر مقفول)
      showResult(
        "❌ تعذر الاتصال بالسيرفر، تأكد من اتصالك بالإنترنت أو حالة السيرفر.",
        false,
        false,
      );
    } finally {
      if (typeof CloseLoadingScreen === "function") CloseLoadingScreen();
      setButtonsState(false);
    }
  });
});

function showResult(msg, isSuccess, isWarning = false) {
  resultMessage.innerText = msg;
  resultMessage.classList.remove("hidden");

  if (isSuccess) {
    resultMessage.className =
      "p-4 rounded-xl text-sm text-center font-medium bg-green-900/30 border border-green-500/40 text-green-400";
  } else if (isWarning) {
    resultMessage.className =
      "p-4 rounded-xl text-sm text-center font-medium bg-yellow-900/30 border border-yellow-500/40 text-yellow-400";
  } else {
    resultMessage.className =
      "p-4 rounded-xl text-sm text-center font-medium bg-red-900/30 border border-red-500/40 text-red-400";
  }
}

function setButtonsState(isDisabled) {
  actionButtons.forEach((btn) => {
    btn.disabled = isDisabled;
    if (isDisabled) {
      btn.classList.add("opacity-50", "cursor-not-allowed");
    } else {
      btn.classList.remove("opacity-50", "cursor-not-allowed");
    }
  });
}
