import React, { useState } from "react";
import { useRouter } from "next/router";
import { SearchIcon } from "lucide-react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";

function Search(props: { search: string }) {
  const router = useRouter();
  const [intenalSearch, setIntenalSearch] = useState(props.search === "undefined" ? "" : props.search);

  console.log(props.search);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        router.push(`/product?search=${intenalSearch}`);
      }}
      className="flex items-center justify-center gap-2 py-8 w-full">
      <Input name="search" className="h-" defaultValue={props.search} placeholder="Search for product" onChange={(e) => setIntenalSearch(e.currentTarget.value)} />
      <Button type="submit" className="h-8">
        <SearchIcon className="h-4 w-4 text-black" />
      </Button>
    </form>
  );
}

export default Search;
