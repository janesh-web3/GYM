import React from 'react';
import ExampleDashboard from '../components/ExampleDashboard';

const ShadcnExample: React.FC = () => {
  return (
    <div className="p-4 space-y-8">
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm border border-border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Theme Toggle</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          Theme toggle functionality has been removed
        </p>
      </div>
      
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm border border-border">
        <h2 className="text-2xl font-bold mb-4">Basic Buttons</h2>
        <p className="text-muted-foreground mb-4">
          Shadcn UI has been removed
        </p>
        <div className="space-y-4 p-4">
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 bg-blue-500 text-white rounded">Basic Button</button>
            <button className="px-4 py-2 bg-red-500 text-white rounded">Red Button</button>
            <button className="px-4 py-2 border border-gray-300 rounded">Outline Button</button>
          </div>
        </div>
      </div>
      
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm border border-border">
        <h2 className="text-2xl font-bold mb-4">Dashboard Example</h2>
        <p className="text-muted-foreground mb-6">
          Dashboard using standard styling
        </p>
        <ExampleDashboard />
      </div>
    </div>
  );
};

export default ShadcnExample; 