// --- Theme Toggle Logic ---
const themeToggleBtn = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 4.22a1 1 0 011.415 0l.884.884a1 1 0 01-1.414 1.415l-.884-.884a1 1 0 010-1.415zM1 10a1 1 0 011-1h1a1 1 0 110 2H2a1 1 0 01-1-1zm15 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zM7.05 16.95a1 1 0 001.415 0l.884-.884a1 1 0 00-1.415-1.415l-.884.884a1 1 0 000 1.415zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm4.22-4.22a1 1 0 011.415 0l.884.884a1 1 0 01-1.414 1.415l-.884-.884a1 1 0 010-1.415zM10 5a5 5 0 100 10 5 5 0 000-10z" clip-rule="evenodd" /></svg>`;
const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>`;

themeToggleBtn.innerHTML = htmlElement.classList.contains('dark') ? sunIcon : moonIcon;

themeToggleBtn.addEventListener('click', () => {
    htmlElement.classList.toggle('dark');
    themeToggleBtn.innerHTML = htmlElement.classList.contains('dark') ? sunIcon : moonIcon;
});

// --- Chatbot Toggle Logic ---
function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    // ปิด-เปิด คลาส hidden เพื่อซ่อนหรือแสดงหน้าต่าง
    chatWindow.classList.toggle('hidden');
}

// --- Send Message Logic ---
async function sendMessage() {
    const inputField = document.getElementById("user-input");
    const message = inputField.value.trim();
    if (!message) return;

    const chatBox = document.getElementById("chat-box");

    // ข้อความผู้ใช้
    chatBox.innerHTML += `<div class="bg-dcm text-white px-3 py-2 rounded-2xl rounded-tr-sm max-w-[85%] self-end shadow-sm">${message}</div>`;
    inputField.value = "";
    
    // สถานะกำลังพิมพ์
    const typingId = "typing-" + Date.now();
    chatBox.innerHTML += `<div id="${typingId}" class="text-slate-400 text-xs self-start px-2 py-1 flex items-center gap-1">
        <span class="animate-bounce">●</span><span class="animate-bounce" style="animation-delay: 0.1s">●</span><span class="animate-bounce" style="animation-delay: 0.2s">●</span>
    </div>`;
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        document.getElementById(typingId).remove();
        
        // ข้อความ AI
        chatBox.innerHTML += `<div class="bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-2xl rounded-tl-sm max-w-[85%] self-start shadow-sm border border-slate-100 dark:border-slate-600">${data.reply}</div>`;
    } catch (error) {
        document.getElementById(typingId).remove();
        chatBox.innerHTML += `<div class="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-2 rounded-2xl rounded-tl-sm max-w-[85%] self-start shadow-sm">เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย</div>`;
    }
    
    chatBox.scrollTop = chatBox.scrollHeight;
}

document.getElementById("user-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});