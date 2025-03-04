console.log("Content script loaded!");


let ctrlPressed = false;
let altPressed = false;

// Listen for keydown events to detect if Ctrl or Alt is pressed
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey) ctrlPressed = true;
    if (event.altKey) altPressed = true;
});

// Listen for keyup events to reset the flags when Ctrl or Alt is released
document.addEventListener('keyup', (event) => {
    if (!event.ctrlKey) ctrlPressed = false;
    if (!event.altKey) altPressed = false;
});

// Listen for a click on the page and extract the text
document.addEventListener('click', (event) => {
    if (ctrlPressed && altPressed) {
    // Extract the text from the clicked element (you can adjust the method as needed)
    const text = event.target.innerText || event.target.textContent;

    if (text) {
        // Send the extracted text to the Flask server
        fetch('http://localhost:5000/extension_query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
            }),
        })
            .then(response => response.json())
            .then(data => {
            let responseText = data.message || 'No response';
            
            // Log the response to console
            console.log('Server Response:', responseText);
            
            // Create and display the popup with the response
            createPopup(event.clientX, event.clientY, responseText);
        })
            .catch(error => {
                console.error('Error sending text:', error);
            });
    }}
});


// Function to create the popup
function createPopup(x, y, text) {
    // Create a new div element for the popup
    let popup = document.createElement('div');
    popup.className = 'popup';
    popup.style.position = 'absolute';
    popup.style.left = `${x + 10}px`; // Position the popup slightly to the right of the click
    popup.style.top = `${y + 10}px`;  // Position the popup slightly below the click
    popup.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    popup.style.color = 'white';
    popup.style.padding = '10px';
    popup.style.borderRadius = '5px';
    popup.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.5)';
    popup.style.maxWidth = '300px';
    popup.style.wordWrap = 'break-word';
    popup.style.fontSize = '14px';
    popup.style.zIndex = '999999'; // Make sure it's on top of other content
    popup.innerText = text;

    // Append the popup to the document
    document.body.appendChild(popup);

    // Remove the popup after 5 seconds
    setTimeout(() => {
        popup.remove();
    }, 5000);

    // Optional: Close the popup when clicking outside
    document.addEventListener('click', (e) => {
        if (!popup.contains(e.target)) {
            popup.remove();
        }
    });
}