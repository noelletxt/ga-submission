const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const port = 4000
const app = express();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    port: 3316,
    database: 'ga237'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Set up view engine
app.set('view engine', 'ejs');

// Enable static files
app.use(express.static('public'));

// Enable form processing
app.use(express.urlencoded({
    extended: false
}));

// Define routes

// Example: Home route
app.get('/', (req, res) => {
    connection.query('SELECT * FROM recipes', (error, results) => {
        if (error) throw error;
        res.render('index', { recipes: results }); // Render HTML page with data
    });
});

// Route to get recipe by ID
app.get('/recipe/:id', (req, res) => {
    const recipeId = req.params.id;
    const sql = 'SELECT * FROM recipes WHERE recipeId = ?';
    connection.query(sql, [recipeId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving recipe by ID');
        }
        if (results.length > 0) {
            res.render('recipe', { recipe: results[0] });
        } else {
            res.status(404).send('recipe not found');
        }
    });
});

app.get('/recipe/:image', (req, res) => {
    const images = req.params.image;
    let sql = `SELECT name, ingredients, instruction, image FROM recipelist WHERE image = ?`;
    db.query(sql, [images], (err, result) => {
        if (err) throw err;
        res.json(result[0]);
    });
});

app.get('/recipe', (req, res) => {
    let sql = `SELECT name, ingredients, instruction, image FROM recipelist WHERE image = 'ccc.png'`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.render('recipe', { recipe: result[0] });
    });
});


// Route to display add recipe form
app.get('/addRecipe', (req, res) => {
    res.render('addRecipe');
});

// Route to add a new recipe
app.post('/addRecipe', upload.single('image'), (req, res) => {
    const { name, ingredients, instructions, currentImage } = req.body;
    let image;
    if (req.file) {
        image = req.file.filename;
    } else {
        image = null;
    }

    const sql = 'INSERT INTO recipes (name, ingredients, instructions, image) VALUES (?,?,?,?)';
    connection.query(sql, [ name, ingredients, instructions, currentImage], (error, results) => {
        if (error) {
            console.error('Error adding recipe:', error);
            res.status(500).send('Error adding recipe');
        } else {
            res.redirect('/');
        }
    });
});

// Route to display edit recipe form
app.get('/editRecipe/:id', (req, res) => {
    const recipeId = req.params.id;
    const sql = 'SELECT * FROM recipes WHERE recipeId = ?';
    connection.query(sql, [recipeId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving recipe by ID');
        }
        if (results.length > 0) {
            res.render('editRecipe', { recipes : results[0] });
        } else {
            res.status(404).send('recipe not found');
        }
    });
});

// Route to update a recipe
app.post('/editRecipe/:id', upload.single('image'), (req, res) => {
    const recipeId = req.params.id;
    const { name, ingredients, instructions, currentImage } = req.body;
    let image = currentImage;
    if (req.file) {
        image = req.file.filename;
    }

    const sql = 'UPDATE recipes SET name = ?, ingredients = ?, instructions = ?, image = ? WHERE recipeId = ?';

    connection.query(sql, [name, ingredients, instructions, currentImage], (error, results) => {
        if (error) {
            console.error('Error updating recipe:', error);
            res.status(500).send('Error updating recipe');
        } else {
            res.redirect('/');
        }
    });
});

// Route to delete a recipe
app.get('/deleteRecipe/:id', (req, res) => {
    const recipeId = req.params.id;
    const sql = 'DELETE FROM recipes WHERE recipeId = ?';
    connection.query(sql, [recipeId], (error, results) => {
        if (error) {
            console.error('Error deleting recipe:', error);
            res.status(500).send('Error deleting recipe');
        } else {
            res.redirect('/');
        }
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
