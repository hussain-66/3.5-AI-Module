let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
let responseLogic = localStorage.getItem('responseLogic') || "Hello! I'm your offline assistant. How can I help you?";
let isLightMode = false;

// Persistent storage for remembered data
let rememberedData = JSON.parse(localStorage.getItem('rememberedData')) || {};

// Track the current chat session
let currentChatSession = [];
let chatSessions = JSON.parse(localStorage.getItem('chatSessions')) || [];

// Initialize chat history and response logic
document.getElementById('response-editor').value = responseLogic;
updateHistoryList();

// Function to toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleIcon = document.getElementById('toggle-history');
    const backdrop = document.getElementById('backdrop');
    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        toggleIcon.classList.remove('open');
        backdrop.classList.remove('active');
        document.body.style.overflow = 'auto';
    } else {
        sidebar.classList.add('open');
        toggleIcon.classList.add('open');
        backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close sidebar when clicking outside of it
document.getElementById('backdrop').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    const toggleIcon = document.getElementById('toggle-history');
    const backdrop = document.getElementById('backdrop');
    sidebar.classList.remove('open');
    toggleIcon.classList.remove('open');
    backdrop.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Function to toggle collapsible sections
function toggleSection(sectionId) {
    const content = document.getElementById(`${sectionId}-content`);
    const arrow = document.getElementById(`${sectionId}-arrow`);
    content.classList.toggle('open');
    arrow.innerText = content.classList.contains('open') ? '▲' : '▼';
}

// Function to send message
function sendMessage() {
    const userInput = document.getElementById('user-input').value.trim();
    if (!userInput) return;

    appendMessage('user', userInput);
    currentChatSession.push({ sender: 'user', message: userInput });

    // Generate bot response based on logic
    const botResponse = generateBotResponse(userInput);
    appendMessage('bot', botResponse);
    currentChatSession.push({ sender: 'bot', message: botResponse });

    saveCurrentChatSession();
    document.getElementById('user-input').value = '';
}

// Function to generate bot response
function generateBotResponse(input) {
    input = input.toLowerCase();

    // Handle greetings
    if (input.includes('hi') || input.includes('hello')) {
        return responseLogic;
    } else if (input.includes('how are you')) {
        return "I'm just a program, but thanks for asking!";
    } else if (input.includes('bye')) {
        return "Goodbye! Have a great day!";
    }

    // Handle remembering data
    if (input.includes('remember') || input.includes('save')) {
        const match = input.match(/(?:remember|save)\s+(.+)$/i); // Extract text after "remember" or "save"
        if (match) {
            const keyMatch = input.match(/(?:about|for|this)\s+(\w+)/i); // Extract key (e.g., "pancard," "phone")
            const key = keyMatch ? keyMatch[1].toLowerCase() : "general";
            const value = match[1].trim();

            rememberedData[key] = value;
            localStorage.setItem('rememberedData', JSON.stringify(rememberedData));
            return `Got it! I've saved "${value}" under "${key}".`;
        }
        return "Sorry, I couldn't understand what to remember. Please try again.";
    }

    // Handle retrieving remembered data
    if (input.includes('what did i say') || input.includes('what did i tell you') || input.includes('what did i save')) {
        const keyMatch = input.match(/(?:about|for|this)\s+(\w+)/i); // Extract key (e.g., "pancard," "phone")
        const key = keyMatch ? keyMatch[1].toLowerCase() : "general";

        const value = rememberedData[key];
        if (value) {
            return `You told me to remember "${value}" for "${key}".`;
        }
        return `I don't have anything saved for "${key}".`;
    }

    return "I'm not sure how to respond to that.";
}

// Function to append message to chat box
function appendMessage(sender, message) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
    messageElement.innerText = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
}

// Function to update chat history list
function updateHistoryList() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    chatSessions.forEach((session, index) => {
        const historyItem = document.createElement('div');
        historyItem.classList.add('history-item');
        historyItem.innerText = `Chat ${index + 1}`;
        historyItem.onclick = () => loadChatSession(index);
        historyList.appendChild(historyItem);
    });
}

// Function to save the current chat session
function saveCurrentChatSession() {
    chatSessions.push(currentChatSession);
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    updateHistoryList();
}

// Function to start a new chat session
function startNewChat() {
    if (currentChatSession.length > 0) {
        saveCurrentChatSession();
        currentChatSession = [];
        document.getElementById('chat-box').innerHTML = ''; // Clear the chat box
        alert("New chat started. Previous chat saved as Chat " + chatSessions.length);
    } else {
        alert("No active chat to save. Starting a new chat.");
    }
}

// Function to load a chat session from history
function loadChatSession(index) {
    currentChatSession = chatSessions[index];
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = ''; // Clear the chat box
    currentChatSession.forEach(item => {
        appendMessage(item.sender, item.message);
    });
}

// Function to clear chat history and remembered data
function clearHistory() {
    if (confirm("Are you sure you want to clear all chat history and remembered data?")) {
        chatSessions = [];
        currentChatSession = [];
        rememberedData = {};
        localStorage.removeItem('chatSessions');
        localStorage.removeItem('rememberedData');
        document.getElementById('chat-box').innerHTML = ''; // Clear the chat box
        updateHistoryList();
        alert("Chat history and remembered data cleared successfully!");
    }
}

// Function to save response logic
function saveResponseLogic() {
    const newLogic = document.getElementById('response-editor').value.trim();
    if (newLogic) {
        responseLogic = newLogic;
        localStorage.setItem('responseLogic', responseLogic);
        alert("Response logic saved successfully!");
    } else {
        alert("Response logic cannot be empty!");
    }
}

// Swipe Gesture Detection
let startX = 0;
let isSwiping = false;

document.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isSwiping = true;
});

document.addEventListener('touchmove', (e) => {
    if (!isSwiping) return;
    const currentX = e.touches[0].clientX;
    const deltaX = startX - currentX;

    // Detect swipe direction
    if (deltaX > 50 && document.getElementById('sidebar').classList.contains('open')) {
        // Swipe left to close sidebar
        toggleSidebar();
        isSwiping = false;
    } else if (deltaX < -50 && !document.getElementById('sidebar').classList.contains('open')) {
        // Swipe right to open sidebar
        toggleSidebar();
        isSwiping = false;
    }
});

document.addEventListener('touchend', () => {
    isSwiping = false;
});