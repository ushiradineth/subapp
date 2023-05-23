import { createClient } from "@supabase/supabase-js";

import { env } from "../../env.mjs";

export const supabase = createClient(`https://${env.SUPABASE_PROJECT}.supabase.co`, env.SUPABASE_ANON_KEY);

export const deleteFiles = async (bucket: string, path: string) => {
  const { data } = await supabase.storage.from(bucket).list(path);
  const filesToRemove = data?.map((x) => `${path}/${x.name}`);

  if (filesToRemove) await supabase.storage.from(bucket).remove(filesToRemove);
};
