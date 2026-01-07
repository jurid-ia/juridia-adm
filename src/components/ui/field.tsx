import Icon from "@/components/ui/icon";
import { Eye, EyeOff } from "lucide-react";
import { ReactNode, useState } from "react";
import { twMerge } from "tailwind-merge";

type FieldProps = {
  className?: string;
  classInput?: string;
  label?: string;
  textarea?: boolean;
  note?: string;
  type?: string;
  value: string;
  onChange: any;
  placeholder?: string;
  required?: boolean;
  icon?: string;
  disabled?: boolean;
  Svg?: ReactNode;
  maxLength?: number;
};

const Field = ({
  className,
  classInput,
  label,
  textarea,
  note,
  type,
  value,
  disabled,
  onChange,
  placeholder,
  required,
  icon,
  Svg,
  maxLength,
}: FieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleKeyDown = (event: any) => {
    const remainingChars = 880 - value.length;
    if (remainingChars <= 0 && event.key !== "Backspace") {
      event.preventDefault();
    }
  };

  const remainingChars = 880 - value.length;

  const inputType = type === "password" && showPassword ? "text" : type || "text";

  return (
    <div className={`${className}`}>
      <div className="">
        {label && (
          <div className="base2 mb-2 flex font-semibold">
            {label}
            {textarea && (
              <span className="text-n-4/50 ml-auto pl-4">{remainingChars}</span>
            )}
          </div>
        )}
        <div className="relative">
          {textarea ? (
            <textarea
              className={`bg-n-2 border-n-2 base2 text-n-7 placeholder:text-n-4/50 dark:bg-n-8 dark:border-n-6 dark:text-n-3 dark:focus:bg-n-8 h-24 w-full resize-none rounded-xl border-2 px-3.5 py-3 transition-colors outline-none focus:bg-transparent ${
                (icon || Svg) && "pl-[3.125rem]"
              } ${value !== "" && "dark:bg-n-8 border-n-3/50 bg-transparent"}`}
              value={value}
              onChange={onChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              required={required}
              maxLength={maxLength}
            ></textarea>
          ) : (
            <input
              className={twMerge(
                `bg-n-2 border-n-2 base2 text-n-7 placeholder:text-n-4/50 dark:bg-n-8 dark:border-n-6 dark:text-n-3 dark:focus:bg-n-8 h-13 w-full rounded-xl border-2 px-3.5 transition-colors outline-none focus:border-white/20 focus:bg-n-2 dark:focus:border-white/20 ${
                  (icon || Svg) && "pl-[3.125rem]"
                } ${type === "password" && "pr-10"} ${
                  value !== "" && "dark:bg-n-8 border-white/20"
                } ${classInput}`,
              )}
              type={inputType}
              value={value}
              onChange={onChange}
              disabled={disabled}
              placeholder={placeholder}
              required={required}
              maxLength={maxLength}
            />
          )}
          {Svg ? (
            <svg
              className={`text-[rgb(108 114 117 / 0.5)] pointer-events-none absolute top-3.5 left-4 transition-colors ${
                value !== "" && ""
              }`}
            >
              {Svg}
            </svg>
          ) : (
            <Icon
              className={`fill-n-4/50 pointer-events-none absolute top-3.5 left-4 transition-colors ${
                value !== "" && "fill-n-4"
              }`}
              name={icon}
            />
          )}

          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-4 -translate-y-1/2 p-1 text-n-4/50 transition-colors hover:text-n-7 dark:hover:text-n-3"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
        {note && <div className="base2 text-n-4/50 mt-2">{note}</div>}
      </div>
    </div>
  );
};

export default Field;
