import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Panel } from "../components/Panel";
import { SectionIntro } from "../components/ui";
import { reveal } from "../components/reveal";
import styles from "./Contact.module.css";

type State = "idle" | "loading" | "success" | "error";

const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Ouverture de la page /contact : son titre est le h1 de la page. */
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
      email: EMAIL_RE.test(payload.email) ? undefined : "Indiquez une adresse email valide.",
      company: payload.company ? undefined : "Indiquez le nom de votre entreprise.",
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.company) return;

    if (!ENDPOINT) {
      setState("error");
      setMessage("Formulaire non configuré (VITE_CONTACT_ENDPOINT manquant).");
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
      setMessage("Merci, votre demande est bien arrivée. Nous vous recontactons rapidement.");
    } catch {
      setState("error");
      setMessage("L'envoi a échoué. Réessayez dans un instant.");
    }
  };

  return (
    <Panel id="contact" label="Contact" tone="slab" glow className={styles.grid}>
      <SectionIntro
        eyebrow="Accès anticipé"
        title="Donnez à votre équipe un assistant qui connaît vos documents."
        text="Laissez-nous vos coordonnées. Nous revenons vers vous pour organiser un accès."
        as="h1"
        numbered={false}
      />

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
              label="Email professionnel"
              autoComplete="email"
              required
              error={errors.email}
            />
            <Field name="company" label="Entreprise" autoComplete="organization" required error={errors.company} />
            <Field name="role" label="Votre rôle" hint="facultatif" autoComplete="organization-title" />
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
                  <Loader2 size={18} className={styles.spin} aria-hidden /> Envoi…
                </>
              ) : (
                <>
                  Demander un accès <ArrowRight size={18} aria-hidden />
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
