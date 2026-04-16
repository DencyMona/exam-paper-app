const path = require ('path');
const bodyParser = require('body-parser');
const multer = require("multer");
const bcrypt = require('bcrypt');
const db = require('./db.js');
const fs = require('fs');
const session = require("express-session");
const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000;

// ------------------- CORS ------------------- //
const allowedOrigins = [
  "http://localhost:5173",        // for local dev
  "http://192.168.18.47:5173",    // your frontend app
  "http://192.168.18.47:3000",    // optional if frontend also runs on port 3000
];

app.use(
  cors({
    origin: function (origin, callback) {
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(" Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, 
  })
);


// ------------------- MIDDLEWARE ------------------- //
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files
app.use('/css', express.static(path.join(__dirname, '../css')));
app.use('/js', express.static(path.join(__dirname, '../js')));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/partials', express.static(path.join(__dirname, '../partials')));

//SESSION SETUP
app.use(session({
  secret: "your_secret_key",  
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}));

function requireLogin(req, res, next) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  if (!req.session || !req.session.user) {
    return res.redirect("/"); 
  }
  next();
}

// HTML pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));
app.get('/admins', requireLogin, (req, res) => res.sendFile(path.join(__dirname, '../admins.html')));
app.get('/viewAdmins', requireLogin, (req, res) => res.sendFile(path.join(__dirname, '../viewAdmins.html')));
app.get('/dashboard', requireLogin, (req, res) => res.sendFile(path.join(__dirname, '../dashboard.html')));
app.get('/academic', requireLogin, (req, res) => res.sendFile(path.join(__dirname, '../academic.html')));
app.get('/viewAcademics', requireLogin, (req, res) => res.sendFile(path.join(__dirname, '../viewAcademics.html')));
app.get('/course', requireLogin, (req, res) => res.sendFile(path.join(__dirname, '../course.html')));
app.get('/viewCourses', requireLogin, (req, res) => res.sendFile(path.join(__dirname, '../viewCourses.html')));
app.get('/year', requireLogin, (req, res) => res.sendFile(path.join(__dirname, '../year.html')));
app.get('/viewYear', requireLogin, (req, res) => res.sendFile(path.join(__dirname, '../viewYear.html')));
app.get('/subject', requireLogin, (req, res) => res.sendFile(path.join(__dirname, '../subject.html')));
app.get('/viewSubject', requireLogin, (req, res) => res.sendFile(path.join(__dirname, '../viewSubject.html')));
app.get('/pastpaper', requireLogin, (req, res) => res.sendFile(path.join(__dirname, '../pastpaper.html')));
app.get('/viewPastpaper', requireLogin, (req, res) => res.sendFile(path.join(__dirname, '../viewPastpaper.html')));
app.get('/userUpload', requireLogin, (req, res) => res.sendFile(path.join(__dirname, '../userUpload.html')));


//-------------COUNTS------------//
app.get("/api/counts", (req, res) => {
  const queries = {
    admins: "SELECT COUNT(*) AS total FROM admin",
    academics: "SELECT COUNT(*) AS total FROM academics",
    courses: "SELECT COUNT(*) AS total FROM course",
    subjects: "SELECT COUNT(*) AS total FROM subject",
    pastpapers: "SELECT COUNT(*) AS total FROM pastpaper"
  };

  const results = {};
  let done = 0;

  Object.entries(queries).forEach(([key, sql]) => {
    db.query(sql, (err, rows) => {
      if (err) {
        console.error(`Error counting ${key}:`, err);
        results[key] = 0;
      } else {
        results[key] = rows[0].total;
      }
      done++;
      if (done === Object.keys(queries).length) {
        res.json(results);
      }
    });
  });
});

// ------------------- LOGIN ------------------- //
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send('Provide username & password');

  db.query('SELECT * FROM admin WHERE username = ?', [username], async (err, results) => {
    if (err) return res.status(500).send('Database error.');
    if (results.length === 0) return res.status(401).send('Invalid username or password.');

    const user = results[0];
    let match = false;

    if (user.password.startsWith('$2')) {
      match = await bcrypt.compare(password, user.password);
    } else {
      match = password === user.password;
    }

    if (match) {
      req.session.user = {
        id: user.id,  
        username: user.username
      };

      return res.redirect('/dashboard');
    } else {
      return res.status(401).send('Invalid username or password.');
    }
  });
});

