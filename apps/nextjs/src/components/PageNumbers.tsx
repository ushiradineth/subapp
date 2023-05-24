import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

function PageNumbers(props: { pageNumber: number; count: number; itemsPerPage: number; path: string; params: { [key: string]: unknown } }) {
  return (
    <div className="m-8 flex w-40 select-none justify-center">
      <div className="flex">
        {props.pageNumber !== 1 ? (
          <Link href={{ href: props.path, query: { ...props.params, page: props.pageNumber - 1 } }}>
            <ChevronLeft />
          </Link>
        ) : (
          <p className="w-6"></p>
        )}

        {[...Array(Math.ceil(props.count / props.itemsPerPage))].map((e, i) => (
          <Link href={{ href: props.path, query: { ...props.params, page: i + 1 } }} className="mx-2" key={i}>
            {i + 1}
          </Link>
        ))}

        {props.pageNumber !== Math.ceil(props.count / props.itemsPerPage) ? (
          <Link href={{ href: props.path, query: { ...props.params, page: props.pageNumber + 1 } }}>
            <ChevronRight />
          </Link>
        ) : (
          <p className="w-6"></p>
        )}
      </div>
    </div>
  );
}

export default PageNumbers;
