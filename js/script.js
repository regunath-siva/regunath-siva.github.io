// js/script.js

document.addEventListener('DOMContentLoaded', function() {
  // Toggle expansion on project cards for interactivity
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('expanded');
    });
  });

  // Intersection Observer to reveal sections on scroll
  const sections = document.querySelectorAll('.section');
  const observerOptions = {
    threshold: 0.2
  };

  const sectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    sectionObserver.observe(section);
  });
});
