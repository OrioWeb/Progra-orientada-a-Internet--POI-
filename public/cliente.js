const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username-input');
const currentUserSpan = document.getElementById('current-user');
const logoutBtn = document.getElementById('logout-btn');

const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');

let username = localStorage.getItem('chatUsername') || '';
let ws = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

if (username) {
    connectToChat();
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newUsername = usernameInput.value.trim();
    if (newUsername) {
        username = newUsername;
        localStorage.setItem('chatUsername', username);
        connectToChat();
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('chatUsername');
    username = '';
    if (ws) {
        ws.close();
    }
    messages.innerHTML = '';
    loginScreen.style.display = 'flex';
    chatScreen.style.display = 'none';
    usernameInput.value = '';
    reconnectAttempts = 0;
});

function connectToChat() {
    loginScreen.style.display = 'none';
    chatScreen.style.display = 'flex';
    currentUserSpan.textContent = username;
    
    try {
        ws = new WebSocket(`ws://${location.host}`);

        ws.onopen = () => {
            console.log('Connected to chat');
            reconnectAttempts = 0;
            
            // Enviar nombre de usuario al servidor al conectarse
            ws.send(JSON.stringify({ 
                TYPE: 'login',
                username: username 
            }));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                // Manejar errores del servidor
                if (data.TYPE === 'error') {
                    showError(data.error);
                    return;
                }
                
                // Manejar historial de mensajes
                if (data.TYPE === 'mensaje') {
                    data.messages.forEach(msg => {
                        displayMessage(msg);
                    });
                    window.scrollTo(0, document.body.scrollHeight);
                    return;
                }
                
                // Manejar mensajes regulares
                displayMessage(data);
            } catch (error) {
                console.error('Error processing message:', error);
            }
        };

        ws.onclose = (event) => {
            console.log('Disconnected from chat');
            
            // Intentar reconectar si no fue un cierre normal
            if (!event.wasClean && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttempts++;
                console.log(`Reconnecting... (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
                showError(`Conexión perdida. Reintentando... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
                
                setTimeout(() => {
                    connectToChat();
                }, RECONNECT_DELAY);
            } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                showError('No se pudo reconectar. Por favor, recarga la página.');
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    } catch (error) {
        console.error('Error connecting to chat:', error);
        showError('Error al conectar con el servidor');
    }
}

function displayMessage(msg) {
    const item = document.createElement('li');
    const isOwnMessage = msg.username === username;
    
    if (isOwnMessage) {
        item.innerHTML = `<strong>Tú</strong> <small>[${msg.timestamp}]</small>: ${msg.text}`;
        item.classList.add('sent');
    } else {
        item.innerHTML = `<strong>${msg.username}</strong> <small>[${msg.timestamp}]</small>: ${msg.text}`;
    }
    
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
}

function showError(errorMessage) {
    const item = document.createElement('li');
    item.innerHTML = `<span class="error">⚠️😡 ${errorMessage}</span>`;
    item.classList.add('error-message');
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
    
    // Eliminar mensaje de error después de 5 segundos
    setTimeout(() => {
        item.remove();
    }, 5000);
}

// Manejador del formulario de mensajes
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!input.value.trim()) {
        return;
    }
    
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        showError('No estás conectado al servidor');
        return;
    }
    
    try {
        ws.send(JSON.stringify({ 
            TYPE: 'message',
            text: input.value,
            username: username
        }));
        input.value = '';
    } catch (error) {
        console.error('Error sending message:', error);
        showError('Error al enviar el mensaje');
    }
});