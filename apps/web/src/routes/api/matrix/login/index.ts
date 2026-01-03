import type { RequestHandler } from "@builder.io/qwik-city";

export const onPost: RequestHandler = async ({ cookie, json }) => {
  const payloadToken = cookie.get("payload-token")?.value;

  if (!payloadToken) {
    return json(401, { message: "Unauthorized" });
  }

  try {
    const payloadUrl = process.env.PUBLIC_PAYLOAD_URL || 'http://localhost:3001';
    const meResponse = await fetch(`${payloadUrl}/api/users/me`, {
      headers: {
        Cookie: `payload-token=${payloadToken}`,
      },
    });

    if (!meResponse.ok) {
      return json(401, { message: "Invalid session" });
    }

    const user = await meResponse.json();

    if (!user) {
      return json(401, { message: "Unauthorized" });
    }

    // Assumes MATRIX_HOMESERVER_URL and MATRIX_ADMIN_TOKEN are in your .env
    const homeserverUrl = process.env.MATRIX_HOMESERVER_URL;
    const adminToken = process.env.MATRIX_ADMIN_TOKEN;

    if (!homeserverUrl || !adminToken) {
      console.error("Matrix homeserver URL or admin token is not configured.");
      return json(500, { message: "Matrix integration not configured." });
    }

    // This is a placeholder for user creation/login logic.
    // A proper implementation would use the Synapse Admin API or similar to
    // create a user if they don't exist, and then get an access token for them.
    
    // Example with Synapse Admin API:
    // 1. Create user (or ignore if they exist)
    // 2. Impersonate to get a token
    
    // For this example, we'll return dummy data.
    const matrixUserId = `@${user.email.split('@')[0]}:${homeserverUrl.split('//')[1]}`;
    const loginData = {
      access_token: "dummy_access_token_for_" + user.email,
      user_id: matrixUserId,
    };


    json(200, {
      accessToken: loginData.access_token,
      userId: loginData.user_id,
      homeserverUrl: homeserverUrl,
    });
  } catch (error) {
    console.error("Matrix login failed:", error);
    json(500, { message: "Matrix login failed." });
  }
};

