import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodType } from "zod";

export function useCreateForm<T extends Record<string, unknown>>(schema: ZodType<T, any, any>) {
  const methods = useForm<T>({
    resolver: zodResolver(schema),
  });

  return {
    ...methods,
    errors: methods.formState.errors as FieldErrors<T>,
  };
}