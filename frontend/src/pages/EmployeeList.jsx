import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Search,
    UserPlus,
    Trash2,
    Mail,
    Hash,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Loader2
} from 'lucide-react';
import { employeeAPI } from '../api';
import EmployeeForm from '../components/EmployeeForm';

const SkeletonRow = () => (
    <tr className="animate-pulse">
        <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" /></td>
        <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" /></td>
        <td className="px-6 py-4"><div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" /></td>
        <td className="px-6 py-4"><div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" /></td>
        <td className="px-6 py-4"><div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-lg" /></td>
    </tr>
);

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const { data } = await employeeAPI.getAll();
            setEmployees(data);
        } catch (err) {
            console.error('Failed to fetch employees', err);
            showToast('Failed to load employees', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const showToast = (message, type = 'success') => {
        setSnackbar({ open: true, message, type });
        setTimeout(() => setSnackbar({ ...snackbar, open: false }), 4000);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this employee? This action cannot be undone.')) {
            try {
                await employeeAPI.delete(id);
                showToast('Employee removed successfully');
                fetchEmployees();
            } catch (err) {
                showToast('Failed to remove employee', 'error');
            }
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search name, ID or department..."
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary text-white py-3 px-6 rounded-2xl font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all text-sm"
                >
                    <UserPlus size={18} /> Add Employee
                </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee Name</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee ID</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)
                            ) : (
                                <AnimatePresence>
                                    {filteredEmployees.map((emp, idx) => (
                                        <motion.tr
                                            key={emp.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-sm uppercase shadow-sm">
                                                        {emp.full_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold">{emp.full_name}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Member</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-sm leading-none">{emp.employee_id}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                                                    <Mail size={14} className="opacity-50" />
                                                    {emp.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-4 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider rounded-full border border-primary/20">
                                                    {emp.department}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(emp.id)}
                                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                    title="Remove Employee"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && filteredEmployees.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 mb-6">
                            <Users size={40} />
                        </div>
                        <h4 className="text-xl font-bold mb-2">No employees found</h4>
                        <p className="text-slate-500 max-w-xs mx-auto">
                            {searchTerm
                                ? `We couldn't find anything matching "${searchTerm}". Try a different term.`
                                : "Start building your team! Add your first employee to get started."}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="mt-6 flex items-center gap-2 text-primary font-bold hover:underline"
                            >
                                <UserPlus size={18} /> Add New Employee
                            </button>
                        )}
                    </div>
                )}
            </div>

            <EmployeeForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onRefresh={fetchEmployees}
            />

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

export default EmployeeList;
