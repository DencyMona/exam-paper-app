document.getElementById('academicForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  if (!name) return alert('Academic name cannot be empty');

  try {
    const response = await fetch('/api/academic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    alert('Academic added successfully');
    document.getElementById('academicForm').reset();
    loadAcademics();
  } catch (err) {
    console.error(err);
    alert('Failed to add Academic');
  }
});

const academicTable = document.querySelector("#academicTable tbody");

// Load all academics
async function loadAcademics() {
  const res = await fetch("/api/academic");
  const academics = await res.json();

  academicTable.innerHTML = "";

  academics.forEach(ac => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${ac.academic_id}</td>
      <td><input type="text" value="${ac.academic_name}" class="form-control"></td>
      <td>
        <button class="btn btn-primary btn-sm edit-btn">Edit</button>
        <button class="btn btn-danger btn-sm delete-btn">Delete</button>
      </td>
    `;

    // Edit
    tr.querySelector(".edit-btn").addEventListener("click", async () => {
      const newName = tr.querySelector("input").value;
      await fetch(`/api/academic/${ac.academic_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ academic_name: newName })
      });
      loadAcademics();
    });

    // Delete
    tr.querySelector(".delete-btn").addEventListener("click", async () => {
      if (confirm("Are you sure to delete this academic?")) {
        await fetch(`/api/academic/${ac.academic_id}`, { method: "DELETE" });
        loadAcademics();
      }
    });

    academicTable.appendChild(tr);
  });
}

loadAcademics();
