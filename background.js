chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "TRANSLATE") {

        chrome.storage.sync.get(["targetLang"], (res) => {
            console.log("targetLang: ", res.targetLang);
            const lang = res.targetLang || "zh-TW";

            fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(msg.text)}&langpair=en|${lang}`)
                .then(res => res.json())
                .then(data => {
                    sendResponse({ result: data.responseData.translatedText });
                });
        });

        return true;
    }
});
