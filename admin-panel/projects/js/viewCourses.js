const academicSelect = document.getElementById('academicSelect');
const coursesTable = document.querySelector('#coursesTable tbody');

// Load academics 
async function loadAcademics() {
  try {
    const res = await fetch('/api/academic');
    const academics = await res.json();

    academicSelect.innerHTML = '<option value="">-- Choose Academic --</option>';
    academics.forEach(ac => {
      const option = document.createElement('option');
      option.value = ac.academic_id;
      option.textContent = ac.academic_name;
      academicSelect.appendChild(option);
    });
  } catch (err) {
    console.error('Failed to load academics', err);
  }
}

// Load courses 
async function loadCourses(academicId) {
  if (!academicId) {
    coursesTable.innerHTML = '';
    return;
  }

  try {
    const res = await fetch(`/api/course/byAcademic/${academicId}`);
    const courses = await res.json();

    coursesTable.innerHTML = '';
    courses.forEach(course => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${course.course_id}</td>
        <td><input type="text" class="form-control course-name" value="${course.course_name}"></td>
        <td>
          <button class="btn btn-warning btn-sm edit-btn">Edit</button>
          <button class="btn btn-danger btn-sm delete-btn">Delete</button>
        </td>
      `;

      // Edit button
      tr.querySelector('.edit-btn').addEventListener('click', async () => {
        const newName = tr.querySelector('.course-name').value.trim();
        if (!newName) return alert('Course name cannot be empty');

        try {
          const res = await fetch(`/api/course/${course.course_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ course_name: newName })
          });

          if (!res.ok) throw new Error('Failed to update course');
          alert('Course updated successfully');
          loadCourses(academicId);
        } catch (err) {
          console.error(err);
          alert('Error updating course');
        }
      });

      // Delete button
      tr.querySelector('.delete-btn').addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this course?')) {
          try {
            const res = await fetch(`/api/course/${course.course_id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete course');
            alert('Course deleted successfully');
            loadCourses(academicId);
          } catch (err) {
            console.error(err);
            alert('Error deleting course');
          }
        }
      });

      coursesTable.appendChild(tr);
    });
  } catch (err) {
    console.error('Failed to load courses', err);
  }
}

// dropdown change
academicSelect.addEventListener('change', () => {
  const academicId = academicSelect.value;
  loadCourses(academicId);
});

// Initialize
loadAcademics();
