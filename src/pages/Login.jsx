import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    login
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const result = login(email, password);
    if (result.success) {
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente."
      });
      navigate('/');
    } else {
      toast({
        title: "Error de autenticación",
        description: result.error,
        variant: "destructive"
      });
    }
    setLoading(false);
  };
  return <>
      <Helmet>
        <title>Iniciar Sesión - CMG HIDRÁULICA S.L.</title>
        <meta name="description" content="Accede al sistema de gestión interno de CMG HIDRÁULICA S.L." />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-4">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }} className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <img className="h-16 w-auto" alt="CMG Hidráulica Logo" src="https://images.unsplash.com/photo-1614891587446-4994c62559cc" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                CMG HIDRÁULICA S.L.
              </CardTitle>
              <CardDescription className="text-gray-600">
                Accede al sistema de gestión interno
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input type="email" placeholder="tu@cmghidraulica.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 pr-10" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </Button>
              </form>
              
              
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>;
}