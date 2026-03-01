'use client';

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend,
    AreaChart,
    Area
} from 'recharts';

interface Props {
    data: {
        chartData: any[];
        staffPerformance: any[];
        serviceStats: any[];
    };
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

export default function OwnerAnalyticsCharts({ data }: Props) {
    const { chartData, staffPerformance, serviceStats } = data;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 1. Income Trend (Area Chart) */}
            <div className="bg-white p-8 rounded-[40px] border border-border shadow-card overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h3 className="text-xl font-black text-text-main tracking-tight font-display">Gelir Trend Analizi</h3>
                        <p className="text-xs font-bold text-text-secondary mt-1 uppercase tracking-wider">Son 30 Günlük Performans</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/20"></div>
                        <span className="text-[10px] font-black text-gray-600 uppercase">Günlük Gelir (₺)</span>
                    </div>
                </div>
                <div className="h-[350px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }}
                                tickFormatter={(str) => new Date(str).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }}
                                tickFormatter={(val) => `₺${val}`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                                labelStyle={{ fontWeight: 800, marginBottom: '4px', color: '#111827' }}
                                itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                                formatter={(value: any) => [`₺${value}`, 'Gelir']}
                                labelFormatter={(label) => new Date(label).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            />
                            <Area
                                type="monotone"
                                dataKey="income"
                                stroke="#FF6B6B"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorIncome)"
                                animationDuration={2000}
                                activeDot={{ r: 8, strokeWidth: 0, fill: '#FF6B6B' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 2. Staff Performance (Bar Chart) */}
                <div className="bg-white p-8 rounded-[40px] border border-border shadow-card overflow-hidden">
                    <h3 className="text-xl font-black text-text-main tracking-tight font-display mb-8">Personel Verimliliği</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={staffPerformance} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fontWeight: 700, fill: '#374151' }}
                                    width={100}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [value, 'Randevu']}
                                />
                                <Bar
                                    dataKey="appointments"
                                    fill="#4ECDC4"
                                    radius={[0, 12, 12, 0]}
                                    barSize={24}
                                    animationDuration={1500}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Service Popularity (Pie Chart) */}
                <div className="bg-white p-8 rounded-[40px] border border-border shadow-card overflow-hidden">
                    <h3 className="text-xl font-black text-text-main tracking-tight font-display mb-8">Popüler Hizmetler</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={serviceStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                    animationDuration={1500}
                                >
                                    {serviceStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => <span className="text-[11px] font-bold text-gray-600 uppercase ml-1">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
