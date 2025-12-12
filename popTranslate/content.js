let popupDiv = null;

document.addEventListener("mouseup", async () => {
    const selectedText = window.getSelection().toString().trim();

    if (!selectedText) {
        removePopup();
        return;
    }

    chrome.runtime.sendMessage({ type: "TRANSLATE", text: selectedText }, (response) => {
        showPopup(response.result);
    });
});

function showPopup(translatedText) {
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

        /* 強化陰影 */
        popupDiv.style.boxShadow = "0px 4px 15px rgba(0,0,0,0.25)";

        popupDiv.style.fontSize = sizePx;
        popupDiv.style.zIndex = 9999999;
        popupDiv.innerText = translatedText;

        document.body.appendChild(popupDiv);

        // setTimeout(() => popupDiv.remove(), 3000);
    });
}

function removePopup() {
    if (popupDiv) {
        popupDiv.remove();
        popupDiv = null;
    }
}
