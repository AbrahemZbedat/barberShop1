const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Simulated available slots for the barber
const availableSlots = {
    '2024-08-01': ['10:00', '11:00', '12:00', '13:00'],
    '2024-08-02': ['14:00', '15:00', '16:00'],
};

// Define the path to the appointments file in the temp directory
const tempDir = path.join(__dirname, 'temp');
const filePath = path.join(tempDir, 'appointments.json');

// Ensure the temp directory exists
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

// Ensure the file exists
if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
}

// Endpoint to get available slots
app.get('/api/available-slots', (req, res) => {
    res.json(availableSlots);
});

// Endpoint to book an appointment
app.post('/api/book-appointment', (req, res) => {
    const { date, time, name, phone } = req.body;

    if (!date || !time || !name || !phone) {
        return res.status(400).send('Missing required fields');
    }

    if (!availableSlots[date] || !availableSlots[date].includes(time)) {
        return res.status(400).send('Selected time slot is not available');
    }

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

            console.log('Appointment booked successfully');
            availableSlots[date] = availableSlots[date].filter(slot => slot !== time);
            res.send('Appointment booked successfully');
        });
    });
});

// Endpoint to get all appointments
app.get('/api/appointments', (req, res) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file ${filePath}:`, err);
            return res.status(500).send('Error retrieving appointments');
        }
        const appointments = JSON.parse(data || '[]');
        res.json(appointments);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