// ------------------- LOGOUT ------------------- //
app.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).send("Logout failed");
      }
      res.redirect("/"); 
    });
  } else {
    res.redirect("/");
  }
});

// ------------------- ADMINS ------------------- //
// Add new admin
app.post('/api/admin', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send('Username & password required');

  const hashedPassword = await bcrypt.hash(password, 10);
  db.query('INSERT INTO admin (username, password) VALUES (?, ?)', [username, hashedPassword], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ id: result.insertId, username });
  });
});
// Get all admins
app.get('/api/admin', (req, res) => {
  db.query('SELECT id, username FROM admin', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});
// Update admin
app.put('/api/admin/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;

  if (!username) return res.status(400).send('Username is required');

  try {
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      db.query('UPDATE admin SET username = ?, password = ? WHERE id = ?', [username, hashedPassword, id], (err) => {
        if (err) return res.status(500).send(err);
        res.send('Admin updated successfully');
      });
    } else {
      db.query('UPDATE admin SET username = ? WHERE id = ?', [username, id], (err) => {
        if (err) return res.status(500).send(err);
        res.send('Admin updated successfully');
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
// Delete admin
app.delete('/api/admin/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM admin WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Admin deleted successfully');
  });
});

// ------------------- ACADEMICS ------------------- //
// Add academic
app.post('/api/academic', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).send('Academic name required');

  db.query('INSERT INTO academics (academic_name) VALUES (?)', [name], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ academic_id: result.insertId, academic_name: name });
  });
});
// Get academics
app.get('/api/academic', (req, res) => {
  db.query('SELECT academic_id, academic_name FROM academics', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});
// Update academic
app.put('/api/academic/:id', (req, res) => {
  const { id } = req.params;
  const { academic_name } = req.body;

  db.query('UPDATE academics SET academic_name = ? WHERE academic_id = ?', [academic_name, id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true });
  });
});
// Delete academic
app.delete('/api/academic/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM academics WHERE academic_id = ?', [id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true });
  });
});

//------------------- COURSES ------------------- //
// Add course
app.post('/api/course', (req, res) => {
  const { course_name, academic_id } = req.body;
  if (!course_name || !academic_id) return res.status(400).send('All fields required');

  db.query(
    'INSERT INTO course (course_name, academic_id) VALUES (?, ?)',
    [course_name, academic_id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ course_id: result.insertId, course_name, academic_id });
    }
  );
});
//  course by academic
app.get('/api/course/byAcademic/:academicId', (req, res) => {
  const { academicId } = req.params;
  db.query(
    'SELECT course_id, course_name FROM course WHERE academic_id = ?',
    [academicId],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    }
  );
});
// Get all courses
app.get('/api/course/:academicId', (req, res) => {
  const { academicId } = req.params;

  const query = 'SELECT course_id, course_name FROM course WHERE academic_id = ?';
  db.query(query, [academicId], (err, results) => {
    if (err) {
      console.error('Error fetching courses:', err);
      return res.status(500).send(err.message);
    }
    res.json(results);
  });
});

app.put('/api/course/:id', (req, res) => {
  const { id } = req.params;
  const { course_name } = req.body;
  if (!course_name) return res.status(400).send('Course name required');

  db.query('UPDATE course SET course_name = ? WHERE course_id = ?', [course_name, id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true });
  });
});
// Delete course
app.delete('/api/course/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM course WHERE course_id = ?', [id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true });
  });
});

// ------------------- YEARS ------------------- //
app.post('/api/year', (req, res) => {
  const { year_name, academic_id, course_id } = req.body;
  if (!year_name || !academic_id || !course_id) {
    return res.status(400).send('All fields required');
  }

  db.query(
    'INSERT INTO year (year_name, academic_id, course_id) VALUES (?, ?, ?)',
    [year_name, academic_id, course_id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ year_id: result.insertId, year_name, academic_id, course_id });
    }
  );
});

