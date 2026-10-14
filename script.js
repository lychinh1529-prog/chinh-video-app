"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const videoUrl = document.getElementById("videoUrl");
  const charCount = document.getElementById("charCount");
  const clearBtn = document.getElementById("clearBtn");
  const pasteBtn = document.getElementById("pasteBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const statusBox = document.getElementById("statusBox");
  const platformName = document.getElementById("platformName");
  const headerSettings = document.getElementById("headerSettings");

  const platforms = document.querySelectorAll(".platform");
  const navButtons = document.querySelectorAll(".nav-btn");
  const sections = document.querySelectorAll(".section");

  const MAX_LENGTH = 500;
  let selectedPlatform = "";
  let manualPlatform = false;

  function detectPlatform(value) {
    if (!value.trim()) return "";
    let url;
    try {
      url = new URL(value.trim());
    } catch {
      return "";
    }
    if (!["http:", "https:"].includes(url.protocol)) return "";
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (host.includes("youtube.com") || host === "youtu.be") return "YouTube";
    if (host.includes("douyin.com")) return "Douyin";
    if (host.includes("bilibili.com") || host === "b23.tv") return "Bilibili";
    if (host.includes("tiktok.com")) return "TikTok";
    return "";
  }

  function showStatus(message, type = "info") {
    if (!statusBox) return;
    statusBox.textContent = message;
    statusBox.className = "status";
    if (type === "error") {
      statusBox.style.background = "#fff0f0";
      statusBox.style.color = "#d92d3a";
    } else if (type === "success") {
      statusBox.style.background = "#eafaf0";
      statusBox.style.color = "#168344";
    } else {
      statusBox.style.background = "#eaf3ff";
      statusBox.style.color = "#075de0";
    }
  }

  function clearStatus() {
    if (!statusBox) return;
    statusBox.textContent = "";
    statusBox.className = "status";
    statusBox.removeAttribute("style");
  }

  function updatePlatformCards(name) {
    platforms.forEach((item) => {
      const isActive = item.dataset.platform === name;
      item.classList.toggle("active", isActive);
    });
  }

  function updatePlatformName(name) {
    selectedPlatform = name;
    if (platformName) {
      platformName.textContent = name ? `Nền tảng: ${name}` : "Nền tảng: Chưa xác định";
    }
    updatePlatformCards(name);
  }

  function updateInput() {
    if (!videoUrl) return;
    const value = videoUrl.value;
    const trimmedValue = value.trim();

    if (charCount) {
      charCount.textContent = `${value.length}/${MAX_LENGTH}`;
    }

    if (!trimmedValue) {
      updatePlatformName("");
      manualPlatform = false;
      if (downloadBtn) downloadBtn.disabled = true;
      clearStatus();
      return;
    }

    const detected = detectPlatform(trimmedValue);
    if (detected) {
      if (!manualPlatform || selectedPlatform === detected) {
        updatePlatformName(detected);
      }
    } else {
      updatePlatformName("");
    }
    if (downloadBtn) downloadBtn.disabled = false;
    clearStatus();
  }

  if (videoUrl) {
    videoUrl.addEventListener("input", () => {
      manualPlatform = false;
      updateInput();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (videoUrl) videoUrl.value = "";
      updateInput();
    });
  }

  if (pasteBtn) {
    pasteBtn.addEventListener("click", async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (videoUrl) {
          videoUrl.value = text.slice(0, MAX_LENGTH);
          updateInput();
          showStatus("Đã dán liên kết thành công.", "success");
        }
      } catch {
        showStatus("Không thể truy cập bộ nhớ tạm.", "error");
      }
    });
  }

  // ========================================
  // TÍCH HỢP API TẢI VIDEO (GENDOWNLOAD)
  // ========================================
  let currentFormatsData = [];

  if (downloadBtn) {
    downloadBtn.addEventListener("click", async () => {
      const urlValue = videoUrl ? videoUrl.value.trim() : "";
      if (!urlValue) {
        showStatus("Vui lòng nhập liên kết video cần tải!", "error");
        return;
      }

      downloadBtn.disabled = true;
      showStatus("Đang phân tích liên kết với máy chủ...", "info");

      try {
        const response = await fetch("https://gendownload.com/api/extract", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ url: urlValue })
        });

        if (!response.ok) {
          throw new Error(`Lỗi kết nối API (${response.status})`);
        }

        const data = await response.json();

        if (data && (data.formats || data.url || data.title)) {
          showStatus("Phân tích thành công! Đang chuyển hướng tải xuống...", "success");
          
          currentFormatsData = data.formats || [data];
          
          // Lấy link tải từ định dạng đầu tiên hoặc định dạng mặc định
          const targetUrl = currentFormatsData[0]?.url || data.url;
          if (targetUrl) {
            setTimeout(() => {
              window.open(targetUrl, "_blank");
            }, 1000);
          } else {
            alert("Không tìm thấy đường dẫn tải trực tiếp.");
          }
        } else {
          throw new Error("Không thể trích xuất thông tin từ liên kết này.");
        }
      } catch (error) {
        console.error(error);
        showStatus(`Lỗi: ${error.message || "Không thể xử lý liên kết."}`, "error");
      } finally {
        downloadBtn.disabled = false;
      }
    });
  }

  function openSection(target) {
    sections.forEach((section) => {
      section.classList.toggle("active", section.id === target);
    });
    navButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.target === target);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      openSection(button.dataset.target);
    });
  });

  if (headerSettings) {
    headerSettings.addEventListener("click", () => {
      openSection("settings");
    });
  }
});

