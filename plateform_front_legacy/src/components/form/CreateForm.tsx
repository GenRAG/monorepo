"use client";

import { FieldErrors } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Input } from "@/src/components/ui/Input";
import { Label } from "@/src/components/ui/Label";
import { Button } from "@/src/components/ui/Button";
import { ZodType } from "zod";
import { TriangleAlert } from "lucide-react";
import { useCreateForm } from "@/src/hooks/useCreateForm";

type FieldConfig = {
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password";
  condition?: boolean;
  onChangeLocalStorage?: (value: string) => void;
};

type CreateFormProps<T extends Record<string, unknown>> = {
  schema: ZodType<T, any, any>;
  fields: FieldConfig[];
  onSubmit: (values: T) => void;
  submitLabel?: string;
  loading?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
  defaultValues?: Partial<T>;
};

export function CreateForm<T extends Record<string, unknown>>({
  schema,
  fields,
  onSubmit,
  submitLabel = "Submit",
  loading = false,
  title,
  subtitle,
  className,
  defaultValues = {},
}: CreateFormProps<T>) {
  const { register, handleSubmit, errors } = useCreateForm<T>(schema, defaultValues);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("flex flex-col gap-6", className)}>
      {title && (
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}

      <div className="grid gap-6">
        {fields.map(
          (field) =>
            field.condition !== false && (
              <div key={field.name} className="grid gap-1">
                <Label htmlFor={field.name}>{field.label}</Label>
                <Input
                  id={field.name}
                  type={field.type ?? "text"}
                  placeholder={field.placeholder}
                  {...register(field.name as import("react-hook-form").Path<T>)}
                  onChange={(e) => {
                    register(field.name as import("react-hook-form").Path<T>).onChange(e);
                    field.onChangeLocalStorage?.(e.target.value);
                  }}
                />
                {errors?.[field.name] && (
                  <div className="flex">
                    <TriangleAlert
                        className="inline mr-1 size-4 text-red-500"
                        aria-hidden="true"
                    />
                    <p className="pl-1 text-sm text-red-500 font-semibold">
                      {
                        (errors as FieldErrors<T>)[field.name]?.message as string
                      }
                    </p>
                  </div>
                )}
              </div>
            )
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Loading..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
