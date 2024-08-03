const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // הוסף את המודול fs

const app = express();
const PORT = 3000;

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

    // Read the appointments from appointments.json
    fs.readFile('./PRIVATE/appointments.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading appointments file');
        }

        let appointments = JSON.parse(data || '[]'); // Parse existing data or start with an empty array

        // Check if the time slot is already booked
        const isBooked = appointments.some(appointment => appointment.date === date && appointment.time === time);
        if (isBooked) {
            return res.status(400).send('Time slot is already booked');
        }

        // Book the appointment
        appointments.push({ date, time, name, phone }); // Add the new appointment
        fs.writeFile('./PRIVATE/appointments.json', JSON.stringify(appointments, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error booking appointment');
            }

            // Remove the booked slot from available slots
            availableSlots[date] = availableSlots[date].filter((slot) => slot !== time);
            res.send('Appointment booked successfully');
        });
    });
});

// Endpoint to get all appointments
app.get('/api/appointments', (req, res) => {
    fs.readFile('./PRIVATE/appointments.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error retrieving appointments');
        }
        const appointments = JSON.parse(data || '[]');
        res.json(appointments);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