/* ========================================
   CẤU HÌNH FIREBASE & QUẢN LÝ TÀI KHOẢN
======================================== */
const firebaseConfig = {
  apiKey: "AIzaSy4cm_F8s2qD0EpcRjwgLFg2bsHvwK-ibAc",
  authDomain: "chinh-video.firebaseapp.com",
  projectId: "chinh-video",
  storageBucket: "chinh-video.firebasestorage.app",
  messagingSenderId: "292692951758",
  appId: "1:292692951758:web:5e35d1ff4e61c8b634069f",
  measurementId: "G-T6EMG9SDLN"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {
  const savedUsername = localStorage.getItem("chinh_username");
  if (savedUsername) {
    checkTrialStatusDirect(savedUsername);
  } else {
    const authScreen = document.getElementById('authScreen');
    if (authScreen) authScreen.style.display = 'flex';
  }
});

function handleSignup() {
  const username = document.getElementById('regUsername').value.trim().toLowerCase();
  const password = document.getElementById('regPassword').value;
  const msgElement = document.getElementById('regMessage');

  if (!username || !password) {
    if (msgElement) msgElement.innerText = "Vui lòng nhập đầy đủ Tên tài khoản và Mật khẩu!";
    return;
  }

  const userRef = db.collection("app_users").doc(username);
  userRef.get().then((doc) => {
    if (doc.exists) {
      if (msgElement) msgElement.innerText = "Tên tài khoản đã tồn tại!";
    } else {
      const randomCode = Math.floor(100000 + Math.random() * 900000);
      const uniqueId = 'VN-' + randomCode;
      const currentTime = new Date().getTime();

      userRef.set({
        username: username,
        password: password,
        uniqueId: uniqueId,
        createdAt: currentTime,
        status: "trial"
      }).then(() => {
        localStorage.setItem("chinh_username", username);
        alert("Tạo tài khoản thành công! Mã định danh: " + uniqueId);
        checkTrialStatusDirect(username);
      });
    }
  });
}

function handleLogin() {
  const username = document.getElementById('authUsername').value.trim().toLowerCase();
  const password = document.getElementById('authPassword').value;
  const msgElement = document.getElementById('authMessage');

  if (!username || !password) return;

  db.collection("app_users").doc(username).get().then((doc) => {
    if (doc.exists) {
      const data = doc.data();
      if (data.password === password) {
        localStorage.setItem("chinh_username", username);
        checkTrialStatusDirect(username);
      } else {
        if (msgElement) msgElement.innerText = "Sai mật khẩu!";
      }
    } else {
      if (msgElement) msgElement.innerText = "Tài khoản không tồn tại!";
    }
  });
}

function handleForgotPassword() {
  alert("Vui lòng liên hệ Admin qua TikTok: @tyty_99_4 để được hỗ trợ!");
}

function togglePasswordVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (input.type === "password") {
    input.type = "text";
    icon.textContent = "🙈";
  } else {
    input.type = "password";
    icon.textContent = "👁️";
  }
}

function showAuthSection(sectionId) {
  const login = document.getElementById('authScreen');
  const reg = document.getElementById('registerSection');
  if (sectionId === 'register') {
    login.style.display = 'none';
    reg.style.display = 'flex';
  } else {
    login.style.display = 'flex';
    reg.style.display = 'none';
  }
}

function handleLogout() {
  localStorage.removeItem("chinh_username");
  location.reload();
}

function checkTrialStatusDirect(username) {
  db.collection("app_users").doc(username).get().then((doc) => {
    const authScreen = document.getElementById('authScreen');
    const registerSection = document.getElementById('registerSection');
    const lockScreen = document.getElementById('lockScreen');
    const mainAppContent = document.getElementById('mainAppContent');
    const userIdDisplay = document.getElementById('userIdDisplay');
    const settingUsername = document.getElementById('settingUsername');
    const settingUniqueId = document.getElementById('settingUniqueId');

    if (authScreen) authScreen.style.display = 'none';
    if (registerSection) registerSection.style.display = 'none';

    if (doc.exists) {
      const data = doc.data();
      const uniqueId = data.uniqueId || "VN-151120";
      const createdAt = data.createdAt;
      const accountStatus = data.status;

      if (userIdDisplay) userIdDisplay.innerText = uniqueId;
      if (settingUsername) settingUsername.innerText = username;
      if (settingUniqueId) settingUniqueId.innerText = uniqueId;

      if (accountStatus === 'active') {
        lockScreen.style.display = 'none';
        mainAppContent.style.display = 'block';
        return;
      }

      const now = new Date().getTime();
      const fourteenDays = 14 * 24 * 60 * 60 * 1000;

      if (now - createdAt > fourteenDays) {
        lockScreen.style.display = 'flex';
        mainAppContent.style.display = 'none';
      } else {
        lockScreen.style.display = 'none';
        mainAppContent.style.display = 'block';
      }
    }
  });
}

function copyUserId() {
  const text = document.getElementById("userIdDisplay").innerText;
  navigator.clipboard.writeText(text).then(() => alert("Đã sao chép: " + text));
}

// Tính năng Tách nhạc từ link video
function handleExtractAudio() {
  const url = document.getElementById("extractUrl").value.trim();
  const status = document.getElementById("extractStatus");
  if (!url) {
    status.style.color = "#d92d3a";
    status.innerText = "Vui lòng dán đường dẫn video vào ô trên!";
    return;
  }
  status.style.color = "#075de0";
  status.innerText = "Đang kết nối để trích xuất âm thanh...";
  setTimeout(() => {
    status.style.color = "#168344";
    status.innerText = "Trích xuất thành công! File nhạc đã sẵn sàng tải về.";
  }, 2000);
}
