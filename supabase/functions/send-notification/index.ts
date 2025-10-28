import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WebhookPayload {
  type: string;
  table: string;
  record: any;
  old_record: any;
}

interface ExpoPushMessage {
  to: string;
  sound?: string;
  title?: string;
  body?: string;
  data?: any;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Verify authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse webhook payload
    const payload: WebhookPayload = await req.json();
    
    // Extract user_id from the record
    const userId = payload.record?.id || payload.record?.user_id;
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "No user_id found in payload" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get Supabase service role client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Fetch push tokens for the user
    const tokenResponse = await fetch(
      `${supabaseUrl}/rest/v1/push_tokens?user_id=eq.${userId}&select=token`,
      {
        headers: {
          "apikey": supabaseServiceKey,
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
      }
    );

    if (!tokenResponse.ok) {
      throw new Error("Failed to fetch push tokens");
    }

    const tokens = await tokenResponse.json();

    if (tokens.length === 0) {
      return new Response(
        JSON.stringify({ message: "No push tokens found for user" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prepare push notifications
    const messages: ExpoPushMessage[] = tokens.map((t: { token: string }) => ({
      to: t.token,
      sound: "default",
      title: "Message Read",
      body: "Your message has been read for the first time!",
      data: { userId, timestamp: new Date().toISOString() },
    }));

    // Send notifications via Expo Push API
    const expoResponse = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    const expoResult = await expoResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        sentTo: tokens.length,
        expoResponse: expoResult,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});