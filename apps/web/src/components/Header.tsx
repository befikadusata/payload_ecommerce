import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { useAuthStore } from "~/hooks/use-auth";
import { Button } from "@acme/ui";

export const Header = component$(() => {
  const { authStore, logout } = useAuthStore();

  return (
    <header class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" class="text-xl font-bold text-blue-600">
          E-commerce Store
        </Link>
        
        <nav>
          <ul class="flex items-center space-x-6">
            <li><Link href="/" class="text-gray-600 hover:text-blue-600">Home</Link></li>
            
            {authStore.user ? (
              <>
                <li><Link href="/protected" class="text-gray-600 hover:text-blue-600">Dashboard</Link></li>
                <li>
                  <Button
                    variant="secondary"
                    onClick$={async () => {
                      await logout();
                    }}
                  >
                    Logout
                  </Button>
                </li>
              </>
            ) : (
              <li>
                <Link href="/login">
                  <Button variant="primary">Login</Button>
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
});