import { component$, useTask$ } from "@builder.io/qwik";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import { redirect } from "@builder.io/qwik-city";
import { useAuthStore } from "~/hooks/use-auth";
import { useMatrixStore } from "~/hooks/use-matrix";
import { Chat } from "~/components/Chat";
import { Card, Button } from "@acme/ui";

export const onGet: RequestHandler = async ({ cookie }) => {
  // Check if user is authenticated by checking for auth cookie
  const token = cookie.get('payload-token');
  
  if (!token) {
    throw redirect(302, '/login');
  }
};

export default component$(() => {
  const { authStore, logout } = useAuthStore();
  const { matrixStore, login: matrixLogin } = useMatrixStore();

  useTask$(({ track }) => {
    track(() => authStore.user);

    if (authStore.user && !matrixStore.isLoggedIn) {
      matrixLogin();
    }
  });

  return (
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Chat</h1>
        <div class="flex items-center gap-4">
          <span class="text-sm">Welcome, {authStore.user?.name || authStore.user?.email}</span>
          <Button
            variant="secondary"
            onClick$={async () => {
              await logout();
            }}
          >
            Logout
          </Button>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <Card class="h-full">
            <div class="p-4 border-b">
              <h2 class="text-lg font-semibold">Global Chat Room</h2>
              <p class="text-sm text-gray-600">Chat with other users in the e-commerce community</p>
            </div>
            
            <div class="p-4 h-[500px]">
              {matrixStore.isLoggedIn ? (
                <Chat />
              ) : (
                <div class="h-full flex items-center justify-center text-gray-500">
                  {matrixStore.error ? `Matrix error: ${matrixStore.error}` : 'Connecting to Matrix...'}
                </div>
              )}
            </div>
          </Card>
        </div>
        
        <div>
          <Card class="p-4">
            <h3 class="font-semibold mb-4">Chat Settings</h3>
            
            <div class="space-y-4">
              <div>
                <h4 class="font-medium mb-2">Connected Services</h4>
                <div class="flex items-center gap-2 p-2 bg-gray-100 rounded">
                  <div class="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>ZITADEL: Connected</span>
                </div>
                <div class="flex items-center gap-2 p-2 bg-gray-100 rounded mt-2">
                  <div class={`w-3 h-3 rounded-full ${authStore.user ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>Payload CMS: {authStore.user ? 'Connected' : 'Disconnected'}</span>
                </div>
                <div class="flex items-center gap-2 p-2 bg-gray-100 rounded mt-2">
                  <div class={`w-3 h-3 rounded-full ${matrixStore.isLoggedIn ? 'bg-green-500' : (matrixStore.error ? 'bg-red-500' : 'bg-yellow-500')}`}></div>
                  <span>Matrix: {matrixStore.isLoggedIn ? 'Connected' : (matrixStore.error ? 'Error' : 'Connecting...')}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Chat | E-commerce Store",
  meta: [
    {
      name: "description",
      content: "Chat with other users in the e-commerce community",
    },
  ],
};