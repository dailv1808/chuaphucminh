// Load header
document.addEventListener('DOMContentLoaded', () => {
  const headerPlaceholder = document.getElementById('header-placeholder')
  if (headerPlaceholder) {
    fetch('/partials/header.html')
      .then(response => response.text())
      .then(html => {
        headerPlaceholder.innerHTML = html
      })
  }
  
  // Similarly load footer if needed
  const footerPlaceholder = document.getElementById('footer-placeholder')
  if (footerPlaceholder) {
    fetch('/partials/footer.html')
      .then(response => response.text())
      .then(html => {
        footerPlaceholder.innerHTML = html
      })
  }
})
