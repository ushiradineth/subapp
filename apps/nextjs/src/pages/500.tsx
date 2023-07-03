import React from "react";
import Link from "next/link";

import { env } from "~/env.mjs";

function ServerError() {
  return (
    <div className="flex flex-col items-center justify-center font-semibold">
      <p className="text-2xl">Internal Server Error</p>
      <p>
        Contact admin at{" "}
        <Link className="text-blue-500 hover:underline" href={`mailto:${env.NEXT_PUBLIC_GMAIL_ADDRESS}`}>
          {env.NEXT_PUBLIC_GMAIL_ADDRESS}
        </Link>
      </p>
    </div>
  );
}

export default ServerError;
