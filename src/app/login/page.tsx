import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { BorderBeam } from "@/registry/magicui/border-beam";

// From Uiverse.io by micaelgomestavares, converted to Tailwind utilities
// (the codebase's own convention) instead of the original's plain CSS
// classes — those (.btn, .p, .span, .line) are generic enough that
// dropping them into globals.css risked leaking onto unrelated elements
// elsewhere in the app.
const FORM_FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif";

function MailIcon() {
  return (
    <svg height="20" viewBox="0 0 32 32" width="20" xmlns="http://www.w3.org/2000/svg">
      <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg height="20" viewBox="-64 0 512 512" width="20" xmlns="http://www.w3.org/2000/svg">
      <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" />
      <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 576 512" height="1em" xmlns="http://www.w3.org/2000/svg">
      <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z" />
    </svg>
  );
}

// Decorative only, like the rest of this form's own sign-in fields — see
// the note on the form below for what's actually wired up.
function AppleIcon() {
  return (
    <svg height="20" width="20" viewBox="0 0 22.773 22.773" xmlns="http://www.w3.org/2000/svg">
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
    // No background of its own — same wallpaper as the homepage, set
    // globally on <body> (see globals.css), just left to show through
    // instead of being covered by an opaque one here.
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      {/* Everything below except the Google button is presentational only
          — email/password, "remember me", "forgot password", "Sign In",
          and Apple are all inert placeholders for now. Only Google
          actually signs in, via the small nested form further down (its
          own server action), same as the rest of the app already had
          working. This container is a <div>, not a <form>, specifically
          so the decorative "Sign In" button below can't trigger a real
          (if pointless) form submission/page reload on click. */}
      <div
        className="relative flex w-full max-w-[450px] flex-col gap-2.5 overflow-hidden rounded-[20px] bg-white p-[30px] shadow-xl"
        style={{ fontFamily: FORM_FONT_STACK }}
      >
        <div className="flex flex-col">
          <label className="font-semibold text-[#151717]">Correo</label>
          <div className="mt-1 flex h-[50px] items-center rounded-[10px] border border-[#ecedec] pl-2.5 transition-colors focus-within:border-[#2d79f3]">
            <span className="text-[#151717]">
              <MailIcon />
            </span>
            <input
              type="text"
              placeholder="Ingresa tu correo"
              className="ml-2.5 h-full w-[85%] rounded-[10px] border-none outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-[#151717]">Contraseña</label>
          <div className="mt-1 flex h-[50px] items-center rounded-[10px] border border-[#ecedec] pl-2.5 transition-colors focus-within:border-[#2d79f3]">
            <span className="text-[#151717]">
              <LockIcon />
            </span>
            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              className="ml-2.5 h-full w-[85%] rounded-[10px] border-none outline-none"
            />
            <span className="text-[#151717]">
              <EyeIcon />
            </span>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5">
            <input type="checkbox" />
            <label className="text-sm font-normal text-black">Recordarme</label>
          </div>
          <span className="cursor-pointer text-sm font-medium text-[#2d79f3]">
            ¿Olvidaste tu contraseña?
          </span>
        </div>

        <button
          type="button"
          className="mt-5 h-[50px] w-full rounded-[10px] border-none bg-[#151717] text-[15px] font-medium text-white transition-colors hover:bg-[#252727]"
        >
          Iniciar sesión
        </button>

        <p className="my-1 text-center text-sm text-black">
          ¿No tienes cuenta?{" "}
          <span className="cursor-pointer font-medium text-[#2d79f3]">Regístrate</span>
        </p>
        <p className="my-1 text-center text-sm text-black">O con</p>

        <div className="flex flex-row gap-2.5">
          <form
            className="flex-1"
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <GoogleSignInButton />
          </form>
          <button
            type="button"
            className="mt-2.5 flex h-[50px] flex-1 items-center justify-center gap-2.5 rounded-[10px] border border-[#ededef] bg-white font-medium text-[#151717] transition-colors hover:border-[#2d79f3]"
          >
            <AppleIcon />
            Apple
          </button>
        </div>

        {/* Just the animated border-glow effect from that MusicPlayer
            example, not its card look — same gold as CustomCursor/the
            hero name, not the demo's own red/blue. */}
        <BorderBeam
          duration={6}
          size={300}
          borderWidth={3}
          colorFrom="transparent"
          colorTo="#ffd60a"
        />
        <BorderBeam
          duration={6}
          delay={3}
          size={300}
          borderWidth={3}
          colorFrom="transparent"
          colorTo="#ffd60a"
          reverse
        />
      </div>
    </div>
  );
}
