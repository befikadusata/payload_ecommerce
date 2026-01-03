import { component$, useSignal, useTask$, $ } from "@builder.io/qwik";
import { useMatrixStore } from "~/hooks/use-matrix";
import { Card, Input, Button } from "@acme/ui";

export const Chat = component$(() => {
  const { matrixStore, initClient, joinRoom, sendMessage } = useMatrixStore();
  const messageInput = useSignal('');
  const roomId = useSignal('!public-room:matrix.org'); // Default public room
  const homeserverUrl = useSignal('https://matrix.org');

  // Initialize the Matrix client when component mounts
  useTask$(async () => {
    await initClient(homeserverUrl.value);
    // Try to join a default room
    if (matrixStore.isLoggedIn) {
      await joinRoom(roomId.value);
    }
  });

  const handleJoinRoom = $(async (e: SubmitEvent) => {
    e.preventDefault();
    if (matrixStore.isLoggedIn) {
      await joinRoom(roomId.value);
    }
  });

  const handleSendMessage = $(async (e: SubmitEvent) => {
    e.preventDefault();
    if (messageInput.value.trim() && matrixStore.isLoggedIn) {
      await sendMessage(roomId.value, messageInput.value);
      messageInput.value = '';
    }
  });

  return (
    <Card class="p-4 h-full flex flex-col">
      <h2 class="text-xl font-bold mb-4">Chat</h2>
      
      {matrixStore.error && (
        <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600">
          {matrixStore.error}
        </div>
      )}
      
      {/* Room selection */}
      <form onSubmit$={handleJoinRoom} class="mb-4 flex gap-2">
        <Input
          type="text"
          bind:value={roomId}
          placeholder="Room ID or alias"
          class="flex-grow"
        />
        <Button type="submit">Join Room</Button>
      </form>
      
      {/* Messages display */}
      <div class="flex-grow overflow-y-auto max-h-96 mb-4 border rounded p-2 bg-gray-50">
        {matrixStore.messages[roomId.value]?.length ? (
          <div class="space-y-2">
            {matrixStore.messages[roomId.value].map((msg) => (
              <div key={msg.id} class="p-2 bg-white rounded shadow-sm">
                <div class="font-semibold text-sm">{msg.sender}</div>
                <div class="text-sm">{msg.content}</div>
                <div class="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div class="text-center text-gray-500 py-8">
            {matrixStore.isLoggedIn 
              ? 'No messages yet in this room' 
              : 'Please log in to Matrix to start chatting'}
          </div>
        )}
      </div>
      
      {/* Message input */}
      <form onSubmit$={handleSendMessage} class="flex gap-2">
        <Input
          type="text"
          bind:value={messageInput}
          placeholder="Type a message..."
          class="flex-grow"
          disabled={!matrixStore.isLoggedIn}
        />
        <Button 
          type="submit" 
          variant="primary"
          disabled={!matrixStore.isLoggedIn || !messageInput.value.trim()}
        >
          Send
        </Button>
      </form>
    </Card>
  );
});