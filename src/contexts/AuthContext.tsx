import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { creditTransaction } from '@/lib/api';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  credits: number;
  profileComplete: boolean;
  lastLogin: Date;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateCredits: (amount: number, type: string, description: string) => void;
  setUser(user: User | ((prev: User | null) => User | null)): void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => { },
  register: async () => { },
  logout: () => { },
  updateCredits: () => { },
  setUser: () => { }
});

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = () => {
      const savedUser = Cookies.get('feedflow_user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser({
            ...parsedUser,
            lastLogin: new Date(parsedUser.lastLogin),
          });
        } catch (error) {
          console.error('Failed to parse user cookie', error);
          // Cookies.remove('feedflow_user');
          // Cookies.remove('feedflow_token');
        }
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // VERY IMPORTANT
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      const { token, user } = data;
      Cookies.set('feedflow_user', JSON.stringify(user));
      Cookies.set('feedflow_token', token);

      setUser({
        ...user,
        lastLogin: new Date(user.lastLogin),
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      const { token, user } = data;

      setUser({
        ...user,
        lastLogin: new Date(user.lastLogin),
      });

      Cookies.set('feedflow_user', JSON.stringify(user), { expires: 7 });
      Cookies.set('feedflow_token', token, { expires: 7 });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    Cookies.remove('feedflow_user');
    Cookies.remove('feedflow_token');
  };

  const updateCredits = (amount: number, type: string, description: string) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      credits: user.credits + amount,
    };

    creditTransaction(amount, type, description);
    setUser(updatedUser);
    Cookies.set('feedflow_user', JSON.stringify(updatedUser), { expires: 1 });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateCredits,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
