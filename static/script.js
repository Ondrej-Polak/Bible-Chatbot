// Handle form submission to send a question to the server
document.getElementById('questionForm').addEventListener('submit', async function(event) {
    event.preventDefault(); 
    const formData = new FormData(this);
    const question = formData.get('question'); // Extract the question from form data
    try {
        // Send question to the server via POST and handle the response
        const response = await fetch('/ask', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ question })
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        document.getElementById('response').textContent = data.response || 'No response';
        document.getElementById('expandButton').style.display = 'inline-block'; // Show expand button if response is OK
    } catch (error) {
        // Log and display errors
        console.error('Error:', error);
        document.getElementById('response').textContent = 'Error occurred. Please try again.';
        document.getElementById('expandButton').style.display = 'none'; // Hide expand button on error
    }
});

// Function to fetch and display expanded content from the server
function expandContent() {
    fetch('/expand', { method: 'POST', headers: {'Content-Type': 'application/json'}})
    .then(response => response.json())
    .then(data => document.getElementById('response').textContent += data.expandedContent) // Append expanded content
    .catch(error => console.error('Error:', error)); // Log errors
}

// Function to reset conversation history on the server and update UI
function resetHistory() {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel(); // Stop any ongoing speech synthesis
    }
    fetch('/reset', { method: 'POST' })
    .then(response => response.json())
    .then(data => {
        document.getElementById('response').textContent = data.message; // Display reset confirmation
        document.getElementById('expandButton').style.display = 'none'; // Hide expand button
    })
    .catch(error => console.error('Error:', error)); // Log errors
}

// Function to handle text-to-speech for the displayed response
function speakText() {
    const button = document.getElementById('readAloudButton');
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel(); // Stop speaking
        button.textContent = 'Read Aloud'; // Reset button text
    } else {
        const text = document.getElementById('response').textContent;
        if (text) {
            const utterance = new SpeechSynthesisUtterance(text); // Create speech utterance
            utterance.onend = () => button.textContent = 'Read Aloud'; // Reset button text on end
            utterance.onerror = event => console.error('Speech synthesis failed:', event.error); // Log speech errors
            speechSynthesis.speak(utterance); // Start speaking
            button.textContent = 'Stop'; // Change button text to 'Stop' while speaking
        }
    }
}

// Ensure script runs only after DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Event listener for accessibility settings
    var btn = document.getElementById('accessibilityBtn');
    if (btn) {
        btn.addEventListener('click', function() {
            document.getElementById('accessibilityModal').style.display = 'block'; // Display accessibility modal
        });
    } else {
        console.error('Accessibility button not found.'); // Log error if button not found
    }

    var closeBtn = document.querySelector('.close'); // Close button for modal
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            document.getElementById('accessibilityModal').style.display = 'none'; // Hide modal on close button click
        });
    } else {
        console.error('Close button not found.'); // Log error if close button not found
    }

    window.addEventListener('click', function(event) {
        var modal = document.getElementById('accessibilityModal');
        if (event.target == modal) {
            modal.style.display = 'none'; // Hide modal when clicking outside
        }
    });
});

// Accessibility functions to toggle high contrast and change colors or font size
function toggleHighContrast() {
    document.body.classList.toggle('high-contrast'); // Toggle high contrast mode
}

function changeBackgroundColor(event) {
    document.body.style.backgroundColor = event.target.value; // Change background color based on user selection
}

function changeFontColor(event) {
    document.body.style.color = event.target.value; // Change font color based on user selection
}

function changeFontSize(event) {
    document.body.style.fontSize = event.target.value; // Change font size based on user selection
}
