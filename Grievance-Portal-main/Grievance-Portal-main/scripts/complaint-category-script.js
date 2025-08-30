 function selectCategory(category) {
      window.location.href = `complaint-form.html?category=${encodeURIComponent(category)}`;
    }
    function contactSupport() {
      alert("Please contact your university grievance support team for help.");
    }
    document.addEventListener("DOMContentLoaded", () => {
      document.querySelectorAll(".category-card").forEach((el, i) => {
        el.style.animationDelay = `${i * 0.1}s`;
      });
    });