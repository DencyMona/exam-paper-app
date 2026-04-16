// Elements
const courseForm = document.getElementById('courseForm');
const courseTable = document.querySelector("#courseTable tbody");
const academicSelect = document.getElementById('academicSelect');

// Load dropdown 
async function loadAcademicDropdown() {
  try {
    const res = await fetch('/api/academic');
    const academics = await res.json();

    academicSelect.innerHTML = '<option value="">-- Choose Academic --</option>';
    academics.forEach(ac => {
      const option = document.createElement('option');
      option.value = ac.academic_id; // keep as string for now
      option.textContent = ac.academic_name;
      academicSelect.appendChild(option);
    });
  } catch (err) {
    console.error('Failed to load academics', err);
  }
}

// Load all courses
async function loadCourses() {
  try {
    const res = await fetch('/api/course');
    const courses = await res.json();

    courseTable.innerHTML = "";
    courses.forEach(course => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${course.course_id}</td>
        <td>${course.course_name}</td>
        <td>${course.academic_name}</td>
        <td>
          <button class="btn btn-danger btn-sm delete-btn">Delete</button>
        </td>
      `;

      // Delete button
      tr.querySelector(".delete-btn").addEventListener("click", async () => {
        if (confirm("Are you sure to delete this course?")) {
          await fetch(`/api/course/${course.course_id}`, { method: "DELETE" });
          loadCourses();
        }
      });

      courseTable.appendChild(tr);
    });
  } catch (err) {
    console.error('Failed to load courses', err);
  }
}

// Form submit
courseForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const courseName = document.getElementById('courseName').value.trim();
  let academicId = academicSelect.value;

  if (!courseName || !academicId) return alert('Please fill all fields');

  academicId = parseInt(academicId); 

  try {
    const res = await fetch('/api/course', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_name: courseName, academic_id: academicId })
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Server error:', data);
      throw new Error(data.sqlMessage || 'Failed to add course');
    }

    alert('Course added successfully');
    courseForm.reset();
    loadCourses();
  } catch (err) {
    console.error('Error adding course:', err);
    alert('Error adding course: ' + err.message);
  }
});

// Initialize
loadAcademicDropdown();
loadCourses();
