console.log("Content script loaded!");


let ctrlPressed = false;
let altPressed = false;

let mouseX = 0, mouseY = 0;
let lastMouseEvent = null;

document.addEventListener("mousemove", (event) => {
    lastMouseEvent = event;
});

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

// Function to extract text, including from d2l-html-block elements
function extractTextFromElement(element) {
    if (!element) return "";

    // Check if the clicked element is a d2l-html-block
    if (element.tagName.toLowerCase() === "d2l-html-block") {
        let htmlContent = element.getAttribute("html");
        if (htmlContent) {
            let tempDiv = document.createElement("div");
            tempDiv.innerHTML = htmlContent;
            return tempDiv.innerText.trim();
        }
    }

    // Default: Try normal text extraction
    return element.innerText || element.textContent || "";
}



// Listen for a click on the page and extract the text
document.addEventListener("click", function (event) {
    if (event.ctrlKey && event.altKey) { // Only trigger when Ctrl + Alt are held
        event.preventDefault();
        let clickedText = extractTextFromElement(event.target).trim();

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
    if (!lastMouseEvent) return; // Ensure we have mouse position data

    // Only show the popup in the frame the mouse is in
    if (window !== lastMouseEvent.view) {
        console.log("Ignoring popup in incorrect frame");
        return;
    }

    let frameDocument = lastMouseEvent.target.ownerDocument;
    let existingPopup = frameDocument.getElementById("custom-popup");

    if (existingPopup) {
        existingPopup.remove();
    }

    let popup = frameDocument.createElement("div");
    popup.id = "custom-popup";
    popup.innerText = text;

    // Position the popup near the cursor
    Object.assign(popup.style, {
        position: "absolute",
        left: lastMouseEvent.clientX + "px",
        top: lastMouseEvent.clientY + 20 + "px",
        backgroundColor: "black",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
        fontSize: "14px",
        zIndex: "100000",
        pointerEvents: "none"
    });

    frameDocument.body.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 5000);
}
