import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { DISPLAY_SERIF_STYLE } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Iniciar sesión | Vanessa Trejo",
};

const FIELD_CLASSNAME =
  "mt-1 block w-full border-b border-neutral-300 bg-transparent pb-2 text-secondary placeholder:text-neutral-400 focus:border-secondary focus:outline-none";

const OUTLINE_BUTTON_CLASSNAME =
  "mt-0 flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-neutral-300 bg-primary text-sm font-medium text-secondary transition-colors hover:border-tertiary hover:text-tertiary";

function AppleIcon() {
  return (
    <svg height="18" width="18" viewBox="0 0 22.773 22.773" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M15.769,0c0.053,0,0.106,0,0.162,0c0.13,1.606-0.483,2.806-1.228,3.675c-0.731,0.863-1.732,1.7-3.351,1.573 c-0.108-1.583,0.506-2.694,1.25-3.561C13.292,0.879,14.557,0.16,15.769,0z" />
      <path d="M20.67,16.716c0,0.016,0,0.03,0,0.045c-0.455,1.378-1.104,2.559-1.896,3.655c-0.723,0.995-1.609,2.334-3.191,2.334 c-1.367,0-2.275-0.879-3.676-0.903c-1.482-0.024-2.297,0.735-3.652,0.926c-0.155,0-0.31,0-0.462,0 c-0.995-0.144-1.798-0.932-2.383-1.642c-1.725-2.098-3.058-4.808-3.306-8.276c0-0.34,0-0.679,0-1.019 c0.105-2.482,1.311-4.5,2.914-5.478c0.846-0.52,2.009-0.963,3.304-0.765c0.555,0.086,1.122,0.276,1.619,0.464 c0.471,0.181,1.06,0.502,1.618,0.485c0.378-0.011,0.754-0.208,1.135-0.347c1.116-0.403,2.21-0.865,3.652-0.648 c1.733,0.262,2.963,1.032,3.723,2.22c-1.466,0.933-2.625,2.339-2.427,4.74C17.818,14.688,19.086,15.964,20.67,16.716z" />
    </svg>
  );
}

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    // The whole form is one small card, centered in the free space below the
    // navbar.
    <div className="flex flex-1 items-center justify-center py-6">
      <div className="w-full max-w-[420px] rounded-3xl border border-neutral-200 p-8 sm:p-10">
        <h1
          className="text-4xl leading-none tracking-tight text-secondary sm:text-5xl"
          style={DISPLAY_SERIF_STYLE}
        >
          Iniciar sesión
        </h1>

        {/* Everything below except the Google button is presentational only
            — email/password, "remember me", "forgot password", "Iniciar
            sesión", and Apple are all inert placeholders for now. Only
            Google actually signs in, via the small nested form further down
            (its own server action). This container is a <div>, not a
            <form>, specifically so the decorative "Iniciar sesión" button
            can't trigger a real (if pointless) form submission/page reload
            on click. */}
        <div className="mt-8 flex flex-col gap-6">
          <label className="block">
            <span className="text-xs font-medium text-neutral-500">Correo</span>
            <input
              type="text"
              placeholder="Ingresa tu correo"
              className={FIELD_CLASSNAME}
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-neutral-500">Contraseña</span>
            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              className={FIELD_CLASSNAME}
            />
          </label>

          <div className="flex items-center justify-between gap-4 text-sm">
            <label className="flex items-center gap-2 text-neutral-600">
              <input type="checkbox" className="h-4 w-4 accent-black" />
              Recordarme
            </label>
            <span className="text-neutral-500 transition-colors hover:text-secondary">
              ¿Olvidaste tu contraseña?
            </span>
          </div>

          <button
            type="button"
            className="h-11 w-full rounded-full bg-secondary text-sm font-medium text-primary transition-colors hover:bg-tertiary"
          >
            Iniciar sesión
          </button>

          <p className="text-center text-sm text-neutral-500">
            ¿No tienes cuenta?{" "}
            <span className="font-medium text-secondary transition-colors hover:text-tertiary">
              Regístrate
            </span>
          </p>

          <div className="flex items-center gap-4 text-xs font-medium text-neutral-500">
            <span className="h-px flex-1 bg-neutral-200" />
            O con
            <span className="h-px flex-1 bg-neutral-200" />
          </div>

          <div className="flex gap-3">
            <form
              className="flex-1"
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/dashboard" });
              }}
            >
              <GoogleSignInButton />
            </form>
            <button type="button" className={`${OUTLINE_BUTTON_CLASSNAME} flex-1`}>
              <AppleIcon />
              Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
