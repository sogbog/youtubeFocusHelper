type Message = {
    type: string
    action: string | null
    data: any
}


let page: string, channel: string, url: string;
let subscribed: boolean;
let loaded: boolean;
const channelObserver = new MutationObserver(() => sendNewInfo());
const contentObserver = new MutationObserver(() => pageTypeTransition());


function sendNewInfo(){
    newURLSetup();
}

function pageTypeTransition(){

    if(page == "video"){
        const channelElmnt = document.querySelector("ytd-video-owner-renderer #text a");
        if(channelElmnt) {
            contentObserver.disconnect();
            sendTabChangeInfo();
        } 
    }
}


chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {

    if(message.type == "loadInfo" && message.data.loaded == true){
        if(!loaded) setup();
        else {
            checkURL() ? "" : newURLSetup();
        }
    }

    if(message.type == "action" && message.action == "block"){
        block();        
    }

    if(message.type == "query" && message.action == "data"){
        returnInfo(sendResponse);        
    }
});


function setup(){
    url = location.href;
    
    if(!page){
        if (document.location.href.includes("/watch")) page = "video";
        else if (document.location.href.includes("/shorts")) page = "shorts";
        else page = "nav";
    }


    if(page) sendTabLoadInfo(); loaded = true;
}

function newURLSetup(){    
    
    page = "";
    channel = "";


    url = location.href;

    if (document.location.href.includes("/watch")) page = "video";
    else if (document.location.href.includes("/shorts")) page = "shorts";
    else page = "nav";

    sendTabChangeInfo()
}

function checkURL(){
    const current = location.href;
    return current == url;
}


function sendTabLoadInfo(){
    if(page == "video"){

        if(!channel){
            const channelElmnt = document.querySelector("ytd-video-owner-renderer #text a");
            if(channelElmnt) {
                channel = channelElmnt.textContent!;
                channelObserver.observe(channelElmnt, {characterData: true, childList: true});
            }
        }

        
        const subscribedAttr = document.querySelector("ytd-subscribe-button-renderer")!.attributes.getNamedItem("subscribed")!;
        subscribedAttr ? subscribed = true : subscribed = false


        if(channel && subscribed != undefined){
            const info: Message = {
                type: "tabLoadInfo",
                action: null,
                data: {
                    page,
                    channel,
                    subscribed,
                }
            }

            chrome.runtime.sendMessage(info);
        }

    } else {

        const info: Message = {
            type: "tabLoadInfo",
            action: null,
            data: {
                page,
                channel: null,
                subscribed: null,
            }
        }

        const contentDiv = document.getElementById("content");
        if(contentDiv) contentObserver.observe(contentDiv, {characterData: true, childList: true, subtree: true});

        chrome.runtime.sendMessage(info);

    }   
}

function sendTabChangeInfo(){
    if(page == "video"){

        const channelElmnt = document.querySelector("ytd-video-owner-renderer #text a");
        if(channelElmnt) {
            channel = channelElmnt.textContent!;
            channelObserver.observe(channelElmnt, {characterData: true, childList: true});
        } 
        
        const subscribedElmnt = document.querySelector("ytd-subscribe-button-renderer")
        if(subscribedElmnt != null) {
            const subscribedAttr = subscribedElmnt.attributes.getNamedItem("subscribed")!;
            subscribedAttr ? subscribed = true : subscribed = false
        }

        if(channel && subscribed != undefined){
            const info: Message = {
                type: "tabChangeInfo",
                action: null,
                data: {
                    page,
                    channel,
                    subscribed,
                }
            }

            chrome.runtime.sendMessage(info);
        }

    } else {

        const info: Message = {
            type: "tabChangeInfo",
            action: null,
            data: {
                page,
                channel: null,
                subscribed: null,
            }
        }

        chrome.runtime.sendMessage(info);

    }   
}


function block(){
    const html = document.querySelector("html")!;
    const isDark = html.attributes.getNamedItem("dark");

    const content = document.querySelector("body")!;
    content.innerHTML = `
    <div>
        <h1>YOUR TIME IS UP 😩</h1>
    </div>

    <style>
    div{
        color: ${isDark ? "white" : "black"};
        font-size: 100px;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    </style>
    `
}


function returnInfo(sendResponse: (response: any) => void){
    const info = {
        id: undefined,
        type: page,
        channel: channel ? channel: undefined,
        subscribed: subscribed ? subscribed : channel ? false : undefined
    }

    sendResponse(info);
}