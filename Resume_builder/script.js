document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('manual-input-tab').click();
});

function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    const tabs = document.querySelectorAll('nav ul li a');

    sections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });

    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    document.getElementById(sectionId).style.display = 'block';
    document.getElementById(sectionId).classList.add('active');
    document.getElementById(sectionId + '-tab').classList.add('active');
}
