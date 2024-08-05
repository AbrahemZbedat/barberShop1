const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({
    secret: '12345',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // secure: true if you use https
}));

app.use(passport.initialize());
app.use(passport.session());



app.use(session({
    secret: '12345',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // secure: true if you use https
}));

let users = {};
if (fs.existsSync('users.json')) {
    users = JSON.parse(fs.readFileSync('users.json'));
}

passport.use(new GoogleStrategy({
    clientID: '758925251707-ct6sagadmh2afegfdirfv77vcsggviku.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:3000/auth/google/callback'
}, function(token, tokenSecret, profile, done) {
    let user = users[profile.id] || {};
    user.id = profile.id;
    user.name = profile.displayName;
    user.email = profile.emails[0].value;
    users[profile.id] = user;
    fs.writeFileSync('users.json', JSON.stringify(users));
    return done(null, user);
}));

passport.use(new FacebookStrategy({
    clientID: 'YOUR_FACEBOOK_CLIENT_ID',
    clientSecret: 'YOUR_FACEBOOK_CLIENT_SECRET',
    callbackURL: 'http://localhost:3000/auth/facebook/callback'
}, function(accessToken, refreshToken, profile, done) {
    let user = users[profile.id] || {};
    user.id = profile.id;
    user.name = profile.displayName;
    user.email = profile.emails ? profile.emails[0].value : '';
    users[profile.id] = user;
    fs.writeFileSync('users.json', JSON.stringify(users));
    return done(null, user);
}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    done(null, users[id]);
});

app.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/index.html' }), function(req, res) {
    res.redirect('/home.html');
});

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/index.html' }), function(req, res) {
    res.redirect('/home.html');
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (users[username] && users[username].password === password) {
        const sessionId = new Date().getTime();
        users[username].sessionId = sessionId;
        fs.writeFileSync('users.json', JSON.stringify(users));
        res.cookie('session', sessionId, { httpOnly: true });
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
    }
});

app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (users[username]) {
        res.sendStatus(409);
    } else {
        users[username] = { password, cart: [] };
        fs.writeFileSync('users.json', JSON.stringify(users));
        res.sendStatus(200);
    }
});

app.get('/api/user', (req, res) => {
    const sessionId = req.cookies.session;
    const user = Object.values(users).find(u => u.sessionId == sessionId);
    if (user) {
        res.json({ username: user.username, cart: user.cart });
    } else {
        res.sendStatus(401);
    }
});

/* login code end */
/******************************************************************************************************************** */
/******************************************************************************************************************** */
/******************************************************************************************************************** */

const availableSlots = {
    '2024-08-01': ['10:00', '11:00', '12:00', '13:00'],
    '2024-08-02': ['14:00', '15:00', '16:00'],
    '2024-08-11': ['14:00', '15:00', '16:00'],
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
});

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
        return res.status(403).send('Access denied');
    }

    if (!date || !time) {
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


/********************** */
app.post('/api/update-slots', (req, res) => {
    const { date, time } = req.body;

    if (!date || !time) {
        return res.status(400).send('Missing required fields');
    }

    availableSlots[date] = time; // עדכון הזמנים לזמן שנבחר

    res.send('Slots updated successfully');
});



app.post('/api/remove-slots', (req, res) => {
    const { date, time } = req.body;

    if (!date || !time) {
        return res.status(400).send('Missing required fields');
    }

    if (!availableSlots[date]) {
        return res.status(404).send('Date not found');
    }

    // מסנן את זמני התור הקיימים ומוחק את הזמנים שנבחרו
    availableSlots[date] = availableSlots[date].filter(slot => !time.includes(slot));

    res.send('Slots removed successfully');
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
