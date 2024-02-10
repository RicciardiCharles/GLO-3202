const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const PORT = process.env.BACKEND_PORT;

// Mise en place des middlewares
app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24h
    }
}));

const usersFilePath = './storage/users.json';

// Génère une grille initiale blanche de 32x32
const createInitialGrid = () => {
    return Array(32).fill(null).map(() => Array(32).fill('white'));
};

// Permet de récupérer la grille de l'utilisateur
app.get('/getGrid', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Not authenticated');
    }

    const userId = req.session.userId;

    // Si l'utilisateur est connecté on récupère sa grille
    try {
        const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
        const user = usersData.find(user => user.id === userId);

        if (!user) {
            return res.status(404).send('User not found.');
        }

        if (!user.grid) {
            // Si l'utilisateur n'a pas de grille on lui en crée une
            return res.json(createInitialGrid());
        }
        return res.json(user.grid);
    } catch (error) {
        console.error('Error retrieving the grid:', error);
        res.status(500).send('Failed to retrieve the grid');
    }
});

// Sauvegarde la grille de l'utilisateur
app.post('/saveGrid', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Not authenticated');
    }

    const { grid } = req.body;
    const userId = req.session.userId;

    try {
        const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));

        const userIndex = usersData.findIndex(user => user.id === userId);
        if (userIndex === -1) {
            return res.status(404).send('User not found.');
        }

        usersData[userIndex].grid = grid;

        fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));

        res.send('Grid saved successfully');
    } catch (error) {
        console.error('Error saving the grid:', error);
        res.status(500).send('Failed to save the grid');
    }
});

// Permet à un utilisateur de s'inscrire
app.post('/register', async (req, res) => {
    const { username, password, email, phoneNumber } = req.body;
    // Hash le mot de passe avec bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));


    const emailExists = usersData.some(user => user.email === email);

    if (emailExists) {
        return res.status(400).send('Email already exists.');
    }

    const newUser = {
        id: uuidv4(),
        username,
        password: hashedPassword,
        email,
        phoneNumber
    };

    usersData.push(newUser);
    fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));

    res.status(201).send('User registered successfully.');
});

// Permet à un utilisateur de se connecter
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
    const user = usersData.find(user => user.email === email);

    if (!user) {
        return res.status(400).send('User not found.');
    }

    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (passwordMatch) {
        req.session.userId = user.id;
        req.session.save(err => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).send('Internal server error');
            }
            res.send('Login successful.');
        });
    } else {
        res.status(400).send('Password is incorrect.');
    }
});

// Empêche l'utilisateur d'accéder à home s'il n'est pas connecté
app.get('/home', (req, res) => {
    if (req.session.userId) {
        res.send('This is protected content.');
    } else {
        res.status(401).send('Not authenticated');
    }
});

// Permet à un utilisateur de se déconnecter
app.get('/logout', (req, res) => {
    // Détruit la session de l'utilisateur
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Failed to log out');
        }
        // Détruit le cookie de l'utilisateur
        res.clearCookie('connect.sid', { path: '/' });
        res.send('Logged out');
    });
});

app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

app.listen(PORT, '::', () => {
    console.log(`Server running on port [::]${PORT}`);
});

