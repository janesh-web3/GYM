import { ReactNode } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Bell, 
  Calendar, 
  Clock,
} from 'lucide-react';

// Types for various dashboard components
interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  trend?: {
    value: string | number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  className?: string;
}

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

interface NotificationProps {
  title: string;
  message: string;
  time: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  isRead?: boolean;
}

interface WelcomeBannerProps {
  userName: string;
  role: string;
  message?: string;
}

// Dashboard Stat Card Component
export const StatCard = ({
  title,
  value,
  description,
  icon,
  trend,
  className = '',
}: StatCardProps) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-zinc-200 p-5 transition-all duration-200 hover:shadow-md ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-slate-500">{title}</h3>
          <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
          {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
        </div>
        <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">{icon}</div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center">
          {trend.direction === 'up' && (
            <span className="flex items-center text-sm font-medium text-emerald-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              {trend.value}
            </span>
          )}
          {trend.direction === 'down' && (
            <span className="flex items-center text-sm font-medium text-rose-600">
              <TrendingDown className="w-4 h-4 mr-1" />
              {trend.value}
            </span>
          )}
          {trend.direction === 'neutral' && (
            <span className="flex items-center text-sm font-medium text-slate-600">
              {trend.value}
            </span>
          )}
          {trend.label && <span className="ml-2 text-xs text-slate-500">{trend.label}</span>}
        </div>
      )}
    </div>
  );
};

// Dashboard Section Component
export const DashboardSection = ({
  title,
  subtitle,
  children,
  action,
  className = '',
}: DashboardSectionProps) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden ${className}`}>
      <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};

// Notification Component
export const Notification = ({
  title,
  message,
  time,
  type = 'info',
  isRead = false,
}: NotificationProps) => {
  const typeStyles = {
    info: 'bg-indigo-50 text-indigo-500',
    success: 'bg-emerald-50 text-emerald-500',
    warning: 'bg-amber-50 text-amber-500',
    error: 'bg-rose-50 text-rose-500',
  };

  const getIcon = () => {
    switch (type) {
      case 'info':
        return <Bell className="w-5 h-5" />;
      case 'success':
        return <TrendingUp className="w-5 h-5" />;
      case 'warning':
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <div className={`relative p-4 rounded-lg border ${isRead ? 'border-zinc-200 bg-white' : 'border-l-4 border-l-indigo-500 border-zinc-200 bg-white'}`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 rounded-full p-2 ${typeStyles[type]}`}>
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <div className="text-sm font-medium text-slate-800">{title}</div>
          <div className="mt-1 text-sm text-slate-600">{message}</div>
          <div className="mt-2 flex items-center text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 mr-1" />
            {time}
          </div>
        </div>
      </div>
      {!isRead && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-500" />}
    </div>
  );
};

// Welcome Banner Component
export const WelcomeBanner = ({ userName, role, message }: WelcomeBannerProps) => {
  const defaultMessage = `Welcome back to your dashboard. Here's what's happening with your account today.`;
  
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-xl shadow-lg p-6 text-white mb-6">
      <div className="relative z-10">
        <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, {userName}!</h1>
        <p className="mt-1 text-indigo-100 font-medium capitalize">{role} Dashboard</p>
        <p className="mt-4 text-sm sm:text-base text-indigo-100 max-w-2xl">
          {message || defaultMessage}
        </p>
        
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          
          <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
            <Clock className="w-4 h-4 mr-2" />
            {new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl"></div>
    </div>
  );
};

// Activity Timeline Item Component
interface TimelineItemProps {
  time: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  isLast?: boolean;
}

export const TimelineItem = ({
  time,
  title,
  description,
  icon,
  isLast = false,
}: TimelineItemProps) => {
  return (
    <div className="flex">
      <div className="flex flex-col items-center mr-4">
        <div className="flex justify-center items-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600">
          {icon || <Clock className="w-4 h-4" />}
        </div>
        {!isLast && <div className="w-0.5 h-full bg-indigo-100 mt-2"></div>}
      </div>
      <div className={`pb-6 ${isLast ? '' : 'border-l border-transparent'}`}>
        <p className="text-xs text-slate-500 mb-1">{time}</p>
        <h4 className="text-sm font-medium text-slate-800">{title}</h4>
        {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      </div>
    </div>
  );
};

// Dashboard Grid Layout Component
interface DashboardGridProps {
  children: ReactNode;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  className?: string;
}

export const DashboardGrid = ({
  children,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  className = '',
}: DashboardGridProps) => {
  const getColumnsClass = () => {
    const classes = [];
    
    if (columns.sm) classes.push(`grid-cols-${columns.sm}`);
    if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
    
    return classes.join(' ');
  };
  
  return (
    <div className={`grid gap-6 ${getColumnsClass()} ${className}`}>
      {children}
    </div>
  );
};

// Main Dashboard Template Component
interface DashboardTemplateProps {
  userName: string;
  userRole: string;
  welcomeMessage?: string;
  children: ReactNode;
}

const DashboardTemplate = ({
  userName,
  userRole,
  welcomeMessage,
  children,
}: DashboardTemplateProps) => {
  return (
    <div className="space-y-6">
      <WelcomeBanner 
        userName={userName} 
        role={userRole} 
        message={welcomeMessage} 
      />
      
      {children}
    </div>
  );
};

export default DashboardTemplate; 