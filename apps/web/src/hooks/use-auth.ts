import { useStore, useVisibleTask$, $ } from "@builder.io/qwik";
import type { User } from "../contexts/auth-context";

export const useAuthStore = () => {
  const authStore = useStore({
    user: null as User | null,
    loading: true,
    error: null as string | null,
  });

  const checkAuthStatus = $(async () => {
    try {
      // Check if user is authenticated by making a request to the CMS
      const response = await fetch(`${process.env.PUBLIC_PAYLOAD_URL || 'http://localhost:3001'}/api/users/me`, {
        credentials: 'include', // Include cookies for authentication
      });

      if (response.ok) {
        const userData = await response.json();
        authStore.user = {
          id: userData.id,
          email: userData.email,
          name: userData.name || userData.email,
        };
      } else {
        authStore.user = null;
      }
    } catch (error) {
      authStore.error = error instanceof Error ? error.message : 'Failed to check authentication status';
      authStore.user = null;
    } finally {
      authStore.loading = false;
    }
  });


  const zitadelLogin = $(async () => {
    try {
      authStore.loading = true;
      authStore.error = null;

      // Redirect to ZITADEL for authentication via Payload CMS
      window.location.href = `${process.env.PUBLIC_PAYLOAD_URL || 'http://localhost:3001'}/api/auth/zitadel`;
    } catch (error) {
      authStore.error = error instanceof Error ? error.message : 'ZITADEL login failed';
      authStore.user = null;
      authStore.loading = false;
    }
  });

  const logout = $(async () => {
    try {
      authStore.loading = true;
      authStore.error = null;

      // Logout from Payload CMS
      const response = await fetch(`${process.env.PUBLIC_PAYLOAD_URL || 'http://localhost:3001'}/api/users/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        authStore.user = null;
        // Redirect to login page after successful logout
        window.location.href = '/login';
      } else {
        authStore.error = 'Logout failed';
      }
    } catch (error) {
      authStore.error = error instanceof Error ? error.message : 'Logout failed';
    } finally {
      authStore.loading = false;
    }
  });

  // Check auth status on component mount
  useVisibleTask$(async () => {
    try {
      // Add a small delay to ensure the DOM is ready
      await new Promise(resolve => setTimeout(resolve, 10));
      await checkAuthStatus();
    } catch (error) {
      // Ensure loading is set to false even if there's an error
      authStore.loading = false;
      authStore.error = error instanceof Error ? error.message : 'Failed to check authentication status';
    }
  });

  return {
    authStore,
    zitadelLogin,
    logout,
    checkAuthStatus,
  };
};