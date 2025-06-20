"use client";

import { CreateForm } from "@/components/form/CreateForm";
import { GalleryVerticalEnd } from "lucide-react";
import { z } from "zod";

const authSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email(),
  password: z.string().min(6),
});

export default function LoginPage() {

  return (
     <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <CreateForm
                schema={authSchema}
                fields={[
                    { name: "name", type: "text", label: "Name", placeholder: "John Doe" },
                    { name: "email", type: "email", label: "Email", placeholder: "m@example.com" },
                    { name: "password", type: "password", label: "Password" },
                ]}
                onSubmit={() => {}}
                loading={false}
                submitLabel={"Login"}
                title={"Login to your account"}
                subtitle={"Enter your email below to login"}
            />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-black lg:block">
         <a href="#" className="flex justify-end  m-10 items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-7" />
            </div>
            <p className="text-white text-lg">GenRAG</p>
        </a>
        <div className="absolute bottom-0 right-0 text-white mx-12 my-4">
          <p className="text-lg">
            Acme Inc
            “This library has saved me countless hours of work and helped me deliver stunning designs to my clients faster than ever before.”

          </p>
          <p className="text-sm mt-4">
            Sofia Davis
          </p>
        </div>
      </div>
    </div>
  )
}