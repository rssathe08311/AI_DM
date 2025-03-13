/*********************************************************
     *  1) Character Creation & Setup
     *********************************************************/
let messages = [];

document.getElementById('charForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const charName = document.getElementById('charName').value.trim();
  const charRace = document.getElementById('charRace').value.trim();
  const charClass = document.getElementById('charClass').value.trim();
  const adventureType = document.getElementById('adventureType').value;

  // Build a system message describing the scenario:
  const systemContent = `
    You are a creative and helpful AI Dungeon Master.
    The player has created a character:
    - Name: ${charName}
    - Race: ${charRace}
    - Class: ${charClass}
    They want a ${adventureType} style adventure.
    Provide a brief introduction and be ready to guide them through the story.
  `;

  // Reset the messages array
  messages = [
    { role: "system", content: systemContent }
  ];

  // Optionally: Immediately fetch an intro from the AI
  const intro = await getAIResponse(messages);
  if (intro) {
    // Push the AI's response as an assistant message
    messages.push({ role: "assistant", content: intro });
  }

  // Switch the display to the chat
  document.getElementById('charCreationContainer').style.display = 'none';
  document.getElementById('chatContainer').style.display = 'block';

  // Render the conversation so far
  renderConversation();
});

/*********************************************************
 * Audio Interaction
 *********************************************************/
const audioElement = document.querySelector('audio');
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();

let sourceNode = audioCtx.createMediaElementSource(audioElement);
sourceNode.connect(audioCtx.destination);

// List of audio files in order
//due to udio daily limit only 6
const audioFiles = [
    "/audio/song1.mp3",
    "/audio/song2.mp3",
    "/audio/song3.mp3",
    "/audio/song4.mp3",
    "/audio/song5.mp3",
    "/audio/song6.mp3"
];

let currentTrack = 0;
let audioStarted = false;

// Function to start playback
function startAudioPlayback() {
    if (!audioStarted) { // Only start once
        audioElement.src = audioFiles[currentTrack]; // Set the first track
        audioElement.play().then(() => {
            console.log("Audio started playing");
        }).catch(error => {
            console.log("Autoplay prevented: User interaction needed", error);
        });
        audioStarted = true;
    }
}

// Automatically play the next track when the current one ends
audioElement.onended = () => {
    currentTrack = (currentTrack + 1) % audioFiles.length; // Loop back to first track after last one
    audioElement.src = audioFiles[currentTrack]; // Change audio source
    audioElement.play();
};

// Resume AudioContext if it's suspended (Chrome autoplay fix)
audioElement.onplay = () => {
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }
};

// Listen for **any user interaction** to start playback
window.addEventListener("click", startAudioPlayback);
window.addEventListener("keydown", startAudioPlayback);

/*********************************************************
 *  2) Render Conversation
 *********************************************************/
 function renderConversation() {
  const convoDiv = document.getElementById('conversation');
  convoDiv.innerHTML = '';

  messages.forEach((msg) => {
    const msgDiv = document.createElement('div');

    if (msg.role === 'system') {
      msgDiv.classList.add('system-message');
      msgDiv.innerHTML = `System: ${msg.content}`;
    } else if (msg.role === 'user') {
      msgDiv.classList.add('user-message');
      msgDiv.innerHTML = `<strong>You:</strong> ${msg.content}`;
    } else if (msg.role === 'assistant') {
      msgDiv.classList.add('assistant-message');
      if (msg.content.includes('<img')) {
        msgDiv.innerHTML = `<strong>AI DM:</strong><br>${msg.content}`;
      } else {
        msgDiv.innerHTML = `<strong>AI DM:</strong> ${msg.content}`;
      }
    }

    convoDiv.appendChild(msgDiv);
  });

  convoDiv.scrollTop = convoDiv.scrollHeight;
}

/*********************************************************
 *  3) Chat Interaction
 *********************************************************/
