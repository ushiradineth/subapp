import { createClient } from "@supabase/supabase-js";

import { env } from "../../env.mjs";

export const supabase = createClient(`https://${env.NEXT_PUBLIC_SUPABASE_PROJECT}.supabase.co`, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const deleteFiles = async (bucket: string, path: string) => {
  const { data: list } = await supabase.storage.from(bucket).list(path);
  const filesToRemove = list?.map((x) => `${path}/${x.name}`);

  if (filesToRemove) {
    const { data, error } = await supabase.storage.from(bucket).remove(filesToRemove);

    if (data) {
      console.log(`Deleted file ${path} from ${bucket}`);
    }

    if (error) {
      console.log(`Failed deleting file ${path} from ${bucket}`);
    }
  }
};
