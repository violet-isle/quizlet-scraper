// background.js

// Listener for messages from content.js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "append_data") {
    const data = message.data;

    // Send the data to the Python server using fetch or another method
    fetch('http://localhost:5000/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: data })
    })
    .then(response => response.json())
    .then(responseData => {
      console.log('Data sent successfully:', responseData);
    })
    .catch(error => {
      console.error('Error sending data:', error);
    });
  }
});
