document.addEventListener('DOMContentLoaded', function() {
  // Toggle expansion on project cards for interactivity
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('expanded');
    });
  });

  // Adjust threshold based on screen width
  const thresholdValue = window.innerWidth < 768 ? 0.1 : 0.2;

  const observerOptions = {
    threshold: thresholdValue,
    rootMargin: "0px 0px -50px 0px" // This can help trigger earlier if needed
  };

  const sections = document.querySelectorAll('.section');
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