app.get('/api/year', (req, res) => {
  db.query(
    `SELECT y.year_id, y.year_name, a.academic_name, c.course_name
     FROM year y
     JOIN academics a ON y.academic_id = a.academic_id
     JOIN course c ON y.course_id = c.course_id`,
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    }
  );
});

app.get('/api/year/byAcademic/:academicId', (req, res) => {
  const { academicId } = req.params;
  db.query(
    'SELECT year_id, year_name FROM year WHERE academic_id = ?',
    [academicId],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    }
  );
});

app.get('/api/year/byCourse/:courseId', (req, res) => {
  const { courseId } = req.params;
  db.query(
    'SELECT year_id, year_name FROM year WHERE course_id = ?',
    [courseId],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    }
  );
});

// Update year
app.put('/api/year/:id', (req, res) => {
  const { id } = req.params;
  const { year_name } = req.body;
  if (!year_name) return res.status(400).send('Year name required');

  db.query('UPDATE year SET year_name = ? WHERE year_id = ?', [year_name, id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true });
  });
});

//  Delete year
app.delete('/api/year/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM year WHERE year_id = ?', [id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true });
  });
});

//------------------- SUBJECTS ------------------- //

// Add Subject
app.post('/api/subject', (req, res) => {
  const { subject_name, academic_id, course_id, year_id } = req.body;

  if (!subject_name || !academic_id || !course_id || !year_id) {
    return res.status(400).send("All fields required");
  }

  const sql = `
    INSERT INTO subject (subject_name, academic_id, course_id, year_id)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [subject_name, academic_id, course_id, year_id], (err, result) => {
    if (err) {
      console.error("DB Insert Error:", err);
      return res.status(500).send("Database insert failed");
    }
    res.json({ message: "Subject added successfully!", id: result.insertId });
  });
});

// Get all subjects
app.get('/api/subject', (req, res) => {
  const sql = `
    SELECT s.subject_id, s.subject_name, a.academic_name, c.course_name, y.year_name
    FROM subject s
    JOIN academics a ON s.academic_id = a.academic_id
    JOIN course c ON s.course_id = c.course_id
    JOIN year y ON s.year_id = y.year_id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Update subject
app.put('/api/subject/:id', (req, res) => {
  const { id } = req.params;
  const { subject_name } = req.body;
  if (!subject_name) return res.status(400).send("Subject name required");

  db.query(
    'UPDATE subject SET subject_name = ? WHERE subject_id = ?',
    [subject_name, id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.json({ success: true });
    }
  );
});

// Delete subject
app.delete('/api/subject/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM subject WHERE subject_id = ?', [id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true });
  });
});

// Get all subjects 
app.get('/api/subject/byYear/:yearId', (req, res) => {
  const { yearId } = req.params;
  const query = `
    SELECT subject_id, subject_name
    FROM subject
    WHERE year_id = ?
  `;
  db.query(query, [yearId], (err, results) => {
    if (err) return res.status(500).send(err.message);
    res.json(results);
  });
});

