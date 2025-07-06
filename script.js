// Theme toggle
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');

    if (body.getAttribute('data-theme') === 'light') {
        body.removeAttribute('data-theme');
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Dark Mode';
        localStorage.setItem('theme', 'dark');
    } else {
        body.setAttribute('data-theme', 'light');
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Light Mode';
        localStorage.setItem('theme', 'light');
    }
}

// Load saved theme
window.addEventListener('load', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.setAttribute('data-theme', 'light');
        document.getElementById('theme-icon').textContent = '☀️';
        document.getElementById('theme-text').textContent = 'Light Mode';
    }
});

// Upload logic
const backendBaseURL = "https://soma-backend-s1as.onrender.com".replace(/\/$/, '');
 // Update this if backend URL changes
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const processing = document.getElementById('processing');
const results = document.getElementById('results');
const uploadCompleteText = document.getElementById('uploadCompleteText');

uploadArea.addEventListener('dragover', e => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        handleFileUpload();
    }
});

fileInput.addEventListener('change', handleFileUpload);

function handleFileUpload() {
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file);

        sessionStorage.setItem('isProcessing', 'true');
        uploadArea.style.display = 'none';

        uploadCompleteText.innerHTML = `
            <div style="background: rgba(6, 214, 160, 0.1); border: 1px solid var(--accent-tertiary); border-radius: 12px; padding: 1rem; margin-top: 1rem;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                    <span>✅</span>
                    <span style="font-weight: 600;">Uploaded: ${file.name}</span>
                </div>
                <div style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">
                    Processing your lunar image...
                </div>
            </div>
        `;

        processing.style.display = 'block';

        fetch(`${backendBaseURL}/analyze`, {
  method: 'POST',
  body: formData,
})

        .then(res => res.json())
        .then(data => {
            console.log("Upload success:", data);
            results.style.display = 'block';
            initializeMap();
            scrollToResults();
        })
        .catch(err => {
            console.error("Upload failed:", err);
            processing.innerHTML = '<p style="color: red;">Failed to process image. Try again.</p>';
        });
    }
}

// Image Modal
function openModal(img) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    modal.style.display = 'block';
    modalImg.src = img.src;
}

function closeModal() {
    document.getElementById('imageModal').style.display = 'none';
}

window.onclick = function (event) {
    const modal = document.getElementById('imageModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

function initializeMap() {
    const map = L.map('heatmap', {
        crs: L.CRS.Simple,
        minZoom: -5
    });

    const bounds = [[0, 0], [1, 1]];
    const image = L.imageOverlay("/static/boulders_detected.jpg", bounds).addTo(map);
    map.fitBounds(bounds);

    fetch("/static/boulder_points.json")
        .then(res => res.json())
        .then(data => {
            const heat = L.heatLayer(data, {
                radius: 25,
                blur: 15,
                maxZoom: 17,
            }).addTo(map);
        })
        .catch(err => console.log('Heatmap data not available yet'));
}

function scrollToResults() {
    const resultsSection = document.getElementById('results');
    if (resultsSection && resultsSection.style.display !== 'none') {
        setTimeout(() => {
            resultsSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 500);
    }
}

window.addEventListener('load', () => {
    const wasProcessing = sessionStorage.getItem('isProcessing');
    const previewImg = document.querySelector('img[src*="preview.jpg"]');

    if (wasProcessing === 'true' && previewImg && previewImg.complete) {
        sessionStorage.removeItem('isProcessing');
        document.getElementById('results').style.display = 'block';
        initializeMap();
        scrollToResults();
    } else {
        document.getElementById('results').style.display = 'none';
    }
});

function analyzeAnother() {
    fileInput.value = '';
    uploadArea.style.display = 'block';
    uploadCompleteText.innerHTML = '';
    processing.style.display = 'none';
    document.getElementById('uploadSection').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}
window.addEventListener('load', () => {
  console.log("JS Loaded ✅");
  console.log("fileInput:", document.getElementById('fileInput'));
});
