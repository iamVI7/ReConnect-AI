import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { loginSchema } from './auth.schemas.js';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    // TODO: wire up to POST /api/v1/auth/login once the backend is implemented
    console.log('login submit', data);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <p className="font-mono text-xs uppercase tracking-widest text-trust mb-2">Sign in</p>
        <h1 className="font-display text-2xl mb-8">Welcome back.</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm text-ink-soft mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm focus:border-trust transition-colors duration-200"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-ink-soft mb-1.5">Password</label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm focus:border-trust transition-colors duration-200"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-trust text-paper py-2.5 rounded-full shadow-soft hover:bg-trust-deep transition-colors duration-200 disabled:opacity-60"
          >
            Sign in
          </motion.button>
        </form>

        <p className="text-sm text-ink-faint mt-6">
          New here?{' '}
          <Link to="/register" className="text-trust hover:underline">Create an account</Link>
        </p>
      </motion.div>
    </div>
  );
}
