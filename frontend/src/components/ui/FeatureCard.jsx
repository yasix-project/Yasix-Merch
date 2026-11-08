/**
 * FeatureCard - Komponen informasi ringkas
 *
 * @param {React.ElementType} icon - Komponen ikon
 * @param {string} title - Judul informasi
 * @param {string} description - Deskripsi ringkas
 * @param {'dark' | 'light' | 'outline'} variant - Tema tampilan kartu
 * @param {string} className - Kelas Tailwind kustom tambahan
 */
export default function FeatureCard({
  icon: Icon,
  title,
  description,
  variant = "light",
  className = "",
}) {
  const variants = {
    dark: {
      container: "bg-dark border-slate-700 hover:border-slate-600",
      icon: "bg-primary/20 text-sky border-primary/30",
      title: "text-white",
      description: "text-slate-200",
    },
    light: {
      container: "bg-slate-50 hover:bg-slate-100 border-slate-200",
      icon: "bg-primary/10 text-primary border-primary/20",
      title: "text-slate-900",
      description: "text-slate-600",
    },
    outline: {
      container: "bg-white hover:bg-slate-50 border-slate-200",
      icon: "bg-slate-100 text-slate-700 border-slate-200",
      title: "text-slate-800",
      description: "text-slate-600",
    },
  };

  const currentVariant = variants[variant] || variants.light;

  return (
    <div
      className={`flex gap-4 items-start border p-3.5 rounded-xl transition-all ${currentVariant.container} ${className}`}
    >
      {Icon && (
        <div
          className={`p-2.5 rounded-xl border shrink-0 ${currentVariant.icon}`}
        >
          <Icon size={20} />
        </div>
      )}
      <div>
        <h4 className={`font-semibold text-sm ${currentVariant.title}`}>
          {title}
        </h4>
        {description && (
          <p
            className={`text-xs mt-0.5 leading-relaxed ${currentVariant.description}`}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
