import React from "react";
import Link from "next/link";

function PageNotFound() {
  return (
    <div className="flex flex-col items-center justify-center font-semibold">
      <p className="text-2xl">Page not found</p>
      <p>
        Go back to the{" "}
        <Link className="text-blue-500 hover:underline" href={"/"}>
          index page
        </Link>
      </p>
    </div>
  );
}

export default PageNotFound;
