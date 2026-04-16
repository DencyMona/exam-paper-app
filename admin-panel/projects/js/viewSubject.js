const academicSelect = document.getElementById("academicSelect");
const courseSelect = document.getElementById("courseSelect");
const yearSelect = document.getElementById("yearSelect");
const subjectTableBody = document.querySelector("#subjectTable tbody");
const searchInput = document.getElementById("searchInput");

// Load Academics 
document.addEventListener("DOMContentLoaded", loadAcademics);

async function loadAcademics() {
  try {
    const res = await fetch("/api/academic");
    const academics = await res.json();
    academicSelect.innerHTML = '<option value="">-- Choose Academic --</option>';
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

// Load courses 
academicSelect.addEventListener("change", async () => {
  const academicId = academicSelect.value;
  courseSelect.innerHTML = '<option value="">-- Choose Course --</option>';
  yearSelect.innerHTML = '<option value="">-- Choose Year --</option>';
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

// Load years 
courseSelect.addEventListener("change", async () => {
  const courseId = courseSelect.value;
  yearSelect.innerHTML = '<option value="">-- Choose Year --</option>';
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

// load subjects
async function loadSubjects(query = "") {
  const academicId = academicSelect.value;
  const courseId = courseSelect.value;
  const yearId = yearSelect.value;

  let url = `/api/subject/search?query=${encodeURIComponent(query)}`;
  if (academicId) url += `&academic_id=${academicId}`;
  if (courseId) url += `&course_id=${courseId}`;
  if (yearId) url += `&year_id=${yearId}`;

  try {
    const res = await fetch(url);
    const subjects = await res.json();

    subjectTableBody.innerHTML = "";

    if (subjects.length === 0) {
      subjectTableBody.innerHTML = `<tr><td colspan="4" class="text-center">No subjects found</td></tr>`;
      return;
    }

    subjects.forEach(s => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${s.subject_id}</td>
        <td>${s.subject_name}</td>
        <td>${s.academic_name || ""}</td>
        <td>
          <button class="btn btn-sm btn-warning me-1" onclick="editSubject(${s.subject_id})">Edit</button>
          <button class="btn btn-sm btn-danger  me-1" onclick="deleteSubject(${s.subject_id})">Delete</button>
          <button class="btn btn-sm btn-info " onclick="viewPastpapers(${s.subject_id})">Pastpapers</button>
        </td>
      `;
      subjectTableBody.appendChild(tr);
    });

  } catch (err) {
    console.error("Error loading subjects:", err);
  }
}

// Live search
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();
  loadSubjects(query);
});

// Reload subjects 
academicSelect.addEventListener("change", () => loadSubjects());
courseSelect.addEventListener("change", () => loadSubjects());
yearSelect.addEventListener("change", () => loadSubjects());

document.addEventListener("DOMContentLoaded", () => loadSubjects());

function viewPastpapers(subjectId) {
  window.location.href = `/pastpaper?subject_id=${subjectId}`;
}

//edit subject
async function editSubject(id, currentName) {
  const newName = prompt("Enter new subject name:", currentName);
  if (!newName || newName.trim() === "" || newName === currentName) return;

  try {
    const res = await fetch(`/api/subject/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify({ subject_name: newName})
});

    if (res.ok) {
      alert("Subject updated successfully!");
      loadSubjects(); 
} else {
      alert("Failed to update subject");
}
} catch (err) {
    console.error("Error updating subject:", err);
}
}
//delete subject
async function deleteSubject(id) {
  if (!confirm("Are you sure you want to delete this subject?")) return;

  try {
    const res = await fetch(`/api/subject/${id}`, { method: "DELETE"});

    if (res.ok) {
      alert("Subject deleted successfully!");
      loadSubjects(); 
} else {
      alert("Failed to delete subject");
}
} catch (err) {
    console.error("Error deleting subject:", err);
}
}
