import { default as handler } from "./.open-next/worker.js";

type Env = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  [key: string]: unknown;
};

export default {
  fetch: handler.fetch,

  async scheduled(_event: unknown, env: Env, _ctx: unknown) {
    const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/site_settings?select=key&limit=1`;

    const res = await fetch(url, {
      headers: {
        apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
    });

    if (!res.ok) {
      console.error(`Supabase keep-alive 실패: HTTP ${res.status}`);
    } else {
      console.log(`Supabase keep-alive 성공: HTTP ${res.status}`);
    }
  },
};

export { DOQueueHandler } from "./.open-next/worker.js";
