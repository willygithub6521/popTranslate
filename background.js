chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "TRANSLATE") {
        console.log("background:  TRANSLATE, msg.type: ", msg.type);
        chrome.storage.sync.get(
            ["sourceLang", "targetLang"],
            (res) => {
                // console.log(`sourceLang: ${res.sourceLang}, targetLang: ${res.targetLang}`);
                const source = res.sourceLang || "auto";
                const target = res.targetLang || "zh-TW";
                console.log(`sourceLang: ${source}, targetLang: ${target}`);

                fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(msg.text)}&langpair=${source}|${target}`)
                .then(res => res.json())
                .then(data => {
                    sendResponse({ result: data.responseData.translatedText });
                });
            }
        );
        return true;
    }
    else if (msg.type === "translate_googleAppsScript") {
        console.log("background:  translate_googleAppsScript, msg.type: ", msg.type);
        chrome.storage.sync.get(
            ["sourceLang", "targetLang"],
            (res) => {
                // console.log(`sourceLang: ${res.sourceLang}, targetLang: ${res.targetLang}`);
                const source = res.sourceLang || "auto";
                const target = res.targetLang || "zh-TW";
                console.log(`sourceLang: ${source}, targetLang: ${target}`);

                translateGoogleAppsScript(msg.text, source, target)
                    .then((translatedText) => {
                        sendResponse({ result: translatedText });
                    })
                    .catch((err) => {
                        console.error("Google AppsScript API Error:", err);
                        sendResponse({ error: err.toString() });
                    });
            }
        );
        return true;
    }
    else if (msg.type === "translate_ai") {
        console.log("background:  translate_ai, msg.type: ", msg.type);
        translateAI(msg.text)
            .then(result => sendResponse({ result }))
            .catch(err => sendResponse({ error: err }));
        return true; // ← 重要：保持 channel 開著（async）
    }
});

async function translateGoogleAppsScript(text, sourceLang, targetLang) {
    const url = `https://script.google.com/macros/s/AKfycbwSkJJjP-ydBGrsLJreRpTGrBZMHOEWSRTXY-mi5JvaFQDHzox-AcEjfsVC66w314C4JQ/exec?q=${encodeURIComponent(text)}&source=${sourceLang}&target=${targetLang}`;
    const response = await fetch(url);
// 檢查 HTTP 狀態碼
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const responseText = await response.text();
    console.log("responseText: ", responseText);
    return responseText;
}

async function translateAI(text) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(["apiKey"], async ({ apiKey }) => {
      if (!apiKey) {
        return reject("❌ 尚未設定 OpenAI API Key");
      }

      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",  // 你要用哪個 model 寫這裡
            messages: [
              {
                role: "system",
                content: "你是一個專業翻譯工具，請將輸入文字翻譯成「繁體中文」，保持語氣自然流暢。"
              },
              {
                role: "user",
                content: text
              }
            ]
          })
        });

        const result = await response.json();
        console.log("result: ", result);

        if (result.error) {
          return reject(result.error.message);
        }

        resolve(result.choices[0].message.content);

      } catch (e) {
        reject(e.toString());
      }
    });
  });
}
