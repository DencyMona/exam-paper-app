const academicSelect = document.getElementById("academicSelect");
const courseSelect = document.getElementById("courseSelect");
const yearSelect = document.getElementById("yearSelect");
const subjectForm = document.getElementById("subjectForm");

// Load Academics
document.addEventListener("DOMContentLoaded", loadAcademics);

async function loadAcademics() {
  try {
    const res = await fetch("/api/academic");
    const academics = await res.json();

    academicSelect.innerHTML = '<option value="">Choose Academic</option>';
    academics.forEach(a => {
      const option = document.createElement("option");
      option.value = a.academic_id;
      option.textContent = a.academic_name;
      academicSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error loading academics:", err);
  }
}

// Load Courses 
academicSelect.addEventListener("change", async () => {
  const academicId = academicSelect.value;
  courseSelect.innerHTML = '<option value="">Choose Course</option>';
  yearSelect.innerHTML = '<option value="">Choose Year</option>';

  if (!academicId) return;

  try {
    const res = await fetch(`/api/course/byAcademic/${academicId}`);
    const courses = await res.json();

    courses.forEach(c => {
      const option = document.createElement("option");
      option.value = c.course_id;
      option.textContent = c.course_name;
      courseSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error loading courses:", err);
  }
});

// Load Years 
courseSelect.addEventListener("change", async () => {
  const courseId = courseSelect.value;
  yearSelect.innerHTML = '<option value="">Choose Year</option>';

  if (!courseId) return;

  try {
    const res = await fetch(`/api/year/byCourse/${courseId}`);
    const years = await res.json();

    years.forEach(y => {
      const option = document.createElement("option");
      option.value = y.year_id;
      option.textContent = y.year_name;
      yearSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error loading years:", err);
  }
});

// Submit new Subject
subjectForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const subject_name = document.getElementById("subjectName").value;
  const academic_id = academicSelect.value;
  const course_id = courseSelect.value;
  const year_id = yearSelect.value;

  if (!subject_name || !academic_id || !course_id || !year_id) {
    return alert("All fields are required");
  }

  try {
    const res = await fetch("/api/subject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject_name, academic_id, course_id, year_id })
    });

    if (res.ok) {
      alert("Subject added successfully!");
      subjectForm.reset();
      courseSelect.innerHTML = '<option value="">Choose Course</option>';
      yearSelect.innerHTML = '<option value="">Choose Year</option>';
    } else {
      const err = await res.text();
      alert("Error: " + err);
    }
  } catch (err) {
    console.error("Error adding subject:", err);
  }
});
