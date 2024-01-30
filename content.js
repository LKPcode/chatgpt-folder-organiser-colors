// Constants for DOM selectors and color classes
const MENU_PARENT_SELECTOR = "main";
const EXT_MENU_SELECTOR = 'div[ext-menu]';
const CHATS_LIST_SELECTOR = "nav div.flex-col div.flex-col";
const CHAT_LINK_SELECTOR = "nav ol li a[href^='/c/']";
const colorClasses = {
    1: 'bg-red-500',
    2: 'bg-green-500',
    3: 'bg-yellow-500',
    none: ''
};

// Global variables
let chats = [];
let menu = null;


// Initialization function for the extension
function initExtension() {
    initChatLocalStorage();
    watchForChatListChanges();
    watchForChatChanges();
    handleInitialSelectedChat();
}

// Local Storage Management
function initChatLocalStorage() {
    if (!localStorage.getItem('extension-chats')) {
        localStorage.setItem('extension-chats', JSON.stringify([]));
    }
}

function getChatsFromLocalStorage() {
    return JSON.parse(localStorage.getItem('extension-chats'));
}

function updateLocalStorage(chat) {
    let chats = getChatsFromLocalStorage();
    let chatIndex = chats.findIndex(c => c.id === chat.id);
    if (chat.color === 'none') {
        if (chatIndex !== -1) chats.splice(chatIndex, 1);
    } else {
        if (chatIndex !== -1) {
            chats[chatIndex].color = chat.color;
        } else {
            chats.push(chat);
        }
    }
    localStorage.setItem('extension-chats', JSON.stringify(chats));
}

// Chat List and Color Menu Management
function setupColorMenu() {
    if (!document.querySelector(EXT_MENU_SELECTOR)) {
        createColorMenu();
        addMenuEventListeners();
    }
}

function createColorMenu() {
    let menuHtml = `<div class='w-full justify-center mt-4 right-2 top-[50px] flex gap-4 items-center' ext-menu>`;
    for (let color in colorClasses) {
        menuHtml += `<div class='w-4 h-4 ${colorClasses[color]} rounded-full hover:cursor-pointer' ext-color='${color}'></div>`;
    }
    menuHtml += `</div>`;

    let chatList = document.querySelector(CHATS_LIST_SELECTOR);
    let extMenuDiv = document.createElement('div');
    extMenuDiv.innerHTML = menuHtml;
    extMenuDiv.setAttribute('ext-menu', '');
    extMenuDiv.setAttribute('style', 'top: 50px;padding-bottom: 20px;');
    extMenuDiv.setAttribute('class', 'sticky left-0 right-0 z-20 bg-black pt-3.5');
    chatList.parentElement.insertBefore(extMenuDiv, chatList);
    menu = extMenuDiv;
}

function addMenuEventListeners() {
    if (menu) {
        menu.querySelectorAll('div[ext-color]').forEach(menuItem => {
            menuItem.addEventListener('click', event => handleColorSelection(event));
        });
    }
}

// Chat Color Selection and Update
function handleColorSelection(event) {
    let clickedColor = event.target.getAttribute('ext-color');
    let chatId = getSelectedChatId();
    if (chatId) {
        let currentColor = getCurrentColorForChat(chatId);
        let newColor = currentColor === clickedColor ? 'none' : clickedColor;
        setColorToChat(chatId, newColor);
        updateSelectedColorInMenu(newColor);
    }
}

function getCurrentColorForChat(chatId) {
    let chats = getChatsFromLocalStorage();
    let chat = chats.find(chat => chat.id === chatId);
    return chat ? chat.color : 'none';
}

function setColorToChat(chatId, color) {
    let chatElement = document.querySelector(`nav ol li a[href='/c/${chatId}']`);
    if (!chatElement) {
        updateLocalStorage({"id": chatId, "color": color});
        return;
    }
    let colorElement = chatElement.parentElement.querySelector(`div[ext-chat='${chatId}']`);
    if (colorElement) {
        colorElement.remove();
    }
    if (color !== 'none') {
        let colorHtml = `<div ext-chat='${chatId}' class="absolute ext-chatColor top-1/2 -translate-y-1/2 w-1 h-1/3 rounded-full ${colorClasses[color]} " style='height: 33%;'></div>`;
        chatElement.insertAdjacentHTML('afterend', colorHtml);
    }
    updateLocalStorage({"id": chatId, "color": color});
}

function updateSelectedColorInMenu(selectedColor) {
    console.log("updateSelectedColorInMenu", selectedColor, menu);
    if (menu) {
        menu.querySelectorAll('div[ext-color]').forEach(div => {
            div.style.border = div.getAttribute('ext-color') === selectedColor ? '2px solid white' : 'none';
        });
    }
}

// DOM Observers
function watchForChatListChanges() {
    setupObserver(CHATS_LIST_SELECTOR, () => {
        let chats = getChatsFromLocalStorage();
        chats.forEach(chat => {
            setColorToChat(chat.id, chat.color);
        });
        setupColorMenu();
        handleInitialSelectedChat();
    });
}

function watchForChatChanges() {
    setupObserver(MENU_PARENT_SELECTOR, () => {
        let chatId = getSelectedChatId();
        console.log("watchForChatChanges -> Chat changed to ChatID", chatId);
        if (chatId) {
            let chats = getChatsFromLocalStorage();
            let foundChat = chats.find(chat => chat.id === chatId);
            if (foundChat) {
                updateSelectedColorInMenu(foundChat.color);
            } else {
                updateSelectedColorInMenu('none');
            }
        }
    });
}

function setupObserver(targetSelector, callback, debounceDelay = 400) {
    const targetElement = document.querySelector(targetSelector);
    if (!targetElement) {
        console.warn(`Element not found: ${targetSelector}`);
        return;
    }

    let debounceTimer;
    const debouncedCallback = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(callback, debounceDelay);
    };

    const observer = new MutationObserver(() => {
        debouncedCallback();
    });

    const config = { childList: true, subtree: false, attributes: true };
    observer.observe(targetElement, config);

    return () => observer.disconnect();
}

// Initial Chat Selection Handling
function handleInitialSelectedChat() {
    const selectedChatId = getSelectedChatId();
    console.log("SelectedChatID", selectedChatId);
    if (selectedChatId) {
        const chats = getChatsFromLocalStorage();
        const foundChat = chats.find(chat => chat.id === selectedChatId);
        console.log("FoundChat", foundChat);
        if (foundChat) {
            updateSelectedColorInMenu(foundChat.color);
        }
    }
}

function getSelectedChatId() {
    return window.location.href.split('/')[4];
}

// Initialize the extension
initExtension();