import React from 'react';
import { Dumbbell, Users, Calendar, TrendingUp, Activity } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  isPositive?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, isPositive }) => {
  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm border border-border flex flex-col">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className="rounded-full p-2 bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      {change && (
        <div className="mt-4 flex items-center">
          <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{change}
          </span>
          <span className="text-xs text-muted-foreground ml-1">vs last month</span>
        </div>
      )}
    </div>
  );
};

const ExampleDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your gym performance.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded">
            Download Report
          </button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Members" 
          value="248" 
          icon={<Users size={20} />} 
          change="12%" 
          isPositive={true} 
        />
        <StatCard 
          title="Active Workouts" 
          value="32" 
          icon={<Dumbbell size={20} />} 
          change="8%" 
          isPositive={true} 
        />
        <StatCard 
          title="Classes Today" 
          value="8" 
          icon={<Calendar size={20} />} 
          change="Same" 
          isPositive={true} 
        />
        <StatCard 
          title="Revenue" 
          value="$12,548" 
          icon={<TrendingUp size={20} />} 
          change="5%" 
          isPositive={true} 
        />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-card text-card-foreground rounded-lg shadow-sm border border-border p-6">
          <h3 className="text-lg font-medium mb-4">Member Activity</h3>
          <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-md">
            <Activity className="h-8 w-8 text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Activity Chart Placeholder</span>
          </div>
        </div>
        <div className="bg-card text-card-foreground rounded-lg shadow-sm border border-border p-6">
          <h3 className="text-lg font-medium mb-4">Recent Members</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                  {String.fromCharCode(64 + i)}
                </div>
                <div>
                  <p className="text-sm font-medium">Member {i}</p>
                  <p className="text-xs text-muted-foreground">Joined {i} days ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExampleDashboard; 