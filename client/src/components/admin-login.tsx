import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginUserSchema, type LoginUser } from '../../../shared/mongo-validation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Shield, Lock, User } from 'lucide-react';

interface AdminLoginProps {
    onLogin: (user: any) => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<LoginUser>({
        resolver: zodResolver(loginUserSchema),
        defaultValues: {
            username: '',
            password: ''
        }
    });

    const onSubmit = async (data: LoginUser) => {
        setIsLoading(true);

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'include'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Login failed');
            }

            const result = await response.json();

            toast({
                title: 'Login Successful',
                description: `Welcome back, ${result.user.username}!`
            });

            onLogin(result.user);
        } catch (error: any) {
            toast({
                title: 'Login Failed',
                description: error.message || 'Invalid credentials',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="bg-[#111823] border-[#ff4654]/30 gaming-border">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 rounded-full bg-[#ff4654]/20 border border-[#ff4654]/30">
                                <Shield className="h-8 w-8 text-[#ff4654]" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-orbitron text-[#ff4654]">
                            Admin Login
                        </CardTitle>
                        <CardDescription className="text-gray-300">
                            Access the Game Night admin dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-200 flex items-center">
                                                <User className="h-4 w-4 mr-2" />
                                                Username
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Enter your username"
                                                    className="bg-[#1a2332] border-[#ff4654]/30 text-white placeholder:text-gray-400 focus:border-[#ff4654]"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[#ff4654]" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-200 flex items-center">
                                                <Lock className="h-4 w-4 mr-2" />
                                                Password
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="password"
                                                    placeholder="Enter your password"
                                                    className="bg-[#1a2332] border-[#ff4654]/30 text-white placeholder:text-gray-400 focus:border-[#ff4654]"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[#ff4654]" />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full gaming-button"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Logging in...
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="h-4 w-4 mr-2" />
                                            Login
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
