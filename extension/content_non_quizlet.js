console.log("Content script loaded!");


let ctrlPressed = false;
let altPressed = false;

let mouseX = 0, mouseY = 0;

// Track the mouse position
document.addEventListener("mousemove", function (event) {
    mouseX = event.pageX;
    mouseY = event.pageY;
});


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
document.addEventListener("click", function (event) {
    if (event.ctrlKey && event.altKey) { // Only trigger when Ctrl + Alt are held
        event.preventDefault();
        let clickedText = event.target.innerText.trim();

        if (clickedText) {
            console.log("Extracted text:", clickedText);

            // Send message to background script
            chrome.runtime.sendMessage({
                action: "query_server",
                text: clickedText
            });
        }
    }
}, true);

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "display_popup") {
        console.log("Displaying popup with response:", message.response);
        showPopup(message.response);
    }
});

function showPopup(text) {
    let existingPopup = document.getElementById("custom-popup");
    if (existingPopup) {
        existingPopup.remove();
    }

    let popup = document.createElement("div");
    popup.id = "custom-popup";
    popup.innerText = text;

    // Styling the popup
    Object.assign(popup.style, {
        position: "absolute",
        left: mouseX + 10 + "px",  // Slight offset for better visibility
        top: mouseY + 10 + "px",
        backgroundColor: "black",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
        fontSize: "14px",
        zIndex: "100000"
    });

    document.body.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 5000); // Hide after 5 seconds
}
