// background.js (Service Worker)

// Set up an alarm to check for the tab request every 5 seconds
chrome.alarms.create('checkTabRequest', { periodInMinutes: 0.0833 }); // 5 seconds (1/60 min)

// Listen for the alarm and handle the tab check when it's triggered
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'checkTabRequest') {
        fetch('http://localhost:5000/get_open_tab_request')
            .then(response => response.json())
            .then(data => {
                if (data.open) {
                    chrome.tabs.create({ url: data.url, active: false });  // Open new tab silently
                    console.log('Tab opened:', data.url);
                } else {
                    console.log('No tab to open');
                }
            })
            .catch(error => {
                console.error('Error checking tab request:', error);
            });
    }
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "query_server") {
        console.log("Received text from content script:", message.text);

        if (message.text) {
            // Send the extracted text to the Flask server
            fetch('http://localhost:5000/extension_query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: message.text,
                }),
            })
                .then(response => response.json())
                .then(data => {
                    let responseText = data.message || 'No response';

                    // Log the response to console
                    console.log('Server Response:', responseText);

                    chrome.tabs.sendMessage(sender.tab.id, {
                        action: "display_popup",
                        response: responseText // Adjust this based on your Flask response
                    });
                })

                .catch(error => console.error("Error:", error));
        }
    }
}
);
