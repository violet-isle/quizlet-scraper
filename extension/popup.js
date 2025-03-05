document.addEventListener('DOMContentLoaded', function() {
    const slider = document.getElementById("timeoutSlider");
    const valueDisplay = document.getElementById("sliderValue");
    let timeoutValue = slider.value;

    slider.addEventListener("input", function() {
        timeoutValue = slider.value;
        valueDisplay.textContent = `${timeoutValue} ms`;
        console.log("Slider Value:", timeoutValue);

        // Send the updated timeout value to the active tab (content.js)
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "update_timeout", timeout: timeoutValue }, (response) => {
                    // Check the response to confirm it's successfully received
                    if (response && response.success) {
                        console.log("Popup timeout updated successfully in content.js");
                    } else {
                        console.error("Failed to update popup timeout in content.js");
                    }
                });
            }
        });
    });
});
