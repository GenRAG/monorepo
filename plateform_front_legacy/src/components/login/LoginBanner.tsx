"use client";

import { GalleryVerticalEnd } from "lucide-react";

export function LoginBanner() {
  return (
    <div className="relative hidden bg-black lg:block">
      <a href="#" className="flex justify-end m-10 items-center gap-2 font-medium">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GalleryVerticalEnd className="size-7" />
        </div>
        <p className="text-white text-lg">GenRAG</p>
      </a>
      <div className="absolute bottom-0 right-0 text-white mx-12 my-4">
        <p className="text-lg">Designed by you, powered by GenRAG</p>
      </div>
    </div>
  );
}
