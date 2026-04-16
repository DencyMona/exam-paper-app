const academicSelect = document.getElementById("academicSelect");
const courseSelect = document.getElementById("courseSelect");
const yearTable = document.querySelector("#yearTable tbody");

//  Load academics 
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
  if (!academicId) {
    courseSelect.innerHTML = '<option value="">-- Choose Course --</option>';
    yearTable.innerHTML = "";
    return;
  }

  try {
    const res = await fetch(`/api/course/byAcademic/${academicId}`);
    const courses = await res.json();

    courseSelect.innerHTML = '<option value="">-- Choose Course --</option>';
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

//  Load years 
courseSelect.addEventListener("change", async () => {
  const courseId = courseSelect.value;
  if (!courseId) {
    yearTable.innerHTML = "";
    return;
  }

  try {
    const res = await fetch(`/api/year/byCourse/${courseId}`);
    const years = await res.json();

    yearTable.innerHTML = "";

    if (years.length === 0) {
      yearTable.innerHTML = `<tr><td colspan="3" class="text-center">No years found</td></tr>`;
      return;
    }

    years.forEach(y => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${y.year_id}</td>
        <td>${y.year_name}</td>
        <td>
          <button class="btn btn-sm btn-warning me-2" onclick="editYear(${y.year_id}, '${y.year_name}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteYear(${y.year_id})">Delete</button>
        </td>
      `;
      yearTable.appendChild(tr);
    });
  } catch (err) {
    console.error("Error loading years:", err);
  }
});

//  Edit year 
async function editYear(id, currentName) {
  const newName = prompt("Enter new year name:", currentName);
  if (!newName || newName.trim() === "" || newName === currentName) return;

  try {
    const res = await fetch(`/api/year/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year_name: newName })
    });

    if (res.ok) {
      alert("Year updated successfully!");
      courseSelect.dispatchEvent(new Event("change")); 
    } else {
      alert("Failed to update year");
    }
  } catch (err) {
    console.error("Error updating year:", err);
  }
}

//  Delete year
async function deleteYear(id) {
  if (!confirm("Are you sure you want to delete this year?")) return;

  try {
    const res = await fetch(`/api/year/${id}`, { method: "DELETE" });

    if (res.ok) {
      alert("Year deleted successfully!");
      courseSelect.dispatchEvent(new Event("change")); 
    } else {
      alert("Failed to delete year");
    }
  } catch (err) {
    console.error("Error deleting year:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadAcademics);
