const enabledInfoElmnt = document.getElementById("enabledInfo")!;
const timerElmnt = document.getElementById("timer")!;
const addButtonElmnt = document.getElementById("addButton")!;
const buttonDivElmnt = document.getElementById("addChannel")!;

chrome.runtime.sendMessage({type: "query", action: "isCounting"}, (isCounting) => {
    if(isCounting){
        enabledInfoElmnt.textContent = "Counting";
        enabledInfoElmnt.classList.remove("stopped");
        enabledInfoElmnt.classList.add("counting");
    } else {
        enabledInfoElmnt.textContent = "Not counting";
        enabledInfoElmnt.classList.remove("counting");
        enabledInfoElmnt.classList.add("stopped");
    }
})

setInterval(() => {
    chrome.storage.local.get(["currentTime", "configs"]).then(result => {
        timerElmnt.textContent = (result.configs.dailyLimit - result.currentTime).toString();
    })
}, 1000);

async function getCurrentTab(){
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true})

    return tab;
}

getCurrentTab().then(tab => {

    if(tab.url!.includes("youtube.com")){
        chrome.tabs.sendMessage(tab.id!, {type: "query", action:"data"}, (data) => {

            if(data.type == "nav" || data.type == "shorts"){
                addButtonElmnt.textContent = "";
                buttonDivElmnt.classList.add("disabled");

            } else if(data.type == "video"){
                addButtonElmnt.textContent = "Add " + data.channel + " to the channel list";
                
                addButtonElmnt.addEventListener("click", () => {

                    chrome.storage.local.get(["configs"]).then((result) => {
                        const channels = result.configs.channelList;

                        if(channels.some((channel: string) => channel == data.channel)) alert("This channel is already in the list!");
                        else {
                            channels.push(data.channel);
                            chrome.storage.local.set({
                                configs: {
                                    ...result.configs,
                                    channelList: channels
                                },
                                ...result.currentTime
                            });

                            chrome.runtime.sendMessage({type: "configChanged"});
                        }
                    });
                })
            }

        });

    } else {
        addButtonElmnt.textContent = "";
        buttonDivElmnt.classList.add("disabled");
    }

})
