function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

function filter(category) {
  const items = document.querySelectorAll('.gallery .item');

  items.forEach(item => {
    if (category === 'all') {
      item.style.display = 'block';
    } else {
      item.style.display = item.classList.contains(category) ? 'block' : 'none';
    }
  });
}

function toggleMenu() {
  document.getElementById('sidebar').classList.toggle('active');
}