// Wait for partials to load before running page JS
document.addEventListener('partialsLoaded', () => {
  const adminTable = document.getElementById('adminTable');

  if (!adminTable) return;


// Load  admins 
async function loadAdmins() {
  try {
    const res = await fetch('/api/admin');
    const admins = await res.json();

    adminTable.innerHTML = ''; 

    admins.forEach(admin => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${admin.id}</td>
        <td><input type="text" value="${admin.username}" class="form-control username"></td>
        <td><input type="password" placeholder="New password" class="form-control password"></td>
        <td>
          <button class="btn btn-sm btn-success saveBtn">Save</button>
          <button class="btn btn-sm btn-danger deleteBtn">Delete</button>
        </td>
      `;

      // Save button
      tr.querySelector('.saveBtn').addEventListener('click', async () => {
        const newUsername = tr.querySelector('.username').value.trim();
        const newPassword = tr.querySelector('.password').value;

        if (!newUsername) {
          alert('Username cannot be empty');
          return;
        }

        try {
          const response = await fetch(`/api/admin/${admin.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: newUsername, password: newPassword || undefined })
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
          }

          alert('Admin updated successfully');
          loadAdmins();

        } catch (err) {
          console.error(err);
          alert('Failed to update admin');
        }
      });

      // Delete button
      tr.querySelector('.deleteBtn').addEventListener('click', async () => {
  if (!confirm('Are you sure you want to delete this admin?')) return;

  try {
    const response = await fetch(`/api/admin/${admin.id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(await response.text());
    alert('Admin deleted successfully');
    loadAdmins();
  } catch (err) {
    console.error(err);
    alert('Failed to delete admin');
  }
});


      adminTable.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    alert('Failed to load admins');
  }
}

// Initial load
  loadAdmins();
});