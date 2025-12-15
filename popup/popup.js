const sourceSelect = document.getElementById("sourceLang");
const targetSelect = document.getElementById("lang");
const swapLangBtn = document.getElementById("swapLangBtn");
const saveBtn = document.getElementById("saveBtn");
const savedMsg = document.getElementById("saved");
const toggle = document.getElementById("aiToggle");
const label = document.getElementById("toggleLabel");
const apiKeyInput = document.getElementById("apiKeyInput");

// 載入設定
chrome.storage.sync.get(
  ["sourceLang", "targetLang"],
  (res) => {
    sourceSelect.value = res.sourceLang || "auto";
    targetSelect.value = res.targetLang || "zh-TW";
  }
);

// 啟動時讀取設定
chrome.storage.sync.get("fontSize", data => {
  updatePreview(data.fontSize || "medium");
});

chrome.storage.sync.get("isAItranslator", ({ isAItranslator }) => {
  toggle.checked = !!isAItranslator;
  label.textContent = isAItranslator ? "Google translate" : "一般翻譯";
});

// 載入 ai translate key
chrome.storage.sync.get("apiKey", ({ apiKey }) => {
    if (apiKey) apiKeyInput.value = apiKey;
});

// 儲存設定
saveBtn.addEventListener("click", () => {
    chrome.storage.sync.set(
        {
            sourceLang: sourceSelect.value,
            targetLang: targetSelect.value
        },
        () => {
            savedMsg.style.display = "block";
            setTimeout(() => {
                savedMsg.style.display = "none";
            }, 1500);
        }
    );
});

// 交換語言
swapLangBtn.addEventListener("click", () => {
    const temp = sourceSelect.value;
    sourceSelect.value = targetSelect.value;
    targetSelect.value = temp;

    // // 立即存檔
    chrome.storage.sync.set({
        sourceLang: sourceSelect.value,
        targetLang: targetSelect.value
    });
});

toggle.addEventListener("change", () => {
  const isAItranslator = toggle.checked;
  chrome.storage.sync.set({ isAItranslator });
  label.textContent = isAItranslator ? "Google translate" : "一般翻譯";
});

// 儲存 ai translate key
apiKeyInput.addEventListener("change", () => {
    chrome.storage.sync.set({ apiKey: apiKeyInput.value });
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
