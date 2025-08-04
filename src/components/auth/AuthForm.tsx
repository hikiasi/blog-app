import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { authAPI } from '@/lib/api';

interface AuthFormProps {
  onLogin: (user: any, token: string) => void;
}

export function AuthForm({ onLogin }: AuthFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signInData, setSignInData] = useState({ username: '', password: '' });
  const [signUpData, setSignUpData] = useState({ username: '', password: '' });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await authAPI.signin(signInData.username, signInData.password);
      localStorage.setItem('token', response.token);
      onLogin(response.user, response.token);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await authAPI.signup(
        signUpData.username, 
        signUpData.password
      );
      localStorage.setItem('token', response.token);
      onLogin(response.user, response.token);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Блог</CardTitle>
          <CardDescription className="text-center">
            Войдите в свой аккаунт или создайте новый
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Вход</TabsTrigger>
              <TabsTrigger value="signup">Регистрация</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Имя пользователя</label>
                  <Input
                    type="text"
                    value={signInData.username}
                    onChange={(e) => setSignInData({ ...signInData, username: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Пароль</label>
                  <Input
                    type="password"
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Вход...' : 'Войти'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Имя пользователя</label>
                  <Input
                    type="text"
                    value={signUpData.username}
                    onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Пароль</label>
                  <Input
                    type="password"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 