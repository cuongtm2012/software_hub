import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { GitHubIcon, GoogleIcon } from "./auth-icons";

type OAuthProvider = "google" | "github";

type AuthSocialButtonsProps = {
  disabled?: boolean;
  pending?: boolean;
  onSelect: (provider: OAuthProvider) => void;
};

const providers: { id: OAuthProvider; label: string; icon: ReactNode }[] = [
  { id: "google", label: "Google", icon: <GoogleIcon /> },
  { id: "github", label: "GitHub", icon: <GitHubIcon className="w-5 h-5 text-[#24292f]" /> },
];

export function AuthSocialButtons({ disabled, pending, onSelect }: AuthSocialButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {providers.map(({ id, label, icon }) => (
        <button
          key={id}
          type="button"
          disabled={disabled || pending}
          onClick={() => onSelect(id)}
          className="flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-[#004080]/30 hover:bg-[#004080]/[0.03] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" /> : icon}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
