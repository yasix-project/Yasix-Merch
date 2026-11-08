// src/components/ui/Button.jsx

export default function Button({
  variant = "primary",
  size = "md",
  isLoading,
  children,
  className = "",
  disabled,
  ...props
}) {
  const baseStyle =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all cursor-pointer select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover shadow-xs",
    secondary:
      "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/80",
    danger: "bg-danger text-white hover:bg-danger/90 shadow-xs",
    amber: "bg-accent text-dark hover:bg-accent/90 shadow-xs",
    outline:
      "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80 shadow-xs",
    dark: "bg-dark text-slate-100 hover:bg-dark/90 border border-slate-700",
  };

  const sizes = {
    xs: "px-3 py-2 text-xs min-h-[36px]",
    sm: "px-3.5 py-2.5 text-xs min-h-[40px]",
    md: "px-4 py-2.5 text-sm min-h-[44px]",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" aria-hidden="true">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
