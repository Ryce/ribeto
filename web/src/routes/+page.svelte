<script lang="ts">
  import { onMount } from 'svelte';
  import { tick } from 'svelte';

  let messages: { sender: string; text?: string; audioUrl?: string }[] = [];
  let inputMessage = '';
  let recording = false;
  let recordingStartTime: number | null = null;
  let recordingTimer: number | null = null;
  let recordingDuration = 0;
  let audioChunks: Blob[] = [];
  let mediaRecorder: MediaRecorder | null = null;

  function sendMessage() {
    if (inputMessage.trim() !== '') {
      messages = [...messages, { sender: 'user', text: inputMessage }];
      inputMessage = '';
      // Simulate a response from ChatGPT
      setTimeout(() => {
        messages = [...messages, { sender: 'bot', text: 'This is a response from ChatGPT.' }];
      }, 1000);
    }
  }

  function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
      recording = true;
      recordingStartTime = Date.now();
      recordingTimer = setInterval(() => {
        recordingDuration = Math.floor((Date.now() - (recordingStartTime || 0)) / 1000);
        tick();
      }, 1000);

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        messages = [...messages, { sender: 'user', audioUrl }];
        audioChunks = [];
      };
    });
  }

  function stopRecording() {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      recording = false;
      clearInterval(recordingTimer!);
      recordingDuration = 0;
    }
  }

  function cancelRecording() {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      recording = false;
      clearInterval(recordingTimer!);
      recordingDuration = 0;
      audioChunks = [];
    }
  }

  onMount(() => {
    // Initial bot message
    messages = [{ sender: 'bot', text: 'Hello! How can I assist you today?' }];
  });
</script>

<div
  class="flex flex-col h-screen max-w-lg mx-auto border border-gray-300 rounded-lg overflow-hidden"
>
  <div class="flex-1 p-2 overflow-y-auto">
    {#each messages as { sender, text, audioUrl }}
      <div
        class="mb-2 p-2 rounded-lg {sender === 'user'
          ? 'bg-green-200 self-end'
          : 'bg-gray-200 self-start'}"
      >
        {#if text}
          {text}
        {/if}
        {#if audioUrl}
          <audio controls src={audioUrl}></audio>
        {/if}
      </div>
    {/each}
  </div>
  <div class="flex p-2 border-t border-gray-300 items-center">
    <input
      type="text"
      bind:value={inputMessage}
      placeholder="Type a message..."
      on:keydown={(e) => e.key === 'Enter' && sendMessage()}
      class="flex-1 p-2 border border-gray-300 rounded-lg mr-2"
    />
    <button
      on:click={sendMessage}
      class="p-2 px-4 border-none rounded-lg bg-blue-500 text-white cursor-pointer mr-2"
    >
      Send
    </button>
    <div
      role="button"
      class="relative"
      tabindex="0"
      on:mousedown={startRecording}
      on:mouseup={stopRecording}
      on:mouseleave={cancelRecording}
    >
      <button class="p-2 px-4 border-none rounded-lg bg-red-500 text-white cursor-pointer">
        🎤
      </button>
      {#if recording}
        <div class="absolute left-0 top-0 mt-2 ml-2 text-red-500">
          ⏺️ {Math.floor(recordingDuration / 60)}:{recordingDuration % 60 < 10
            ? '0'
            : ''}{recordingDuration % 60}
        </div>
      {/if}
    </div>
  </div>
</div>
