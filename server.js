const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const availableSlots = {
    '2024-08-01': ['10:00', '11:00', '12:00', '13:00'],
    '2024-08-02': ['14:00', '15:00', '16:00'],
};

app.get('/api/available-slots', (req, res) => {
    const date = req.query.date;
    if (!date) {
        return res.status(400).send('Missing date parameter');
    }
    const slots = availableSlots[date] || [];
    res.json(slots);
});


app.post('/api/book-appointment', (req, res) => {
    const { date, time, name, phone } = req.body;

    if (!date || !time || !name || !phone) {
        return res.status(400).send('Missing required fields');
    }

    if (!availableSlots[date] || !availableSlots[date].includes(time)) {
        return res.status(400).send('Selected time slot is not available');
    }

    const filePath = path.join(__dirname, 'public', 'appointments.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file ${filePath}:`, err);
            return res.status(500).send('Error reading appointments file');
        }

        let appointments = [];
        try {
            appointments = JSON.parse(data || '[]');
        } catch (parseErr) {
            console.error('Error parsing JSON:', parseErr);
            return res.status(500).send('Error parsing appointments file');
        }

        const isBooked = appointments.some(appointment => appointment.date === date && appointment.time === time);
        if (isBooked) {
            return res.status(400).send('Time slot is already booked');
        }

        appointments.push({ date, time, name, phone });

        fs.writeFile(filePath, JSON.stringify(appointments, null, 2), (writeErr) => {
            if (writeErr) {
                console.error(`Error writing file ${filePath}:`, writeErr);
                return res.status(500).send('Error booking appointment');
            }

            availableSlots[date] = availableSlots[date].filter(slot => slot !== time);
            res.send('Appointment booked successfully');
        });
    });
});

app.get('/api/appointments', (req, res) => {
    const adminKey = req.query.adminKey;
    const ADMIN_KEY = '12345'; // Change this to a secure key

    if (adminKey !== ADMIN_KEY) {
        return res.status(403).send('Access denied');
    }

    const filePath = path.join(__dirname, 'public', 'appointments.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file ${filePath}:`, err);
            return res.status(500).send('Error retrieving appointments');
        }

        let appointments = [];
        try {
            appointments = JSON.parse(data || '[]');
        } catch (parseErr) {
            console.error('Error parsing JSON:', parseErr);
            return res.status(500).send('Error parsing appointments file');
        }

        res.json(appointments);
    });


    // Add this after your existing routes in server.js

    app.post('/api/add-appointment', (req, res) => {
        const { date, time, name, phone } = req.body;
    
        if (!date || !time || !name || !phone) {
            return res.status(400).send('Missing required fields');
        }
    
        const filePath = path.join(__dirname, 'public', 'appointments.json');
    
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading file ${filePath}:`, err);
                return res.status(500).send('Error reading appointments file');
            }
    
            let appointments = [];
            try {
                appointments = JSON.parse(data || '[]');
            } catch (parseErr) {
                console.error('Error parsing JSON:', parseErr);
                return res.status(500).send('Error parsing appointments file');
            }
    
            const isBooked = appointments.some(appointment => appointment.date === date && appointment.time === time);
            if (isBooked) {
                return res.status(400).send('Time slot is already booked');
            }
    
            appointments.push({ date, time, name, phone });
    
            fs.writeFile(filePath, JSON.stringify(appointments, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error(`Error writing file ${filePath}:`, writeErr);
                    return res.status(500).send('Error adding appointment');
                }
    
                res.send('Appointment added successfully');
            });
        });
    });
    





    app.delete('/api/delete-appointment', (req, res) => {
        const { date, time, adminKey } = req.query;
        const ADMIN_KEY = '12345'; // מפתח ניהול
    
        if (adminKey !== ADMIN_KEY) {
            console.log('Access denied');
            return res.status(403).send('Access denied');
        }
    
        if (!date || !time) {
            console.log('Missing required fields');
            return res.status(400).send('Missing required fields');
        }
    
        const filePath = path.join(__dirname, 'public', 'appointments.json');
    
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading file ${filePath}:`, err);
                return res.status(500).send('Error reading appointments file');
            }
    
            let appointments = [];
            try {
                appointments = JSON.parse(data || '[]');
            } catch (parseErr) {
                console.error('Error parsing JSON:', parseErr);
                return res.status(500).send('Error parsing appointments file');
            }
    
            const originalLength = appointments.length;
            appointments = appointments.filter(appointment => !(appointment.date === date && appointment.time === time));
    
            if (appointments.length === originalLength) {
                console.log('Appointment not found');
                return res.status(404).send('Appointment not found');
            }
    
            fs.writeFile(filePath, JSON.stringify(appointments, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error(`Error writing file ${filePath}:`, writeErr);
                    return res.status(500).send('Error deleting appointment');
                }
    
                res.send('Appointment deleted successfully');
            });
        });
    });
    
    
    


});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
