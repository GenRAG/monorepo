import { useForm, FieldErrors, DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodType } from "zod";

export function useCreateForm<T extends Record<string, unknown>>(
  schema: ZodType<T, any, any>,
  defaultValues?: Partial<T>
) {
  const methods = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  return {
    ...methods,
    errors: methods.formState.errors as FieldErrors<T>,
  };
}