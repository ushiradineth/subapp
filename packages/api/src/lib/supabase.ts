import { createClient } from "@supabase/supabase-js";

import { env } from "../../env.mjs";

console.log(env);

export const supabase = createClient(`https://${env.SUPABASE_PROJECT}.supabase.co`, env.ANON_KEY);

export const deleteFiles = async (bucket: string, path: string) => {
  const { data } = await supabase.storage.from(bucket).list(path);
  const filesToRemove = data?.map((x) => `${path}/${x.name}`);

  if (filesToRemove) await supabase.storage.from(bucket).remove(filesToRemove);
};
