import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    CalendarCheck,
    Building2,
    TrendingUp,
    Plus,
    History,
    ArrowRight
} from 'lucide-react';
import { statsAPI, employeeAPI } from '../api';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ label, value, icon: Icon, colorClass, trend }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
    >
        <div className="flex items-start justify-between">
            <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10`}>
                <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
            </div>
            {trend && (
                <span className="flex items-center gap-1 text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full">
                    <TrendingUp size={12} /> {trend}
                </span>
            )}
        </div>
        <div className="mt-4">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</p>
            <h3 className="text-3xl font-black mt-1">{value}</h3>
        </div>
    </motion.div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalEmployees: 0,
        todayAttendance: 0,
        departments: 0
    });
    const [recentEmployees, setRecentEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, employeesRes] = await Promise.all([
                    statsAPI.getDashboard(),
                    employeeAPI.getAll()
                ]);
                setStats(statsRes.data);
                setRecentEmployees(employeesRes.data.slice(0, 5));
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const dashboardCards = [
        { label: 'Total Employees', value: stats.totalEmployees, icon: Users, colorClass: 'bg-indigo-500', trend: '+12%' },
        { label: 'Active Departments', value: stats.departments, icon: Building2, colorClass: 'bg-emerald-500', trend: 'Stable' },
        { label: "Today's Presence", value: stats.todayAttendance, icon: CalendarCheck, colorClass: 'bg-amber-500', trend: '94%' },
        { label: 'Quick Retention', value: '98%', icon: TrendingUp, colorClass: 'bg-rose-500', trend: '+0.4%' },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(idx => (
                    <div key={idx} className="h-40 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-3xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardCards.map((card, idx) => (
                    <StatCard key={idx} {...card} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activities */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-xl font-bold">Recently Added Employees</h3>
                            <button
                                onClick={() => navigate('/employees')}
                                className="text-primary text-sm font-bold flex items-center gap-1 hover:underline"
                            >
                                View All <ArrowRight size={16} />
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {recentEmployees.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs uppercase">
                                                        {emp.full_name.charAt(0)}
                                                    </div>
                                                    <span className="font-semibold">{emp.full_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-sm">{emp.employee_id}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full">
                                                    {emp.department}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {recentEmployees.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-10 text-center text-slate-400">
                                                No employees found. Start by adding your first hero!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/employees')}
                                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] transition-transform"
                            >
                                <Plus size={20} /> Add New Employee
                            </button>
                            <button
                                onClick={() => navigate('/attendance')}
                                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <History size={20} /> Mark Attendance
                            </button>
                        </div>
                    </div>

                    {/* System Summary */}
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-3xl text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="text-lg font-bold mb-2">HRMS Lite Pro</h4>
                            <p className="text-indigo-100 text-sm mb-6 leading-relaxed">Your entire workforce management in one elegant dashboard.</p>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">System Status</span>
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                </div>
                                <p className="text-sm font-bold leading-none">Operational</p>
                            </div>
                        </div>
                        {/* Decorative circles */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
