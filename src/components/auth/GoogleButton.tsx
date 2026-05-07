import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GoogleButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}

const GoogleButton = ({ onClick, loading = false, disabled = false, label = "Continue with Google" }: GoogleButtonProps) => {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={loading || disabled}
      className="w-full border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
          <path
            fill="#FFC107"
            d="M43.611 20.083H42V20H24v8h11.303C33.978 31.91 29.388 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.65 5.05 29.073 3 24 3 12.402 3 3 12.402 3 24s9.402 21 21 21 21-9.402 21-21c0-1.341-.138-2.65-.389-3.917z"
          />
          <path
            fill="#FF3D00"
            d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 13 24 13c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.65 5.05 29.073 3 24 3 16.318 3 9.656 7.337 6.306 14.691z"
          />
          <path
            fill="#4CAF50"
            d="M24 45c5.166 0 9.86-1.977 13.409-5.197l-6.193-5.238C29.211 35.882 26.715 37 24 37c-5.353 0-9.927-3.073-11.282-7.413l-6.5 5.011C9.5 40.556 16.227 45 24 45z"
          />
          <path
            fill="#1976D2"
            d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.566l.003-.001 6.193 5.238C36.99 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
          />
        </svg>
      )}
      {label}
    </Button>
  );
};

export default GoogleButton;
