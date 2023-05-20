import React from "react";
import { useRouter } from "next/router";
import { ChevronLeft, ChevronRight } from "lucide-react";

function PageNumbers(props: { pageNumber: number; count: number; itemsPerPage: number; route: string }) {
  const router = useRouter();

  return (
    <div className="m-8 flex w-40 select-none justify-center">
      <div className="flex">
        {props.pageNumber !== 1 ? <ChevronLeft onClick={() => router.push(`${props.route}?page=${props.pageNumber - 1}`)} /> : <p className="w-6"></p>}

        {[...Array(Math.ceil(props.count / props.itemsPerPage))].map((e, i) => (
          <button className="mx-2" key={i} onClick={() => router.push(`${props.route}?page=${i + 1}`)}>
            {i + 1}
          </button>
        ))}

        {props.pageNumber !== props.count ? <ChevronRight onClick={() => router.push(`${props.route}?page=${props.pageNumber + 1}`)} /> : <p className="w-6"></p>}
      </div>
    </div>
  );
}

export default PageNumbers;
