import React, { useState } from "react";
import { useRouter } from "next/router";
import { SearchIcon } from "lucide-react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";

function Search(props: { search: string; path: string; params: { [key: string]: unknown }; count: number; placeholder: string }) {
  const router = useRouter();
  const [intenalSearch, setIntenalSearch] = useState(props.search === "undefined" ? "" : props.search);

  console.log(props.search);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push({ href: props.path, query: { ...props.params, search: intenalSearch, page: 1 } });
      }}
      className="my-8 flex w-full flex-col items-center justify-center">
      <div className="flex w-full items-center justify-center gap-2">
        <Input name="search" className="h-" defaultValue={props.search} placeholder={props.placeholder} onChange={(e) => setIntenalSearch(e.currentTarget.value)} />
        <Button type="submit" className="h-8">
          <SearchIcon className="h-4 w-4 text-black" />
        </Button>
      </div>
      {!(props.search === "" || typeof props.search === "undefined") && (
        <p className="text-muted-foreground mt-4 text-sm">
          Found {props.count} result{props.count === 1 ? "" : "s"} for &quot;{props.search}&quot;
        </p>
      )}
    </form>
  );
}

export default Search;
