import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CalendarCheck,
    History,
    User,
    CheckCircle2,
    XCircle,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Loader2
} from 'lucide-react';
import { employeeAPI, attendanceAPI } from '../api';

const Attendance = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [records, setRecords] = useState([]);
    const [summary, setSummary] = useState({ Present: 0, Absent: 0 });
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState('Present');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [recordsLoading, setRecordsLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const { data } = await employeeAPI.getAll();
                setEmployees(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (selectedEmployee) {
            fetchAttendance();
        } else {
            setRecords([]);
            setSummary({ Present: 0, Absent: 0 });
        }
    }, [selectedEmployee, startDate, endDate]);

    const fetchAttendance = async () => {
        setRecordsLoading(true);
        try {
            const params = {};
            if (startDate && endDate) {
                params.startDate = startDate;
                params.endDate = endDate;
            }
            const { data } = await attendanceAPI.getForEmployee(selectedEmployee, params);
            setRecords(data.records);
            setSummary(data.summary);
        } catch (err) {
            console.error(err);
        } finally {
            setRecordsLoading(false);
        }
    };

    const handleMark = async (e) => {
        e.preventDefault();
        if (!selectedEmployee) {
            showToast('Please select an employee first', 'error');
            return;
        }
        setLoading(true);
        try {
            await attendanceAPI.mark({ employee_id: selectedEmployee, date, status });
            showToast(`Attendance marked as ${status}`);
            fetchAttendance();
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to mark attendance', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setSnackbar({ open: true, message, type });
        setTimeout(() => setSnackbar({ ...snackbar, open: false }), 4000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Mark Attendance Form */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <CalendarCheck size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Mark Attendance</h3>
                            <p className="text-slate-500 text-sm">Update daily status</p>
                        </div>
                    </div>

                    <form onSubmit={handleMark} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Select Employee</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold appearance-none"
                                    value={selectedEmployee}
                                    onChange={(e) => setSelectedEmployee(e.target.value)}
                                >
                                    <option value="">Choose Employee...</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_id})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Effective Date</label>
                            <input
                                type="date"
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Status</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setStatus('Present')}
                                    className={`py-4 rounded-2xl font-bold flex flex-col items-center gap-2 border-2 transition-all ${status === 'Present'
                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-600 dark:bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 opacity-60'
                                        }`}
                                >
                                    <CheckCircle2 size={24} />
                                    <span>Present</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatus('Absent')}
                                    className={`py-4 rounded-2xl font-bold flex flex-col items-center gap-2 border-2 transition-all ${status === 'Absent'
                                            ? 'bg-rose-50 border-rose-500 text-rose-600 dark:bg-rose-950/20 shadow-lg shadow-rose-500/10'
                                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 opacity-60'
                                        }`}
                                >
                                    <XCircle size={24} />
                                    <span>Absent</span>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !selectedEmployee}
                            className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50 disabled:active:scale-100"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Confirm Attendance'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Attendance History */}
            <div className="lg:col-span-8 space-y-6">
                <AnimatePresence mode="wait">
                    {!selectedEmployee ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-12 text-center h-full flex flex-col items-center justify-center min-h-[500px]"
                        >
                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 mb-8">
                                <History size={48} />
                            </div>
                            <h3 className="text-2xl font-black mb-3">Attendance Dashboard</h3>
                            <p className="text-slate-500 max-w-sm font-medium">
                                Select an employee from the sidebar to view their full attendance history and performance metrics.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Stats Summary */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-emerald-500 dark:bg-emerald-600/20 p-6 rounded-[2rem] text-emerald-50 dark:text-emerald-400 border border-emerald-400/20">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-black uppercase tracking-widest opacity-80">Present Total</p>
                                        <ArrowUpRight size={16} />
                                    </div>
                                    <h4 className="text-4xl font-black">{summary.Present} <span className="text-sm font-bold opacity-70 italic">days</span></h4>
                                </div>
                                <div className="bg-rose-500 dark:bg-rose-600/20 p-6 rounded-[2rem] text-rose-50 dark:text-rose-400 border border-rose-400/20">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-black uppercase tracking-widest opacity-80">Absent Total</p>
                                        <ArrowDownRight size={16} />
                                    </div>
                                    <h4 className="text-4xl font-black">{summary.Absent} <span className="text-sm font-bold opacity-70 italic">days</span></h4>
                                </div>
                            </div>

                            {/* Filters & Table */}
                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div>
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <History size={20} className="text-primary" />
                                            Log History
                                        </h3>
                                        <p className="text-slate-500 text-sm mt-0.5">Records for {employees.find(e => e.id == selectedEmployee)?.full_name}</p>
                                    </div>

                                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl">
                                        <div className="flex items-center gap-2 px-3 border-r border-slate-200 dark:border-slate-700">
                                            <Filter size={14} className="text-slate-400" />
                                            <input
                                                type="date"
                                                className="bg-transparent text-xs font-bold focus:outline-none"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 px-3">
                                            <input
                                                type="date"
                                                className="bg-transparent text-xs font-bold focus:outline-none"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                            />
                                        </div>
                                        {(startDate || endDate) && (
                                            <button
                                                onClick={() => { setStartDate(''); setEndDate(''); }}
                                                className="p-1 px-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-[10px] font-black uppercase transition-colors"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="max-h-[500px] overflow-y-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10">
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {recordsLoading ? (
                                                [1, 2, 3].map(i => (
                                                    <tr key={i} className="animate-pulse">
                                                        <td className="px-8 py-5"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                                        <td className="px-8 py-5"><div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" /></td>
                                                        <td className="px-8 py-5"><div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full" /></td>
                                                    </tr>
                                                ))
                                            ) : (
                                                records.map((rec, idx) => (
                                                    <motion.tr
                                                        key={rec.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.03 }}
                                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors"
                                                    >
                                                        <td className="px-8 py-5 font-semibold text-sm">
                                                            {new Date(rec.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${rec.status === 'Present'
                                                                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                                                                    : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50'
                                                                }`}>
                                                                {rec.status === 'Present' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                                {rec.status}
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${rec.status === 'Present' ? 'bg-emerald-500 w-full' : 'bg-slate-200 dark:bg-slate-700 w-0'}`}
                                                                />
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                ))
                                            )}
                                            {records.length === 0 && !recordsLoading && (
                                                <tr>
                                                    <td colSpan="3" className="px-8 py-20 text-center">
                                                        <div className="flex flex-col items-center gap-3 opacity-30">
                                                            <Search size={40} />
                                                            <p className="font-bold text-sm italic">No records for this selection.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Toast Notification */}
            <AnimatePresence>
                {snackbar.open && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border font-bold text-sm ${snackbar.type === 'success'
                                ? 'bg-white dark:bg-slate-900 border-emerald-100 dark:border-emerald-900/30 text-emerald-600'
                                : 'bg-white dark:bg-slate-900 border-rose-100 dark:border-rose-900/30 text-rose-600'
                            }`}
                    >
                        {snackbar.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                        {snackbar.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Attendance;
