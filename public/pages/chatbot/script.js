const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Store the ongoing conversation history for Gemini API
const conversation = [];

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // 1. Add user message to the chat container
  appendMessage('user', userMessage);
  
  // Clear the input field
  input.value = '';

  // 2. Add the user's message to the conversation history
  conversation.push({ role: 'user', text: userMessage });

  // 3. Show a temporary "Thinking..." bot message in the chat box
  const thinkingMessage = appendMessage('bot', 'Thinking...');

  // Disable form input and send button during the network request
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = true;
  input.disabled = true;

  try {
    // 4. Send the user's message as a POST request to /api/chat
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ conversation })
    });

    if (!response.ok) {
      let errorMessage = `Server returned HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (_) {
        // Fallback to default message if parsing JSON fails
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (data && data.result) {
      // 5. Replace the "Thinking..." message with the AI's reply
      thinkingMessage.textContent = data.result;

      // Add the model's reply to the conversation history
      conversation.push({ role: 'model', text: data.result });
    } else {
      throw new Error('Invalid response payload');
    }
  } catch (error) {
    console.error('Error communicating with Gemini chatbot API:', error);
    // 6. Handle error state in the chat box
    thinkingMessage.textContent = error.message || 'Failed to get response from server.';
  } finally {
    // Re-enable user input and focus it
    if (submitButton) submitButton.disabled = false;
    input.disabled = false;
    input.focus();

    // Ensure the chat container stays scrolled to the bottom
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});

/**
 * Appends a message to the chat box.
 * Wraps the message inside a clearing container to prevent floating layout issues.
 * 
 * @param {'user' | 'bot'} sender 
 * @param {string} text 
 * @returns {HTMLDivElement} The inner message element, allowing content updates.
 */
function appendMessage(sender, text) {
  // Create a block-level container to clear floats
  const container = document.createElement('div');
  container.style.clear = 'both';
  container.style.display = 'flow-root';
  container.style.width = '100%';

  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;

  container.appendChild(msg);
  chatBox.appendChild(container);
  chatBox.scrollTop = chatBox.scrollHeight;

  return msg;
}

