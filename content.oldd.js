// import html file

// Function to change the color of a chat element
function changeChatColor(chatElement, color) {
    if (chatElement) {
        chatElement.style.backgroundColor = color;
    }
}

// Function to add color pickers to the chat history
function addColorToChats() {
    console.log("EXT: addColorToChats");
    // Find all chat elements - you'll need to adjust the selector according to the actual structure
    let chatList = document.querySelectorAll('#__next > div.relative.z-0.flex.h-full.w-full.overflow-hidden > div.dark.flex-shrink-0.overflow-x-hidden.bg-black > div > div > div > div > nav > div.flex-col.flex-1.transition-opacity.duration-500.-mr-2.pr-2.overflow-y-auto > div.flex.flex-col.gap-2.pb-2.text-token-text-primary.text-sm > div > span:nth-child(1)'); 

    let chatElements = chatList[0].querySelectorAll('ol li');

    chatElements.forEach(chatElement => {


        
        
        // colorPicker.addEventListener('input', (event) => {
        //     changeChatColor(chatElement, event.target.value);
        // });

        // Append the color picker to the chat element
        chatElement.appendChild(color);
    });
}

// // Wait for the DOM to be fully loaded
// document.addEventListener('DOMContentLoaded', function() {
//     console.log("EXT: DOM fully loaded");
    // Add color pickers to chat history
    // You might need a MutationObserver if the chats load dynamically
addColorPickersToChats();
// });
