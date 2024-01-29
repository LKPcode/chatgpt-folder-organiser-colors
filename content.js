
const MENU_PARENT_SELECTOR = "main div.sticky";
const EXT_MENU_SELECTOR = 'div[ext-menu]';

const colorClasses = {
    1: 'bg-red-500',
    2: 'bg-green-500',
    3: 'bg-blue-500',
    none: ''
};

// {
//     "id": string,
//     "color": string,
// }
let chats = [];
let menu = null;


async function setColorMenu() {


    // Programatically create menu based on colorClasses
    let menuHtml = `<div class='w-full justify-center mt-4 right-2 top-[50px] flex gap-4 items-center' ext-menu>`;
    for (let colorClass in colorClasses) {
        if (colorClass == 'none') {
            menuHtml += `<div class='w-4 h-4 bg-white rounded-full hover:cursor-pointer' ext-color='${colorClass}'></div>`;
            continue;
        }
        menuHtml += `<div class='w-4 h-4 ${colorClasses[colorClass]} rounded-full hover:cursor-pointer' ext-color='${colorClass}'></div>`;
    }
    menuHtml += `</div>`;



    let chatsList = document.querySelector("nav div.flex-col div.flex-col");
    console.log("Chats list: " + chatsList);
    let parent = chatsList.parentElement;
    console.log("Parent: " + parent);
   

    

    let extMenuDiv = parent.querySelector('div[ext-menu]');
    if (!extMenuDiv) {
        extMenuDiv = document.createElement('div');
        // add attribute ext-menu
        extMenuDiv.setAttribute('ext-menu', '');
        // set css style
        extMenuDiv.setAttribute('style', 'top: 50px;padding-bottom: 20px;')
        // set class string
        extMenuDiv.setAttribute('class', 'sticky left-0 right-0 z-20 bg-black pt-3.5');

        extMenuDiv.innerHTML = menuHtml;

        parent.insertBefore(extMenuDiv, chatsList);
        menu = extMenuDiv;
        console.log("New div with ext-menu added");

        // add event listeners to menu items
        menu.querySelectorAll('div[ext-color]').forEach(menuItem => {
            menuItem.addEventListener('click', (event) => {
                let clicked_color = event.target.getAttribute('ext-color')
                let chat_id = window.location.href.split('/')[4];

                console.log("Clicked color: " + clicked_color);
                console.log("Chat id: " + chat_id);
                
                // Change color of chat
                setColorToChat(chat_id, clicked_color);

            });
        });
    }
}

function setColorToChat(chatId, color) {
    let chat_element = document.querySelector("nav ol li a[href='/c/" + chatId + "']")

    if (!chat_element) {
        console.log("Chat element not found");
        updateLocalStorage({
            "id": chatId,
            "color": color
        });
        return;
    }

    //  check if div with attribute ext-chat exists as child to the parent of the chat element
    let color_element = chat_element.parentElement.querySelector("div[ext-chat]");
    if (color_element) {
        // remove color element
        color_element.remove();
    }

    let color_html = `<div ext-chat='${chatId}' class="absolute ext-chatColor top-1/2 -translate-y-1/2 w-1 h-1/3 rounded-full ${colorClasses[color]} " style='height: 33%;'></div>`;
    // Add color html as sibling to chat element
    chat_element.insertAdjacentHTML('afterend', color_html);

    // Update local storage
    updateLocalStorage({
        "id": chatId,
        "color": color
    });
   
}

function initChatLocalStorage () {
    // If key extention-chats does not exist, create it
    if (!localStorage.getItem('extention-chats')) {
        localStorage.setItem('extention-chats', JSON.stringify([]));
    }
}

function getChatsFromLocalStorage() {
    return JSON.parse(localStorage.getItem('extention-chats'));
}

function updateLocalStorage(chat) {
    let chats_ = getChatsFromLocalStorage();
    let chat_color = chat.color;
    // if chat color is none, remove chat from local storage
    if (chat_color == 'none') {
        chats_ = chats_.filter(function(value, index, arr){ return value.id != chat.id;});
    } else {
        //else if chat already exists, update color, if not, add chat to local storage
        let chat_index = chats_.findIndex(function(value, index, arr){ return value.id == chat.id;});
        if (chat_index != -1) {
            chats_[chat_index].color = chat_color;
        } else {
            chats_.push(chat);
        }
    }
    

    localStorage.setItem('extention-chats', JSON.stringify(chats_));
}




initChatLocalStorage();

// setTimeout(() => {
//     setColorMenu();

// }, 3000); 





// Usage example
const disconnectChatObserver = setupObserver("nav div.flex-col div.flex-col", () => {
    console.log("Mutation in Chat observed");
    let chats_ = getChatsFromLocalStorage();
    chats_.forEach(chat => {
        setColorToChat(chat.id, chat.color);
    });
    setColorMenu();

});

// const disconnectBarObserver = setupObserver("main", () => {
//     console.log("Mutation in Bar observed");
//     setColorMenu();
// });


function setupObserver(targetSelector, callback, debounceDelay = 400) {
    // Select the target element
    const targetElement = document.querySelector(targetSelector);
    if (!targetElement) {
      console.warn(`Element not found: ${targetSelector}`);
      return;
    }
  
    // Debounce function to limit the rate of invocation of the callback
    let debounceTimer;
    const debouncedCallback = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(callback, debounceDelay);
    };
  
    // Create an observer instance linked to the debounced callback function
    const observer = new MutationObserver((mutations) => {
      debouncedCallback();
    });
  
    // Configuration of the observer
    const config = {
      childList: true,  // Observe direct children
      subtree: false,   // Observe all descendants
      attributes: true  // Observe attributes changes
    };
  
    // Start observing the target element for configured mutations
    observer.observe(targetElement, config);
  
    // Function to disconnect the observer
    const disconnectObserver = () => observer.disconnect();
  
    // Return the disconnect function in case it needs to be called externally
    return disconnectObserver;
  }
  
  
  // To disconnect the observer when it's no longer needed
  // disconnectChatObserver();
  // disconnectBarObserver();
  
