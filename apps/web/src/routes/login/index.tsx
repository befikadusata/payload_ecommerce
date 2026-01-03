import { component$, useStore, $ } from "@builder.io/qwik";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import { redirect, Link } from "@builder.io/qwik-city";
import { useAuthStore } from "~/hooks/use-auth";
import { Card, Button, Input } from "@acme/ui";

export const onGet: RequestHandler = async ({ cookie }) => {
  // If user is already authenticated, redirect to protected page
  const token = cookie.get("payload-token");

  if (token) {
    throw redirect(302, "/protected");
  }
};

export default component$(() => {
  const { authStore, zitadelLogin } = useAuthStore();
  const formState = useStore({
    email: "",
    password: "",
  });

  const handleEmailLogin = $(() => {
    // For now, we'll just log the email and password
    console.log("Email:", formState.email);
    console.log("Password:", formState.password);
    alert("Email/Password login is not implemented yet.");
  });

  return (
    <div class="container mx-auto px-4 py-8 flex justify-center">
      <Card class="max-w-md w-full p-8">
        <h1 class="text-3xl font-bold mb-2 text-center">Welcome Back!</h1>
        <p class="text-gray-500 mb-6 text-center">
          Sign in to your account to continue
        </p>

        {authStore.error && (
          <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600">
            {authStore.error}
          </div>
        )}

        <form class="space-y-4" preventdefault:submit onSubmit$={handleEmailLogin}>
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <Input
              type="email"
              id="email"
              class="mt-1 w-full"
              value={formState.email}
              onInput$={(e) =>
                (formState.email = (e.target as HTMLInputElement).value)
              }
              required
            />
          </div>

          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <Input
              type="password"
              id="password"
              class="mt-1 w-full"
              value={formState.password}
              onInput$={(e) =>
                (formState.password = (e.target as HTMLInputElement).value)
              }
              required
            />
          </div>

          <Button type="submit" class="w-full py-3">
            Sign In
          </Button>
        </form>

        <div class="mt-6 relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300" />
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div class="mt-6">
          <Button
            type="button"
            variant="secondary"
            class="w-full py-3"
            onClick$={async () => {
              await zitadelLogin();
            }}
            disabled={authStore.loading}
          >
            {authStore.loading ? "Redirecting..." : "Login with ZITADEL"}
          </Button>
        </div>

        <div class="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link href="/register" class="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up
          </Link>
        </div>
      </Card>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Login | E-commerce Store",
  meta: [
    {
      name: "description",
      content: "Login to your account to access our e-commerce store.",
    },
  ],
};