import { Link, NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion'
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/markets", label: "Markets" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/profile", label: "Profile" },
];

export function Navbar() {
  const { user, logout } = useAuth();

 
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 inset-x-0 z-50 backdrop-blur-md bg-eggshell/70 border-b border-indigo/10"
    >
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="TradeX" className="size-8 object-contain rounded-[6px]" />
          <span className="font-display text-2xl leading-none">
            trade<span className="text-peach italic">X</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-indigo/70">
        
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-md font-sans px-3.5 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
        </nav>
      
         {user ? (
            <>
              <span className="hidden rounded-md bg-muted px-2.5 py-1 text-sm font-medium bg-indigo text-eggshell">
                {user.username}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <div className="flex gap-7">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
      </div>
    </motion.header>
  );
}