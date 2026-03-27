## Getting started
This program is split into two sides, one being a python flask server, and the other being a firefox extension, with communication between both.
To install and run the add-on in this repository, follow the instructions for [temporary installation in Firefox](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Temporary_Installation_in_Firefox).
To install and run the flask server, just install the prerequisites using pip, and run the python script.
After that, everything should work! To adjust the confidence threshold for the question matching, simply open the python script and change the number on [this line](https://github.com/violet-isle/quizlet-scraper/blob/main/python/message_reciever.py#L45).
Feel free to report issues, or suggest changes!
