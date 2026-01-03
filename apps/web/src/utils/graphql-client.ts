import { $, createContext, useContext, useSignal, useTask$ } from "@builder.io/qwik";

export const useGraphQL = () => {
  const executeQuery = $(async (query: string, variables: any = {}) => {
    const response = await fetch(`${import.meta.env.PUBLIC_PAYLOAD_URL || 'http://localhost:3001'}/api/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`GraphQL errors: ${result.errors.map((e: any) => e.message).join(', ')}`);
    }

    return result.data;
  });

  return { executeQuery };
};