document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("file-upload");
  const cameraButton = document.getElementById("camera-button");
  const analyzeButton = document.getElementById("analyze-button");
  const imagePreview = document.getElementById("image-preview");
  const resultSection = document.getElementById("result-section");

  let imageData = null;

  // Handle file upload
  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image">`;
        imageData = e.target.result.split(",")[1]; // Base64 encoded image
        analyzeButton.disabled = false;
      };
      reader.readAsDataURL(file);
    }
  });

  // Open camera (mobile browsers required for full support)
  cameraButton.addEventListener("click", () => {
    alert("Camera capture functionality will be available in a mobile environment.");
  });

  // Analyze image
  analyzeButton.addEventListener("click", () => {
    if (imageData) {
      resultSection.textContent = "Processing the image...";
      
      const apiUrl = "http://127.0.0.1:5003/analyze";
      // Replace with your actual API URL
      const apiKey = "AIzaSyATUzxefctWjJi1CpTSlZpTE7TXPezjHWo"; // Replace with your actual API key

      fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          image_data: imageData,
          prompt: "Analyze the uploaded medical image and provide relevant disease information and description."
        })
      })
        .then((response) => response.json())
        .then((data) => {
          // Display result with improved formatting
          resultSection.innerHTML = `<pre>${data.result}</pre>`;
        })
        .catch((error) => {
          resultSection.textContent = `Error during analysis: ${error.message}`;
        });
    }
  });
});
