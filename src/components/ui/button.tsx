import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?:
    | "blue"
    | "red"
    | "dark"
    | "secondary"
    | "white"
    | "stroke-dark"
    | "stroke-light";
}

export const Button = ({
  className,
  variant = "blue",
  children,
  ...props
}: ButtonProps) => {
  const variantClass = variant ? `btn-${variant}` : "";
  return (
    <button className={twMerge("btn", variantClass, className)} {...props}>
      {children}
    </button>
  );
};
