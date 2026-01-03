import { createClient, MatrixClient, Room, MatrixEvent } from 'matrix-js-sdk';
import { useStore, useTask$, $ } from '@builder.io/qwik';

export interface MatrixMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  roomId: string;
}

export interface MatrixState {
  client: MatrixClient | null;
  isLoggedIn: boolean;
  isSyncing: boolean;
  rooms: Room[];
  messages: Record<string, MatrixMessage[]>;
  error: string | null;
}

export const useMatrixStore = () => {
  const matrixStore = useStore<MatrixState>({
    client: null,
    isLoggedIn: false,
    isSyncing: false,
    rooms: [],
    messages: {},
    error: null,
  });

  const login = $(async () => {
    if (matrixStore.isLoggedIn) {
      return;
    }

    try {
      const response = await fetch('/api/matrix/login', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to log in to Matrix');
      }

      const loginData = await response.json();

      matrixStore.client = createClient({
        baseUrl: loginData.homeserverUrl,
        accessToken: loginData.accessToken,
        userId: loginData.userId,
      });

      // Set up event listeners
      matrixStore.client.on('sync', (state) => {
        matrixStore.isSyncing = state === 'SYNCING';
      });

      // Start the client
      await matrixStore.client.startClient();

      matrixStore.isLoggedIn = true;
      matrixStore.error = null;
    } catch (error) {
      matrixStore.error = error instanceof Error ? error.message : 'Login failed';
      matrixStore.isLoggedIn = false;
    }
  });

  const logout = $(async () => {
    if (!matrixStore.client) return;

    try {
      await matrixStore.client.logout();
      matrixStore.isLoggedIn = false;
      matrixStore.client = null;
    } catch (error) {
      matrixStore.error = error instanceof Error ? error.message : 'Logout failed';
    }
  });

  const joinRoom = $(async (roomIdOrAlias: string) => {
    if (!matrixStore.client) return;

    try {
      const room = await matrixStore.client.joinRoom(roomIdOrAlias);
      matrixStore.rooms = [...matrixStore.rooms, room];
    } catch (error) {
      matrixStore.error = error instanceof Error ? error.message : 'Failed to join room';
    }
  });

  const sendMessage = $(async (roomId: string, content: string) => {
    if (!matrixStore.client) return;

    try {
      await matrixStore.client.sendEvent(
        roomId,
        'm.room.message',
        {
          msgtype: 'm.text',
          body: content,
        },
        // Generate a transaction ID
        Date.now().toString()
      );
    } catch (error) {
      matrixStore.error = error instanceof Error ? error.message : 'Failed to send message';
    }
  });

  // Listen for incoming messages
  useTask$(({ track }) => {
    track(() => matrixStore.client);

    if (matrixStore.client) {
      matrixStore.client.on('Room.timeline', (event: MatrixEvent, room: Room) => {
        if (event.getType() === 'm.room.message') {
          const message: MatrixMessage = {
            id: event.getId() || '',
            sender: event.getSender() || '',
            content: event.getContent().body || '',
            timestamp: event.getTs(),
            roomId: room.roomId,
          };

          // Update messages for this room
          const roomMessages = matrixStore.messages[room.roomId] || [];
          matrixStore.messages[room.roomId] = [...roomMessages, message];
        }
      });
    }
  });

  return {
    matrixStore,
    login,
    logout,
    joinRoom,
    sendMessage,
  };
};