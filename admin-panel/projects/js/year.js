const academicSelect = document.getElementById("academicSelect");
const courseSelect = document.getElementById("courseSelect");
const yearForm = document.getElementById("yearForm");

// Load Academics 
document.addEventListener("DOMContentLoaded", async () => {
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
});

//load courses
academicSelect.addEventListener("change", async () => {
  const academicId = academicSelect.value;

  if (!academicId) {
    courseSelect.innerHTML = '<option value="">Choose Course</option>';
    return;
  }

  try {
    const res = await fetch(`/api/course/${academicId}`);
    const courses = await res.json();

    courseSelect.innerHTML = '<option value="">Choose Course</option>';
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

// Handle submission
yearForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const yearName = document.getElementById("yearName").value;
  const academicId = academicSelect.value;
  const courseId = courseSelect.value;

  if (!yearName || !academicId || !courseId) {
    alert("All fields are required!");
    return;
  }

  try {
    const res = await fetch("/api/year", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year_name: yearName, academic_id: academicId, course_id: courseId })
    });

    if (res.ok) {
      alert("Year added successfully!");
      yearForm.reset();
      courseSelect.innerHTML = '<option value="">Choose Course</option>';
    } else {
      const error = await res.text();
      alert("Error: " + error);
    }
  } catch (err) {
    console.error("Error adding year:", err);
  }
});
