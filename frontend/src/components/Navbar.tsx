import { NavLink } from "react-router-dom";

const Navbar = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `cursor-pointer px-5 py-2 text-sm font-semibold transition-all duration-200 relative ${
      isActive
        ? "text-white after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-0.5 after:bg-white/80 after:rounded-full"
        : "text-white hover:text-purple-500/90 hover:scale-105 transition-all duration-200"
    }`;

  return (
    <div className="hidden md:flex items-center gap-1   rounded-full px-3 py-2 border border-white/30 shadow-lg">
      <NavLink to="/" end className={linkClass}>
        Home
      </NavLink>
      <NavLink to="/pricing" className={linkClass}>
        Pricing
      </NavLink>
      <NavLink to="/about" className={linkClass}>
        About
      </NavLink>
    </div>
  );
};

export default Navbar;
