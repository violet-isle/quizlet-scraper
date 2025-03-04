// content.js
function sendDataToServer(text, url) {

  fetch('http://localhost:5000/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',  // Ensure the server knows it's JSON
    },
    body: JSON.stringify({ text: text, url: url }),  // Ensure proper stringification of the data
  })
    .then(response => response.json())
    .then(data => {
      console.log('Data sent successfully:', data);
      window.close();
    })
    .catch(error => {
      console.error('Error sending data:', error);
    });
}

const xpath = "//span[@class='TermText notranslate lang-en']";
const elements = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);


let extractedText = '';
for (let i = 0; i < elements.snapshotLength; i++) {
  extractedText += elements.snapshotItem(i).innerHTML.trim() + '\n';  // Append each item
}

if (extractedText) {
  sendDataToServer(extractedText, window.location.href);  // Send data when text is extracted
}