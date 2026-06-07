import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Palette,
  Shield,
  ShieldCheck,
  Crown,
  Eye,
  EyeOff,
  LogIn,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types';

interface RoleOption {
  key: UserRole;
  name: string;
  icon: typeof User;
  username: string;
  description: string;
}

const roles: RoleOption[] = [
  { key: 'visitor', name: '观众', icon: User, username: 'visitor', description: '参观预约、智能导览' },
  { key: 'curator', name: '策展人', icon: Palette, username: 'curator', description: '展览策划、内容管理' },
  { key: 'conservator', name: '文物保护员', icon: Shield, username: 'conservator', description: '文物维护、修复计划' },
  { key: 'security', name: '安全管理员', icon: ShieldCheck, username: 'security', description: '安防监控、预警处理' },
  { key: 'director', name: '馆长', icon: Crown, username: 'director', description: '综合管理、数据分析' },
];

const roleRedirectMap: Record<UserRole, string> = {
  visitor: '/visitor/home',
  curator: '/curator/home',
  conservator: '/conservator/home',
  security: '/security/home',
  director: '/director/home',
};

export default function Login() {
  const navigate = useNavigate();
  const { login, initialize } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<UserRole>('visitor');
  const [username, setUsername] = useState('visitor');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    initialize();
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, [initialize]);

  const handleRoleSelect = (role: UserRole, uname: string) => {
    setSelectedRole(role);
    setUsername(uname);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(selectedRole, username, password);
      navigate(roleRedirectMap[selectedRole], { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-museum-brown-950 via-museum-brown-900 to-museum-brown-800">
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="geometric" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M30 0 L60 30 L30 60 L0 30 Z" fill="none" stroke="#B8860B" strokeWidth="0.5" />
              <circle cx="30" cy="30" r="2" fill="#B8860B" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#geometric)" />
        </svg>
      </div>

      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-museum-gold-500/10 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-museum-gold-600/10 blur-3xl" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <div
          className={`w-full max-w-5xl transition-all duration-700 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <div className="mb-10 text-center">
            <div className="mb-4 inline-flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-museum-gold-400 animate-pulse-gold" />
              <span className="text-museum-gold-300 text-sm tracking-widest">HUAXIA MUSEUM</span>
              <Sparkles className="h-6 w-6 text-museum-gold-400 animate-pulse-gold" />
            </div>
            <h1 className="mb-3 font-serif text-4xl md:text-5xl font-bold tracking-wide gold-text">
              华夏博物馆智慧管理平台
            </h1>
            <p className="text-museum-brown-300 text-lg tracking-wider">
              传承千年文明 · 智慧管理未来
            </p>
          </div>

          <div
            className={`mb-8 transition-all duration-700 delay-150 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <p className="mb-4 text-center text-museum-brown-300 text-sm">请选择登录角色</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {roles.map((role, index) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.key;
                return (
                  <button
                    key={role.key}
                    onClick={() => handleRoleSelect(role.key, role.username)}
                    style={{ transitionDelay: `${index * 80}ms` }}
                    className={`group relative flex flex-col items-center justify-center p-5 rounded-xl transition-all duration-500 ${
                      mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    } ${
                      isSelected
                        ? 'bg-gradient-to-br from-museum-gold-500/20 to-museum-gold-600/10 border-2 border-museum-gold-400 shadow-gold-hover animate-pulse-gold'
                        : 'bg-museum-brown-800/40 border border-museum-brown-700 hover:border-museum-gold-600/50 hover:bg-museum-brown-800/60'
                    }`}
                  >
                    <div
                      className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-br from-museum-gold-400 to-museum-gold-600'
                          : 'bg-museum-brown-700 group-hover:bg-museum-gold-600/30'
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 transition-colors duration-300 ${
                          isSelected ? 'text-museum-brown-900' : 'text-museum-gold-300'
                        }`}
                      />
                    </div>
                    <span
                      className={`font-medium text-base mb-1 transition-colors ${
                        isSelected ? 'text-museum-gold-300' : 'text-museum-brown-200'
                      }`}
                    >
                      {role.name}
                    </span>
                    <span className="text-xs text-museum-brown-400">{role.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={`mx-auto max-w-md transition-all duration-700 delay-300 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <div className="glass-card p-8">
              <h2 className="mb-6 text-center font-serif text-xl font-semibold text-museum-gold-400">
                用户登录
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-museum-brown-200">
                    用户名
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-museum-gold-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-lg border border-museum-brown-600/50 bg-museum-brown-900/50 py-2.5 pl-10 pr-4 text-museum-cream placeholder-museum-brown-400 transition-all focus:border-museum-gold-500 focus:outline-none focus:ring-2 focus:ring-museum-gold-500/30"
                      placeholder="请输入用户名"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-museum-brown-200">
                    密码
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-museum-gold-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-museum-brown-600/50 bg-museum-brown-900/50 py-2.5 pl-10 pr-12 text-museum-cream placeholder-museum-brown-400 transition-all focus:border-museum-gold-500 focus:outline-none focus:ring-2 focus:ring-museum-gold-500/30"
                      placeholder="请输入密码"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-museum-brown-400 hover:text-museum-gold-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-900/30 border border-red-700/50 px-4 py-2 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold w-full flex items-center justify-center gap-2 py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>登录中...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5" />
                      <span>立即登录</span>
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-museum-brown-400">
                默认密码为 123456，登录后请及时修改
              </p>
            </div>
          </div>

          <div
            className={`mt-10 text-center text-museum-brown-500 text-sm transition-all duration-700 delay-500 ${
              mounted ? 'opacity-100' : 'opacity-0'
            }`}
          >
            © 2024 华夏博物馆智慧管理平台 版权所有
          </div>
        </div>
      </div>
    </div>
  );
}
