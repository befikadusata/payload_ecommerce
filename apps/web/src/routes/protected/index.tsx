import { component$, useSignal, useTask$, useStyles$ } from "@builder.io/qwik";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import { Link, redirect } from "@builder.io/qwik-city";
import { useAuthStore } from "~/hooks/use-auth";
import { Card, Button } from "@acme/ui";

export const onGet: RequestHandler = async ({ redirect, cookie }) => {
  // Check if user is authenticated by checking for auth cookie
  const token = cookie.get('payload-token');

  if (!token) {
    throw redirect(302, '/login');
  }
};

export default component$(() => {
  const { authStore, logout } = useAuthStore();
  const message = useSignal('');

  useTask$(async () => {
    // Fetch protected data for authenticated users
    try {
      const response = await fetch(`${process.env.PUBLIC_PAYLOAD_URL || 'http://localhost:3001'}/api/users/me`, {
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        message.value = `Welcome back, ${userData.name || userData.email}! This is a protected page.`;
      } else {
        message.value = 'Unable to fetch user data';
      }
    } catch (error) {
      message.value = 'Error fetching protected data';
    }
  });

  return (
    <div class="container mx-auto px-4 py-8">
      <Card class="max-w-2xl mx-auto p-6">
        <h1 class="text-2xl font-bold mb-4">Protected Page</h1>
        
        <p class="mb-6">{message.value}</p>
        
        <div class="flex gap-4">
          <Link href="/">
            <Button variant="secondary">Go Home</Button>
          </Link>
          
          <Button
            variant="danger"
            onClick$={async () => {
              await logout();
            }}
          >
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Protected Page | E-commerce Store",
  meta: [
    {
      name: "description",
      content: "This is a protected page that requires authentication",
    },
  ],
};