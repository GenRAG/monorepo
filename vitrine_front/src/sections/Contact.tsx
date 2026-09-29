import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { contact } from "../content";
import { Panel } from "../components/Panel";
import { SectionIntro } from "../components/ui";
import { reveal } from "../components/reveal";
import styles from "./Contact.module.css";

type State = "idle" | "loading" | "success" | "error";

const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function Contact() {
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ email?: string; company?: string }>({});

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (data.get("website")) return; // pot de miel anti-spam
    const payload = {
      email: String(data.get("email") ?? "").trim(),
      company: String(data.get("company") ?? "").trim(),
      role: String(data.get("role") ?? "").trim(),
    };

    const nextErrors = {
      email: EMAIL_RE.test(payload.email) ? undefined : contact.invalidEmail,
      company: payload.company ? undefined : contact.requiredCompany,
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.company) return;

    if (!ENDPOINT) {
      setState("error");
      setMessage(contact.notConfigured);
      return;
    }

    setState("loading");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState("success");
      setMessage(contact.success);
    } catch {
      setState("error");
      setMessage(contact.error);
    }
  };

  return (
    <Panel id="contact" label="Contact" tone="slab" glow className={styles.grid}>
      <SectionIntro index={10} eyebrow={contact.eyebrow} title={contact.title} text={contact.text} />

      <form className={styles.form} onSubmit={onSubmit} noValidate {...reveal(3)}>
        {state === "success" ? (
          <div className={styles.success} role="status">
            <CheckCircle2 size={28} aria-hidden />
            <p>{message}</p>
          </div>
        ) : (
          <>
            <Field
              name="email"
              type="email"
              label={contact.fields.email}
              autoComplete="email"
              required
              error={errors.email}
            />
            <Field
              name="company"
              label={contact.fields.company}
              autoComplete="organization"
              required
              error={errors.company}
            />
            <Field
              name="role"
              label={contact.fields.role}
              hint={contact.fields.optional}
              autoComplete="organization-title"
            />
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              className={styles.honeypot}
              aria-hidden
            />

            <button type="submit" className={styles.submit} disabled={state === "loading"}>
              {state === "loading" ? (
                <>
                  <Loader2 size={18} className={styles.spin} aria-hidden /> {contact.sending}
                </>
              ) : (
                <>
                  {contact.submit} <ArrowRight size={18} aria-hidden />
                </>
              )}
            </button>
            <p className={styles.error} role="alert">
              {state === "error" && (
                <>
                  <AlertCircle size={16} aria-hidden /> {message}
                </>
              )}
            </p>
          </>
        )}
      </form>
    </Panel>
  );
}

interface FieldProps {
  name: string;
  label: string;
  type?: string;
  hint?: string;
  required?: boolean;
  autoComplete?: string;
  error?: string;
}

function Field({ name, label, type = "text", hint, required, autoComplete, error }: FieldProps) {
  const id = `f-${name}`;
  return (
    <div className={styles.field}>
      <label htmlFor={id}>
        {label}
        {hint && <span className={styles.hint}> — {hint}</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
      />
      {error && (
        <span id={`${id}-err`} className={styles.fieldError}>
          {error}
        </span>
      )}
    </div>
  );
}
