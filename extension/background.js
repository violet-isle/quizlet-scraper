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
