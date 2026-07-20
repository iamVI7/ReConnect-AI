import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { registerSchema } from './auth.schemas.js';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'family';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    // TODO: wire up to POST /api/v1/auth/register once the backend is implemented
    console.log('register submit', { ...data, role });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <p className="font-mono text-xs uppercase tracking-widest text-trust mb-2">
          Create account · {role}
        </p>
        <h1 className="font-display text-2xl mb-8">Let's get you set up.</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="fullName" className="block text-sm text-ink-soft mb-1.5">Full name</label>
            <input
              id="fullName"
              {...register('fullName')}
              className="w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm focus:border-trust transition-colors duration-200"
              placeholder="Your name"
            />
            {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
          </div>

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
            <label htmlFor="phone" className="block text-sm text-ink-soft mb-1.5">Phone</label>
            <input
              id="phone"
              {...register('phone')}
              className="w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm focus:border-trust transition-colors duration-200"
              placeholder="+91 9XXXXXXXXX"
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
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
            Create account
          </motion.button>
        </form>

        <p className="text-sm text-ink-faint mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-trust hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
