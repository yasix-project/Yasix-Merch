import { forwardRef, useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

const Input = forwardRef(
  (
    { label, error, id, type = "text", icon: Icon, className = "", ...props },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        {label && (
          <label htmlFor={id} className="text-sm font-semibold text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {/* Ikon Kiri */}
          {Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true">
              <Icon size={18} strokeWidth={2} />
            </div>
          )}

          <input
            id={id}
            ref={ref}
            type={inputType}
            aria-invalid={error ? "true" : undefined}
            className={`w-full py-3 rounded-xl border bg-gray-50/50 outline-none transition-all duration-300
            ${Icon ? "pl-11" : "px-4"}
            ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 bg-red-50/10"
                : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:border-gray-300"
            }
            ${isPassword ? "pr-12" : ""}
          `}
            {...props}
          />

          {/* Toggle Password Icon */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          )}

          {/* Error Icon */}
          {error && !isPassword && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none" aria-hidden="true">
              <AlertCircle size={18} />
            </div>
          )}
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ${error ? "max-h-10 opacity-100 mt-1" : "max-h-0 opacity-0"}`}
        >
          <span className="text-xs text-red-500 font-medium flex items-center gap-1">
            {error}
          </span>
        </div>
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
