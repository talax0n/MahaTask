'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useToast } from '@/hooks/use-toast';
import { Loader2, BookOpen, CheckCircle2, Users } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, loading, error: authError } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const user = await register({ name, email, password });
      if (user) {
        toast({
          title: 'Success',
          description: 'Account created successfully',
        });
        router.push('/tasks');
      } else {
         toast({
          title: 'Registration Failed',
          description: authError || 'Could not create account. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
       toast({
          title: 'Registration Failed',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        });
    }
  };

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      {/* Left Side - Branding/Hero */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-900 p-10 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 z-0" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] z-0" />
        
        <div className="relative z-10 flex items-center gap-2 text-xl font-bold tracking-tight">
          <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
            <BookOpen className="h-5 w-5" />
          </div>
          MahaTask
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <h1 className="text-6xl font-extrabold tracking-tighter leading-none">
            Join the ultimate academic platform
          </h1>
          <div className="space-y-4 text-lg font-medium text-zinc-400">
             <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              <span>Get organized with smart scheduling</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-500" />
              <span>Connect with peers and study smarter</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm font-medium text-zinc-500">
          &copy; 2026 MahaTask. All rights reserved.
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-[400px] space-y-6">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
            <p className="text-muted-foreground">
              Enter your email below to create your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="bg-background"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create account
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
