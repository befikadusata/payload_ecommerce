import { component$, useStore, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Link } from "@builder.io/qwik-city";
import { Card, Button, Input } from "@acme/ui";

export default component$(() => {
  const formState = useStore({
    name: "",
    email: "",
    password: "",
  });

  const handleRegister = $(() => {
    // For now, we'll just log the registration details
    console.log("Name:", formState.name);
    console.log("Email:", formState.email);
    console.log("Password:", formState.password);
    alert("Registration is not implemented yet.");
  });

  return (
    <div class="container mx-auto px-4 py-8 flex justify-center">
      <Card class="max-w-md w-full p-8">
        <h1 class="text-3xl font-bold mb-2 text-center">Create an Account</h1>
        <p class="text-gray-500 mb-6 text-center">
          Join us and start shopping!
        </p>

        <form class="space-y-4" preventdefault:submit onSubmit$={handleRegister}>
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <Input
              type="text"
              id="name"
              class="mt-1 w-full"
              value={formState.name}
              onInput$={(e) =>
                (formState.name = (e.target as HTMLInputElement).value)
              }
              required
            />
          </div>

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
            Sign Up
          </Button>
        </form>

        <div class="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Register | E-commerce Store",
  meta: [
    {
      name: "description",
      content: "Create an account to join our e-commerce store.",
    },
  ],
};