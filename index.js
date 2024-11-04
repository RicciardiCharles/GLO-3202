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
const PORT = process.env.PORT || 3000;
const secretKey = process.env.SECRET_KEY;
const { MongoClient } = require('mongodb');
const mongoClient = new MongoClient(process.env.MONGODB_URI);

let db;

// Connexion à la base de données à partir des variables d'environnement
mongoClient.connect()
    .then(client => {
        console.log('Connected to MongoDB');
        db = client.db(process.env.DB_NAME);
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
    });


// Mise en place des middlewares
app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: secretKey,
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
app.get('/getGrid', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Not authenticated');
    }
    const userId = req.session.userId;
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ id: userId });

    if (!user) {
        return res.status(404).send('User not found.');
    }

    if (!user.grid) {
        return res.json(createInitialGrid());
    }
    return res.json(user.grid);
});


// Sauvegarde la grille de l'utilisateur
app.post('/saveGrid', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Not authenticated');
    }

    const { grid } = req.body;
    const userId = req.session.userId;
    const usersCollection = db.collection('users');

    await usersCollection.updateOne({ id: userId }, { $set: { grid: grid } });
    res.send('Grid saved successfully');
});

// Permet à un utilisateur de publier sa grille et la sauvegarde dans la collection 'gallery'
app.post('/publishGrid', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Not authenticated');
    }

    const userId = req.session.userId;
    const { grid } = req.body;
    const publishedAt = new Date();

    const gallery = db.collection('gallery');
    const result = await gallery.insertOne({grid: grid});

    if (result.acknowledged) {
        res.send('Grid published successfully');
    }
    else {
        res.status(500).send('Failed to publish grid');
    }
});

// Récupère toutes les grilles publiées dans la collection 'gallery'
app.get('/getGallery', async (req, res) => {
    const gallery = db.collection('gallery');
    const grids = await gallery.find().toArray();
    res.json(grids);
});

// Permet à un utilisateur de s'inscrire
app.post('/register', async (req, res) => {
    const { username, password, email, phoneNumber } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const usersCollection = db.collection('users'); // Use the 'users' collection

    const emailExists = await usersCollection.findOne({ email: email });

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

    await usersCollection.insertOne(newUser);
    res.status(201).send('User registered successfully.');
});

// Permet à un utilisateur de se connecter
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email: email });

    if (!user) {
        return res.status(400).send('User not found.');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
        req.session.userId = user.id;
        res.send('Login successful.');
    } else {
        res.status(400).send('Password is incorrect.');
    }
});

// Récupère les informations de l'utilisateur
app.get('/user/profile', async (req, res) => {
    console.log('Session:', req.session)
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const userId = req.session.userId;
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ id: userId });

    if (!user) {
        return res.status(404).send('User not found.');
    }

    res.json({
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber
    });
}
);

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

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port 0.0.0.0:${PORT}`);
});