// Live search subjects 
app.get("/api/subject/search", (req, res) => {
  const { query = "", academic_id, course_id, year_id } = req.query;

  let sql = `
    SELECT s.subject_id, s.subject_name, a.academic_name, c.course_name, y.year_name
    FROM subject s
    JOIN academics a ON s.academic_id = a.academic_id
    JOIN course c ON s.course_id = c.course_id
    JOIN year y ON s.year_id = y.year_id
    WHERE s.subject_name LIKE ?
  `;
  const params = [`%${query}%`];

  if (academic_id) {
    sql += " AND s.academic_id = ?";
    params.push(academic_id);
  }
  if (course_id) {
    sql += " AND s.course_id = ?";
    params.push(course_id);
  }
  if (year_id) {
    sql += " AND s.year_id = ?";
    params.push(year_id);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// -------------------PASTPAPERS------------------- //
 //upload folder
const uploadDir = path.join(__dirname, 'uploads/pastpapers');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

// POST route to add pastpaper 
app.post("/api/pastpaper", upload.single("file"), (req, res) => {
  const { subject_id, exam_year } = req.body;
  if (!req.file) {
    return res.status(400).json({ error: "File is required." });
  }
  
  const relativePath = `uploads/pastpapers/${req.file.filename}`;

  const sql = `
    INSERT INTO pastpaper (subject_id, exam_year, file_path)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [subject_id, exam_year, relativePath], (err, result) => {
    if (err) {
      console.error("DB Insert Error:", err);
      return res.status(500).json({ error: "Database insert failed." });
    }
    res.json({ message: "Pastpaper added successfully!", id: result.insertId });
  });
});

// Get all pastpapers
app.get("/api/pastpaper", (req, res) => {
  const sql = `
    SELECT p.*, s.subject_name
    FROM pastpaper p
    JOIN subject s ON p.subject_id = s.subject_id
    ORDER BY p.exam_year DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});
//Get Pastpapers by Subject 
app.get("/api/pastpaper/bySubject/:subjectId", (req, res) => {
  const { subjectId } = req.params;
  const sql = `
    SELECT p.*, s.subject_name
    FROM pastpaper p
    JOIN subject s ON p.subject_id = s.subject_id
    WHERE p.subject_id = ?
    ORDER BY p.exam_year DESC
  `;
  db.query(sql, [subjectId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Delete Pastpaper 
app.delete("/api/pastpaper/:id", (req, res) => {
  const { id } = req.params;

  db.query("SELECT file_path FROM pastpaper WHERE pastpaper_id = ?", [id], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(404).send("Pastpaper not found");

    const filePath = results[0].file_path; 
    const absolutePath = path.join(__dirname, filePath);

    db.query("DELETE FROM pastpaper WHERE pastpaper_id = ?", [id], (err2) => {
      if (err2) return res.status(500).send(err2);

      // Delete physical file 
      fs.unlink(absolutePath, (fsErr) => {
        if (fsErr) console.error("Failed to delete file:", fsErr);
      });

      res.json({ success: true });
    });
  });
});


// Get Academic,Course,year for a Subject
app.get("/api/subject/:id", (req, res) => {
  const { id } = req.params;
  const sql = `
   SELECT c.course_name, y.year_name, a.academic_name
    FROM subject s
    JOIN academics a ON s.academic_id = a.academic_id
    JOIN course c ON s.course_id = c.course_id
    JOIN year y ON s.year_id = y.year_id
    WHERE s.subject_id = ?
    LIMIT 1
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("DB Query Error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Subject not found" });
    }
    res.json({
      academic:  results[0].academic_name,
      course: results[0].course_name,
      year: results[0].year_name,
    });
  });
});

// ------------------- PAPERS ------------------- //

// Create folder for papers
const paperUploadDir = path.join(__dirname, 'uploads/papers');
if (!fs.existsSync(paperUploadDir)) {
  fs.mkdirSync(paperUploadDir, { recursive: true });
}

// Separate Multer setup for papers
const paperStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, paperUploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
const paperUpload = multer({ storage: paperStorage });

// Paper upload route
app.post('/api/paper/upload', paperUpload.single('file'), (req, res) => {
  console.log(" File received:", req.file);
  console.log(" Body data:", req.body);

  const { academicId, courseId, yearId, subjectId, examYear } = req.body;

  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const filePath = `uploads/papers/${req.file.filename}`;

  const sql = `
    INSERT INTO papers 
      (academic_id, course_id, year_id, subject_id, exam_year, file_path)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [academicId, courseId, yearId, subjectId, examYear, filePath], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ success: false, message: "Database insert failed" });
    }
    console.log(" Inserted into DB:", result);
    res.status(200).json({ success: true });
  });
});

// ------------------ Fetch all papers ------------------ //
app.get("/api/papers", (req, res) => {
  const sql = "SELECT * FROM papers ORDER BY uploaded_at DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error(" Error fetching papers:", err);
      return res.status(500).json({ success: false, message: "Error fetching papers" });
    }
    res.json(results);
  });
});

// ------------------ Delete a paper ------------------ //
app.delete("/api/papers/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM papers WHERE paper_id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(" Error deleting paper:", err);
      return res.status(500).json({ success: false, message: "Error deleting paper" });
    }
    res.json({ success: true });
  });
});

/* ------------------- START SERVER ------------------- */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

