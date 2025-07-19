import { Elysia, t } from "elysia";
import { env } from "@yolk-oss/elysia-env";
import { createClient } from '@supabase/supabase-js';

const app = new Elysia()
  .use(
    env({
      SUPABASE_URL: t.String(),
      SUPABASE_ANON_KEY: t.String(),
    })
  )
  .derive(({ env }) => {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

    return {
      supabase,
    };
  })
  .get("/", ({ supabase }) => {
    // 이제 컨텍스트에서 직접 supabase 클라이언트를 사용할 수 있습니다.
    console.log('Supabase client instance:', supabase);
    return "Hello Elysia";
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
