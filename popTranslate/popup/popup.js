const langSelect = document.getElementById("lang");
const saveBtn = document.getElementById("saveBtn");
const savedMsg = document.getElementById("saved");

// 載入設定
chrome.storage.sync.get(["targetLang"], (res) => {
    langSelect.value = res.targetLang || "zh-TW";
});

// 啟動時讀取設定
chrome.storage.sync.get("fontSize", data => {
  updatePreview(data.fontSize || "medium");
});

// 儲存設定
saveBtn.addEventListener("click", () => {
    chrome.storage.sync.set({ targetLang: langSelect.value }, () => {
        savedMsg.style.display = "block";
        setTimeout(() => savedMsg.style.display = "none", 1500);
    });
});

document.querySelectorAll(".size-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const size = btn.dataset.size;

    chrome.storage.sync.set({ fontSize: size });

    updatePreview(size);
  });
});

function updatePreview(size) {
  const box = document.getElementById("translationBox");
  if (size === "small") box.style.fontSize = "14px";
  if (size === "medium") box.style.fontSize = "18px";
  if (size === "large") box.style.fontSize = "22px";
}
