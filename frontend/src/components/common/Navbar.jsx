import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';

const links = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Who it serves', href: '#roles' },
  { label: 'Trust & safety', href: '#trust' },
];

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur border-b border-line">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="w-2 h-2 rounded-full bg-signal transition-transform duration-300 group-hover:scale-150" />
          <span className="font-display text-lg tracking-tight">ReConnect<span className="text-trust"> AI</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-ink-soft">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-ink transition-colors duration-200">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              className="text-sm bg-trust text-paper px-4 py-2 rounded-full shadow-soft hover:bg-trust-deep transition-colors duration-200"
            >
              Log out
            </motion.button>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden sm:inline text-sm text-ink-soft hover:text-ink transition-colors duration-200"
              >
                Sign in
              </Link>
              <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/register"
                  className="text-sm bg-trust text-paper px-4 py-2 rounded-full shadow-soft hover:bg-trust-deep transition-colors duration-200"
                >
                  Get started
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
