function speakText(text, lang) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);
}

function translateText(text, sourceLang, targetLang, callback) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    fetch(url)
        .then(res => res.json())
        .then(data => {
            const translated = data[0][0][0];
            callback(translated);
        })
        .catch(err => {
            console.error('Translate error:', err);
            callback("Translation failed.");
        });
}

function startRecognition(lang, callback) {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        callback(spokenText);
    };

    recognition.onerror = (event) => {
        console.error("Speech error:", event.error);
        callback("Could not recognize speech.");
    };

    recognition.start();
}

function addMessageBlock(userId, originalText, translatedText, translatedLang) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("message-block", `user${userId}-block`);

    const originalBubble = document.createElement("div");
    originalBubble.classList.add("chat-bubble", `user${userId}-msg`);
    originalBubble.innerText = `User ${userId}: ${originalText}`;

    const translatedBubble = document.createElement("div");
    translatedBubble.classList.add("chat-bubble", `user${userId}-msg`);
    translatedBubble.innerHTML = `Translated: ${translatedText}`;

    const listenBtn = document.createElement("button");
    listenBtn.innerHTML = "🔊 Listen";
    listenBtn.classList.add("listen-btn");
    listenBtn.onclick = () => speakText(translatedText, translatedLang);
    translatedBubble.appendChild(listenBtn);

    wrapper.appendChild(originalBubble);
    wrapper.appendChild(translatedBubble);

    document.getElementById("chatOutput").appendChild(wrapper);

    // Scroll to bottom automatically
    document.getElementById("chatOutput").scrollTop = document.getElementById("chatOutput").scrollHeight;
}

function handleUserSpeech(userId) {
    const sourceLang = document.getElementById(`user${userId}Lang`).value;
    const targetId = userId === 1 ? 2 : 1;
    const targetLang = document.getElementById(`user${targetId}Lang`).value;

    startRecognition(sourceLang, (spokenText) => {
        translateText(spokenText, sourceLang, targetLang, (translatedText) => {
            addMessageBlock(userId, spokenText, translatedText, targetLang);
            speakText(translatedText, targetLang);
        });
    });
}

// Event Listeners
document.getElementById("user1SpeakBtn").addEventListener("click", () => handleUserSpeech(1));
document.getElementById("user2SpeakBtn").addEventListener("click", () => handleUserSpeech(2));
document.getElementById("clearBtn").addEventListener("click", () => {
    document.getElementById("chatOutput").innerHTML = "";
});
