import Link from "next/link";
import { twMerge } from "tailwind-merge";

const Button = ({ children, onClick, href, className }) => {
  const combinedClasses = twMerge(
    "bg-gradient-to-br from-[#6DD861] to-[#69D2AE] text-white font-inter text-5xl font-bold px-12 py-6 rounded-xl",
    className
  );

  if (href) {
    return (
      <Link className={combinedClasses} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClasses} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
