const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes - Employee Management
app.get('/api/employees', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM employees ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/employees', async (req, res) => {
    const { employee_id, full_name, email, department } = req.body;

    if (!employee_id || !full_name || !email || !department) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const result = await db.query(
            'INSERT INTO employees (employee_id, full_name, email, department) VALUES ($1, $2, $3, $4) RETURNING *',
            [employee_id, full_name, email, department]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Employee ID or Email already exists' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/api/employees/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM employees WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Routes - Statistics
app.get('/api/stats/dashboard', async (req, res) => {
    try {
        const totalEmployeesResult = await db.query('SELECT COUNT(*) FROM employees');
        const todayAttendanceResult = await db.query(
            "SELECT COUNT(*) FROM attendance WHERE date = CURRENT_DATE AND status = 'Present'"
        );
        const deptResult = await db.query(
            'SELECT department, COUNT(*) as count FROM employees GROUP BY department'
        );

        res.json({
            totalEmployees: parseInt(totalEmployeesResult.rows[0].count),
            todayAttendance: parseInt(todayAttendanceResult.rows[0].count),
            departments: deptResult.rows.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Routes - Attendance Management
app.get('/api/attendance/:employee_id', async (req, res) => {
    const { employee_id } = req.params;
    const { startDate, endDate } = req.query;

    let query = 'SELECT * FROM attendance WHERE employee_id = $1';
    const params = [employee_id];

    if (startDate && endDate) {
        query += ' AND date BETWEEN $2 AND $3';
        params.push(startDate, endDate);
    }

    query += ' ORDER BY date DESC';

    try {
        const result = await db.query(query, params);

        // Calculate summary
        const summaryResult = await db.query(
            "SELECT status, COUNT(*) as count FROM attendance WHERE employee_id = $1 GROUP BY status",
            [employee_id]
        );

        const summary = {
            Present: 0,
            Absent: 0
        };

        summaryResult.rows.forEach(row => {
            summary[row.status] = parseInt(row.count);
        });

        res.json({
            records: result.rows,
            summary
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/attendance', async (req, res) => {
    const { employee_id, date, status } = req.body;

    if (!employee_id || !date || !status) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const result = await db.query(
            'INSERT INTO attendance (employee_id, date, status) VALUES ($1, $2, $3) ON CONFLICT (employee_id, date) DO UPDATE SET status = EXCLUDED.status RETURNING *',
            [employee_id, date, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', database: 'postgresql' });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
