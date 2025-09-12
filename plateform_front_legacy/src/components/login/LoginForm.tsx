"use client";

import { CreateForm } from "@/src/components/form/CreateForm";
import { useGetErrorMessageRequest } from "@/src/hooks/useGetErrorMessageRequest";
import { useLocalStorage } from "@/src/hooks/useLocalStorage";
import { ToastType, useThemedToast } from "@/src/hooks/useThemedToast";
import { useLoginMutation } from "@/src/services/auth/auth";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export function LoginForm() {
  const [login, { isLoading }] = useLoginMutation();
  const { toast } = useThemedToast();
  const [email, setEmail, removeEmail] = useLocalStorage("login-email", "");
  const [password, setPassword, removePassword] = useLocalStorage("login-password", "");

  const handleSubmit = async (values: any) => {
    try {
      const res = await login(values).unwrap();
      removeEmail();
      removePassword();

      toast({
        title: "Login successful",
        status: ToastType.Success,
        duration: 5000,
        position: "bottom-right",
        isClosable: true,
      });

    } catch (err) {
        const { errorMessage } = useGetErrorMessageRequest(err);

        toast({
          title: "Login failed",
          description: errorMessage,
          status: ToastType.Error,
          duration: 9000,
          position: "bottom-right",
          isClosable: true,
          CtaProperties: {
            label: "Retry",
            onClick: () => {
              handleSubmit(values);
            }
          },
        });
    }
  };

  return (
    <div className="w-full max-w-md">
      <CreateForm
        schema={authSchema}
        fields={[
          { name: "email", type: "email", label: "Email", placeholder: "m@example.com", onChangeLocalStorage: setEmail },
          { name: "password", type: "password", label: "Password" , placeholder: "Enter your password", onChangeLocalStorage: setPassword }
        ]}
        onSubmit={handleSubmit}
        loading={isLoading}
        submitLabel={"Login"}
        title={"Login to your account"}
        subtitle={"Enter your email below to login"}
        defaultValues={{ email, password } as any}
      />
    </div>
  );
}