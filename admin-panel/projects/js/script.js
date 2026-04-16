const db = require('./db.js');
//register
const form = document.getElementById('registerForm');
  const message = document.getElementById('message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const params = new URLSearchParams(formData);

    const res = await fetch('/register', {
      method: 'POST',
      body: params
    });

    const data = await res.json();
    message.textContent = data.message || 'Something went wrong';

    if (data.success) {
      // Wait 2 seconds, then redirect to login
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    }
  });

//dashboard

  function toggleSidebar() {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('overlay');
      if (window.innerWidth <= 768) {
        sidebar.classList.toggle('show');
        overlay.classList.toggle('active');
      } else {
        sidebar.classList.toggle('collapsed');
        document.getElementById('navbar').classList.toggle('collapsed');
        document.getElementById('main').classList.toggle('collapsed');
        document.querySelector('footer').classList.toggle('collapsed');
      }
    }

    function closeSidebar() {
      document.getElementById('sidebar').classList.remove('show');
      document.getElementById('overlay').classList.remove('active');
    }

    // Close sidebar when clicking outside (overlay)
    document.getElementById('overlay').addEventListener('click', closeSidebar);

    // Close sidebar on mobile when clicking sidebar links
    document.querySelectorAll('#sidebar a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          closeSidebar();
        }
      });
    });

    // Bootstrap form validation
(() => {
  'use strict'
  const forms = document.querySelectorAll('.needs-validation')
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }
      form.classList.add('was-validated')
    }, false)
  })
})();


$(document).ready(function () {
    $('#seekersTable').DataTable({
      responsive: true,
      autoWidth: false
    });
  });

  //register
  
  const adminLink = document.getElementById('admin-link');
  const adminForm = document.getElementById('admin-registration');

  // Toggle form visibility when clicking "Admins"
  adminLink.addEventListener('click', function(e) {
    e.preventDefault(); 
    if (adminForm.style.display === 'none') {
      adminForm.style.display = 'block';  
      adminForm.scrollIntoView({ behavior: 'smooth' }); 
    } else {
      adminForm.style.display = 'none';  
   }
 });
