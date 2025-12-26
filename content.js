let popupDiv = null;
const ttsLangMap = {
    "zh-TW": "zh-TW",
    "en": "en-US",
    "ja": "ja-JP",
    "ko": "ko-KR"
};

document.addEventListener("mouseup", async () => {
    const selectedText = window.getSelection().toString().trim();

    if (!selectedText) {
        removePopup();
        return;
    }

    chrome.storage.sync.get("isAItranslator", ({ isAItranslator }) => {
        if (isAItranslator) {
            chrome.runtime.sendMessage({ type: "translate_googleAppsScript", text: selectedText }, (response) => {
                showPopup(selectedText, response.result);
            });
        } else {
            chrome.runtime.sendMessage({ type: "TRANSLATE", text: selectedText }, (response) => {
                showPopup(selectedText, response.result);
            });
        }
    });
});

function getTtsLang(lang) {
    // return ttsLangMap[lang] || "en-US";
    console.log(`Language tts = ${LANGUAGES[lang].tts}`);
    return LANGUAGES[lang].tts || "en-US";
}

function speakText(text, lang) {
    if (!text) return;

    speechSynthesis.cancel(); // 停掉前一個
    // if (speechSynthesis.speaking) {
    //     speechSynthesis.cancel();
    //     return;
    // }

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;

    // 嘗試選擇對應語言 voice（加分）
    const voices = speechSynthesis.getVoices();
    const matched = voices.find(v => v.lang === lang || v.lang.startsWith(lang));
    if (matched) utter.voice = matched;

    speechSynthesis.speak(utter);
}

function showPopup(selectedText, translatedText) {
    removePopup();

    const selection = window.getSelection().getRangeAt(0);
    const rect = selection.getBoundingClientRect();

    let top = `${rect.bottom + window.scrollY + 5}`;
    let left = `${rect.left + window.scrollX}`;

    chrome.storage.sync.get("fontSize", data => {
        const fontSize = data.fontSize || "medium";

        const sizePx = fontSize === "small" ? "14px" : fontSize === "large" ? "22px" : "18px";

        popupDiv = document.createElement("div");
        popupDiv.id = "ai-popup-translator";
        popupDiv.style.position = "absolute";
        popupDiv.style.left = `${left}px`;
        popupDiv.style.top = `${top}px`;
        popupDiv.style.background = "white";
        popupDiv.style.padding = "10px";
        popupDiv.style.borderRadius = "8px";

        //speak button
        popupDiv.style.minWidth = "200px";
        popupDiv.style.paddingRight = "46px"; // 留給按鈕

        /* 強化陰影 */
        popupDiv.style.boxShadow = "0px 4px 15px rgba(0,0,0,0.25)";

        popupDiv.style.fontSize = sizePx;
        popupDiv.style.zIndex = 9999999;

        const style = document.createElement("style");
        style.textContent = `
            #ai-popup-translator {
                font-family: system-ui, -apple-system;
            }

            #ai-popup-translator .tts-buttons {
                position: absolute;
                right: 6px;
                top: 6px;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            #ai-popup-translator button {
                border: none;
                background: #f3f3f3;
                cursor: pointer;
                font-size: 12px;
                padding: 4px;
                border-radius: 6px;
            }

            #ai-popup-translator button:hover {
                background: #ddd;
            }
        `;
        document.head.appendChild(style);
        // popupDiv.innerText = translatedText;
        popupDiv.innerHTML = `
            <div class="translator-text">${translatedText}</div>

            <div class="tts-buttons">
                <button id="tts-source" title="原文發音">🔊 原</button>
                <button id="tts-target" title="翻譯發音">🔊 中</button>
            </div>
        `;

        document.body.appendChild(popupDiv);

        chrome.storage.sync.get(
            ["sourceLang", "targetLang"],
            (res) => {
                // console.log(`sourceLang: ${res.sourceLang}, targetLang: ${res.targetLang}`);
                const source = res.sourceLang || "auto";
                const target = res.targetLang || "zh-TW";
                console.log(`sourceLang: ${source}, targetLang: ${target}`);
                // 綁定按鈕（就在 content.js）
                const sourceSpeak = getTtsLang(source);
                const targetSpeak = getTtsLang(target);
                popupDiv.querySelector("#tts-source").addEventListener("click", () => {
                    speakText(selectedText, sourceSpeak || "en-US");
                });

                popupDiv.querySelector("#tts-target").addEventListener("click", () => {
                    speakText(translatedText, targetSpeak || "zh-TW");
                });
            }
        );

        // setTimeout(() => popupDiv.remove(), 3000);
    });
}

function removePopup() {
    if (popupDiv) {
        popupDiv.remove();
        popupDiv = null;
    }
}
