// Function to start speech recognition for voice input
function startVoiceRecognition() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.start();

    recognition.onresult = function(event) {
        const symptom = event.results[0][0].transcript;
        document.getElementById("symptomInput").value = symptom;
        document.getElementById("symptomSelect").value = "";  // Clear dropdown selection
    };

    recognition.onerror = function(event) {
        alert('Error occurred in speech recognition: ' + event.error);
    };
}

// Event listener for voice button
document.getElementById("voiceBtn").addEventListener("click", startVoiceRecognition);

// Function to send symptom data to backend and get recommendation
document.getElementById("recommendBtn").addEventListener("click", function() {
    // Get the symptom from either dropdown or input field
    const symptomFromDropdown = document.getElementById("symptomSelect").value;
    const symptomFromInput = document.getElementById("symptomInput").value;

    let symptom = symptomFromDropdown || symptomFromInput;  // Use dropdown value if available, otherwise use input value

    if (!symptom) {
        alert("Please select or enter a symptom!");
        return;
    }

    // Show processing indicator while waiting for the model response
    document.getElementById("processingIndicator").style.display = 'block';
    document.getElementById("resultSection").style.display = 'none'; // Hide previous results

    // Send the symptom data to the backend
    $.ajax({
        url: '/get-recommendation',  // URL to hit on the backend
        method: 'POST',
        data: { symptom: symptom },  // Sending the symptom entered by the user
        success: function(response) {
            // Hide processing indicator once the result is received
            document.getElementById("processingIndicator").style.display = 'none';

            const resultSection = document.getElementById("resultSection");
            const resultParagraph = document.getElementById("resultParagraph");

            // Show result section
            resultSection.style.display = 'block';

            // Clear previous result
            resultParagraph.innerHTML = '';

            if (response.recommendations && response.recommendations.length > 0) {
                // Loop through each recommendation and display it
                response.recommendations.forEach(function(medicine) {
                    const paragraph = document.createElement('p');
                    paragraph.innerHTML = `<strong>${medicine.name}</strong>: ${medicine.description}`;
                    resultParagraph.appendChild(paragraph);
                });
            } else {
                const paragraph = document.createElement('p');
                paragraph.innerText = "No recommendations found.";
                resultParagraph.appendChild(paragraph);
            }
        },
        error: function(err) {
            // Hide processing indicator in case of error
            document.getElementById("processingIndicator").style.display = 'none';
            alert('Error fetching recommendations: ' + err);
        }
    });
});
