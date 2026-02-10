import React from 'react';

interface StatCardProps {
    label: string;
    value: string | number;
    subValue?: string;
    icon: React.ElementType;
    color?: 'amber' | 'blue' | 'green' | 'purple';
    action?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    subValue,
    icon: Icon,
    color = 'amber',
    action
}) => {
    const colorStyles = {
        amber: { bg: 'bg-amber-50', text: 'text-amber-600', iconBg: 'bg-amber-100' },
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
        green: { bg: 'bg-green-50', text: 'text-green-600', iconBg: 'bg-green-100' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-100' },
    };

    const style = colorStyles[color];

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-full transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${style.iconBg} ${style.text}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {action && <div>{action}</div>}
            </div>

            <div className="mt-4">
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
                {subValue && (
                    <p className="text-xs text-gray-400 mt-1">{subValue}</p>
                )}
            </div>
        </div>
    );
};

export default StatCard;