document.getElementById('chatForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const userInput = document.getElementById('message');
  const content = userInput.value.trim();
  if (!content) return;

  // Add user's message to conversation
  messages.push({ role: "user", content });
  userInput.value = '';
  renderConversation();

  // Special check if user typed "show me"
  if (content.toLowerCase() === 'show me') {
    // 1) Grab the last AI DM message (the last 'assistant' role)
    const lastAssistantMsg = messages
      .filter((m) => m.role === 'assistant')
      .pop();
    if (!lastAssistantMsg) {
      // No AI message yet, do nothing or respond with an error
      messages.push({ role: 'assistant', content: "There's nothing to show yet!" });
      renderConversation();
      return;
    }

    // 2) Summarize it into a short image prompt using the LLM
    // We'll ask the LLM to "convert the last DM message into a short image prompt"
    const summarizeRequest = {
      role: 'user',
      content: `Using this format Description: and then the prompt, Please convert the following scene description into a concise image prompt for an art generator: "${lastAssistantMsg.content}"`
    };

    // Log the user request to the console (instead of showing in chat)
    console.log("Summarize Request:", summarizeRequest);

    // Call LLM with a temporary array that includes the existing conversation + our new request
    const tempMessages = [...messages, summarizeRequest];
    const summary = await getAIResponse(tempMessages);

    // Also log the summary response to the console, instead of pushing it to chat
    console.log("Summary from LLM:", summary);

    // 3) Immediately indicate "Generating image..." in chat
    const generatingMsg = { role: 'assistant', content: 'Generating image...' };
    messages.push(generatingMsg);
    renderConversation();

    //clean summary so that it is only a prompt 
    const regex = /Description:\s*([\s\S]*?)\s*Feel\s+free/;
    const match = summary.match(regex);
    let promptOnly = '';

    if (match && match[1]) {
      // match[1] is the text inside the first pair of quotation marks
      promptOnly = match[1];
    } else {
      // If no quotes were found, just fallback to the entire summary or handle the error.
      promptOnly = summary;
    }

    // 4) Call the /image endpoint with the summarized prompt
    try {
      const response = await fetch('/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptOnly, n: 1, size: '512x512' }),
      });

      const data = await response.json();

      // Remove the "Generating image..." message
      const genIndex = messages.indexOf(generatingMsg);
      if (genIndex !== -1) {
        messages.splice(genIndex, 1);
      }

      if (data.error) {
        messages.push({ role: 'assistant', content: `Image generation error: ${data.error}` });
      }
      else if (data.images && data.images.length > 0) {
        // Insert the image as HTML in a new assistant message
        const imageUrl = data.images[0].url;
        const imgTag = `<img src="${imageUrl}" alt="Generated Image" style="max-width:100%;" />`;
        messages.push({ role: 'assistant', content: imgTag });
      }
    } catch (err) {
      console.error('Image generation error:', err);
      // Remove the "Generating image..." message
      const genIdx = messages.indexOf(generatingMsg);
      if (genIdx !== -1) {
        messages.splice(genIdx, 1);
      }
      messages.push({ role: 'assistant', content: 'Failed to generate image.' });
    }
    renderConversation();
    return; // Skip the normal AI reply below
  }

  // If NOT "show me," get normal AI response
  const aiReply = await getAIResponse(messages);
  if (aiReply) {
    messages.push({ role: "assistant", content: aiReply });
  }
  renderConversation();
});

// Helper to call /chat
async function getAIResponse(conversation) {
  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // We send the entire conversation so far
      body: JSON.stringify({ messages: conversation }),
    });
    const data = await response.json();
    return data.assistantMessage; // Could be undefined if error
  } catch (err) {
    console.error('Error while fetching AI response:', err);
    return 'Oops, something went wrong.';
  }
}


/*********************************************************
 *  4) Image Generation
 *********************************************************/
document.getElementById('imageForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const prompt = document.getElementById('imagePrompt').value;
  const n = parseInt(document.getElementById('imageCount').value, 10);
  const size = document.getElementById('imageSize').value;

  const response = await fetch('/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, n, size }),
  });

  const data = await response.json();
  const imageContainer = document.getElementById('imageResult');
  imageContainer.innerHTML = '';

  if (data.error) {
    imageContainer.innerText = data.error;
    return;
  }

  if (data.images && data.images.length > 0) {
    data.images.forEach((imgObj) => {
      const img = document.createElement('img');
      img.src = imgObj.url;
      img.style.display = 'block';
      img.style.marginBottom = '1rem';
      imageContainer.appendChild(img);
    });
  }
});