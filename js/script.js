// js/script.js

document.addEventListener('DOMContentLoaded', function() {
  // Toggle expansion on project cards for interactivity
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('expanded');
    });
  });
});
