"use strict";
//Installation
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const initialConfigObj = {
    configs: {
        dailyLimit: 1800,
        excludeNav: true,
        excludeShorts: false,
        subscriptionMode: "neutral",
        listEnabled: false,
        channelList: [],
        listMode: "whitelist",
        scheduleEnabled: false,
        scheduleMode: "whitelist",
        schedule: {
            sunday: [],
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
        }
    },
    currentTime: 0,
    currentDateUnix: Date.now(),
};
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set(initialConfigObj);
});
//-------------------------------------------------------------------------------------------------------
//Initialization setup
//getting configs------------------------------------------------
const configs = {};
let tabs = [];
let isTimeUp = false;
let currentTime;
let currentDate;
function getConfigs() {
    chrome.storage.local.get(["currentTime", "currentDateUnix", "configs"]).then((result) => {
        configs.dailyLimit = result.configs.dailyLimit;
        configs.excludeNav = result.configs.excludeNav;
        configs.excludeShorts = result.configs.excludeShorts;
        configs.subscriptionMode = result.configs.subscriptionMode;
        configs.listEnabled = result.configs.listEnabled;
        configs.channelList = result.configs.channelList;
        configs.listMode = result.configs.listMode;
        configs.scheduleEnabled = result.configs.scheduleEnabled;
        configs.scheduleMode = result.configs.scheduleMode;
        configs.schedule = result.configs.schedule;
        currentTime = result.currentTime;
        currentDate = new Date(result.currentDateUnix);
        result.configs.scheduleEnabled ? startChecker() : stopChecker();
    });
}
getConfigs();
//timer functions------------------------------------------------
function setTime(newTime) {
    return __awaiter(this, void 0, void 0, function* () {
        chrome.storage.local.set({
            currentTime: newTime
        });
    });
}
function updateTime() {
    return __awaiter(this, void 0, void 0, function* () {
        chrome.storage.local.get(["currentTime"]).then((result) => {
            currentTime = result.currentTime;
        });
    });
}
let timer;
function startTimer() {
    if (!timer) {
        timer = setInterval(() => {
            const now = new Date(Date.now());
            let differentDay = false;
            if (now.getDate() !== currentDate.getDate()) {
                differentDay = true;
            }
            else if (now.getMonth() !== currentDate.getMonth()) {
                differentDay = true;
            }
            else if (now.getFullYear() !== currentDate.getFullYear()) {
                differentDay = true;
            }
            if (differentDay) {
                resetTime();
                return;
            }
            setTime(currentTime + 1);
            updateTime();
            if (currentTime >= configs.dailyLimit) {
                stopTimer();
                blockAllTabs();
                isTimeUp = true;
            }
            ;
        }, 1000);
    }
}
function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = undefined;
    }
}
//code to check if anything changed(eg: entered a scheduled time)
let configChecker;
function startChecker() {
    if (!configChecker)
        configChecker = setInterval(() => {
            manageTimer();
        }, 15000); //15s
}
function stopChecker() {
    if (configChecker) {
        clearInterval(configChecker);
        configChecker = undefined;
    }
}
function resetTime() {
    const timestamp = Date.now();
    currentDate = new Date(timestamp);
    setTime(0);
    chrome.storage.local.set({
        currentDateUnix: timestamp
    });
    updateTime();
}
function manageTimer() {
    if (tabs.length < 1) { //if there are no youtube tabs, stop the timer
        stopTimer();
        stopChecker();
        return;
    }
    let foundEnabler = false;
    let i = 0;
    while (!foundEnabler && i < tabs.length) {
        //checking if each config allows the counting to start
        const tabInfo = tabs[i];
        const startByNav = configs.excludeNav ? tabInfo.page != "nav" ? true : false : true;
        const startByShorts = configs.excludeShorts ? tabInfo.page != "shorts" ? true : false : true;
        let startBySubscribed;
        if (tabInfo.page == "shorts" || tabInfo.page == "nav") { //if page type is shorts or nav, this config must not interfere in the counting
            startBySubscribed = true;
        }
        else
            switch (configs.subscriptionMode) {
                case "neutral":
                    startBySubscribed = true;
                    break;
                case "whitelist":
                    startBySubscribed = tabInfo.subscribed ? false : true;
                    break;
                case "blacklist":
                    startBySubscribed = tabInfo.subscribed ? true : false;
                    break;
            }
        let startByList = false;
        if (tabInfo.page == "shorts" || tabInfo.page == "nav") { //if page type is shorts or nav, this config must not interfere in the counting
            startByList = true;
        }
        else if (configs.listEnabled && tabInfo.channel) {
            if (configs.channelList.includes(tabInfo.channel)) {
                if (configs.listMode !== "whitelist") {
                    startByList = true;
                    startBySubscribed = true; //being on blacklist takes priority over subscription
                }
            }
            else {
                if (configs.listMode === "whitelist") {
                    startByList = true;
                }
                else {
                    if (configs.subscriptionMode === "blacklist") { //subscription option takes priority over not being on blacklist
                        startByList = startBySubscribed;
                    }
                }
            }
        }
        else if (!configs.listEnabled) {
            startByList = true; //if the list is disabled, the counting is allowed to start regardless of the channels present in it
        }
        let startBySchedule = false;
        if (!configs.scheduleEnabled)
            startBySchedule = true;
        else {
            startChecker();
            const currentDate = new Date(Date.now());
            let currentWeekDay;
            switch (currentDate.getDay()) {
                case 0:
                    currentWeekDay = "sunday";
                    break;
                case 1:
                    currentWeekDay = "monday";
                    break;
                case 2:
                    currentWeekDay = "tuesday";
                    break;
                case 3:
                    currentWeekDay = "wednesday";
                    break;
                case 4:
                    currentWeekDay = "thursday";
                    break;
                case 5:
                    currentWeekDay = "friday";
                    break;
                case 6:
                    currentWeekDay = "saturday";
                    break;
                default:
                    currentWeekDay = "sunday";
                    break;
            }
            let inSchedule = false;
            configs.schedule[currentWeekDay].forEach(period => {
                if (inSchedule)
                    return;
                //perhaps its faster to do it this way instead of a big boolean variable with &&s??????
                if (period.start.hour <= currentDate.getHours()) {
                    if (period.end.hour >= currentDate.getHours()) {
                        if (period.start.minute <= currentDate.getMinutes()) {
                            if (period.end.minute >= currentDate.getMinutes()) {
                                inSchedule = true;
                            }
                        }
                    }
                }
            });
            if (configs.scheduleMode === "whitelist") {
                if (!inSchedule)
                    startBySchedule = true;
            }
            else {
                if (inSchedule)
                    startBySchedule = true;
            }
        }
        if (startByNav && startByShorts && startBySubscribed && startByList && startBySchedule) {
            foundEnabler = true;
        }
        else {
            foundEnabler = false;
        }
        i++;
    }
    foundEnabler ? startTimer() : stopTimer();
}
//tabs functions------------------------------------------------
function blockAllTabs() {
    tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { type: "action", action: "block", data: null });
    });
}
function blockTab(tabID) {
    chrome.tabs.sendMessage(tabID, { type: "action", action: "block", data: null });
}
//update handlers-----------------------------------------------
function handleLoadInfo(message, sender) {
    const tabInfo = Object.assign(Object.assign({}, message.data), { id: sender.tab.id });
    if (tabs.length < 1 || !tabs.some(tab => tab.id == tabInfo.id)) {
        tabs.push(tabInfo);
        manageTimer();
    }
}
function handleChangeInfo(message, sender) {
    const tabInfo = Object.assign({}, message.data);
    let currentTab = tabs.find(tab => tab.id == sender.tab.id);
    if (currentTab) {
        currentTab.page = tabInfo.page;
        currentTab.channel = tabInfo.channel;
        currentTab.subscribed = tabInfo.subscribed;
    }
    manageTimer();
}
//Tabs listeners------------------------------------------------
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!tab.url)
        return;
    if (changeInfo.status === 'complete' && tab.url.includes("youtube.com")) {
        if (isTimeUp) {
            blockTab(tabId);
            return;
        }
        chrome.tabs.sendMessage(tabId, { type: "loadInfo", action: null, data: { loaded: true } });
    }
});
chrome.tabs.onRemoved.addListener(tabId => {
    tabs = tabs.filter(tab => tab.id == tabId ? false : true);
    manageTimer();
});
//message listeners---------------------------------------------
chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.type == "tabLoadInfo") {
        handleLoadInfo(message, sender);
    }
    if (message.type == "tabChangeInfo") {
        handleChangeInfo(message, sender);
    }
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type == "query" && message.action == "isCounting")
        timer ? sendResponse(true) : sendResponse(false);
});
chrome.runtime.onMessage.addListener(message => {
    if (message.type == "configChanged")
        getConfigs();
});
