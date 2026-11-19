export default function Badge({
  variant = "primary",
  children,
  className = "",
  icon: Icon,
}) {
  const variants = {
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success/10 text-success border-success/20",
    danger: "bg-danger/10 text-danger border-danger/20",
    warning: "bg-accent/10 text-amber-700 border-accent/30",
    amber: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    sky: "bg-primary/20 text-sky border-primary/30",
    emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    purple: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    dark: "bg-slate-800 text-slate-300 border-slate-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant] || variants.primary} ${className}`}
    >
      {Icon && <Icon size={13} className="shrink-0" />}
      {children}
    </span>
  );
}
