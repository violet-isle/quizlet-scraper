console.log("Content script loaded!");

let ctrlPressed = false;
let altPressed = false;
let mouseX = 0, mouseY = 0;
let lastMouseEvent = null;
let popup = null; // Store the popup globally
let targetWindow = null;
let popupTimeout = 5000;  // Default timeout value

document.addEventListener("mousemove", (event) => {
    lastMouseEvent = event;
    mouseX = event.pageX;
    mouseY = event.pageY;

    // If popup exists, update its position
    if (popup) {
        updatePopupPosition();
    }
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

    if (element.tagName.toLowerCase() === "d2l-html-block") {
        let htmlContent = element.getAttribute("html");
        if (htmlContent) {
            let tempDiv = document.createElement("div");
            tempDiv.innerHTML = htmlContent;
            return tempDiv.innerText.trim();
        }
    }

    return element.innerText || element.textContent || "";
}

// Listen for a click on the page and extract the text
document.addEventListener("click", function (event) {
    if (event.ctrlKey && event.altKey) {
        event.preventDefault();
        event.stopImmediatePropagation();
        let clickedText = extractTextFromElement(event.target).trim();

        targetWindow = event.view


        if (clickedText) {
            console.log("Extracted text:", clickedText);

            chrome.runtime.sendMessage({
                action: "query_server",
                text: clickedText
            });
        }
    }
}, true);

// Listen for response from background script to display popup
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "display_popup") {
        console.log("Displaying popup with response:", message.response);
        if (targetWindow && window === targetWindow) {
            showPopup(message.response);
        } else {
            console.log("Ignoring popup in incorrect window");
        }
    }
    if (message.action === "update_timeout") {
        popupTimeout = message.timeout;
        console.log("Updated popup timeout:", popupTimeout);
    }
});



// Function to create and display popup
function showPopup(text) {
    if (!lastMouseEvent) return;

    console.log(lastMouseEvent.view)

    let frameDocument = document;

    // Remove existing popup if it exists
    if (popup) {
        popup.remove();
    }

    popup = frameDocument.createElement("div");
    popup.id = "custom-popup";
    popup.innerText = text;

    Object.assign(popup.style, {
        position: "absolute",
        backgroundColor: "black",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
        fontSize: "14px",
        zIndex: "100000",
        pointerEvents: "none",
        transition: "top 0.05s ease-out, left 0.05s ease-out"
    });

    frameDocument.body.appendChild(popup);
    
    updatePopupPosition();
    console.log(popupTimeout)

    setTimeout(() => {
        if (popup) {
            popup.remove();
            popup = null;
        }
    }, popupTimeout);
}

// Function to update popup position to follow the cursor
function updatePopupPosition() {
    if (popup) {
        popup.style.left = `${mouseX + 15}px`; // Offset to avoid covering cursor
        popup.style.top = `${mouseY + 15}px`;
    }
}
