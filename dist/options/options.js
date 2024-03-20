"use strict";
const currentLimitElmnt = document.getElementById("currentLimit");
const timeLimitElmnt = document.getElementById("timeLimit");
const setLimitElmnt = document.getElementById("setLimit");
const timeLeftElmnt = document.getElementById("timeLeftCounter");
const excludeNavElmnt = document.getElementById("excludeNav");
const excludeShortsElmnt = document.getElementById("excludeShorts");
const subscriptionModeElmnt = document.getElementById("subscriptionMode");
const subModeDescriptionElmnt = document.getElementById("subModeDescription");
const enableListElmnt = document.getElementById("list");
const channelNameElmnt = document.getElementById("channelName");
const addChannelElmnt = document.getElementById("addChannel");
const channelListElmnt = document.getElementById("channelList");
const listModeElmnt = document.getElementById("listMode");
const enableScheduleElmnt = document.getElementById("enableSchedule");
const scheduleModeElmnt = document.getElementById("scheduleMode");
const schdlModeDescriptionElmnt = document.getElementById("schdlModeDescription");
const weekDaySelectionElmnt = document.getElementById("weekDay");
const startTimeElmnt = document.getElementById("startTime");
const endTimeElmnt = document.getElementById("endTime");
const addToScheduleElmnt = document.getElementById("addToSchedule");
const sundayScheduleElmnt = document.getElementById("sundaySchedule");
const mondayScheduleElmnt = document.getElementById("mondaySchedule");
const tuesdayScheduleElmnt = document.getElementById("tuesdaySchedule");
const wednesdayScheduleElmnt = document.getElementById("wednesdaySchedule");
const thursdayScheduleElmnt = document.getElementById("thursdaySchedule");
const fridayScheduleElmnt = document.getElementById("fridaySchedule");
const saturdayScheduleElmnt = document.getElementById("saturdaySchedule");
//setting functionalities-----------------------------------------------------------------------------------------
setLimitElmnt.addEventListener("click", () => {
    if (!timeLimitElmnt.value || isNaN(parseInt(timeLimitElmnt.value)))
        alert("Time limit has to be a valid number");
    else {
        const value = parseInt(timeLimitElmnt.value);
        if (value < 1)
            alert("Value must be greater than 0");
        else {
            currentLimitElmnt.textContent = value.toString();
            saveConfig({ dailyLimit: value });
        }
    }
});
excludeNavElmnt.addEventListener("change", () => {
    saveConfig({ excludeNav: excludeNavElmnt.checked });
});
excludeShortsElmnt.addEventListener("change", () => {
    saveConfig({ excludeShorts: excludeShortsElmnt.checked });
});
subscriptionModeElmnt.addEventListener("click", () => {
    switch (subscriptionModeElmnt.classList[0]) {
        case "neutral":
            styleButton("whitelist");
            saveConfig({ subscriptionMode: "whitelist" });
            break;
        case "whitelist":
            styleButton("blacklist");
            saveConfig({ subscriptionMode: "blacklist" });
            break;
        case "blacklist":
            styleButton("neutral");
            saveConfig({ subscriptionMode: "neutral" });
            break;
    }
});
enableListElmnt.addEventListener("change", () => {
    saveConfig({ listEnabled: enableListElmnt.checked });
});
addChannelElmnt.addEventListener("click", () => {
    const toAdd = channelNameElmnt.value;
    chrome.storage.local.get(["configs"]).then((result) => {
        const channels = result.configs.channelList;
        if (channels.some((channel) => channel == toAdd))
            alert("This channel is already in the list!");
        else {
            channels.push(toAdd);
            saveConfig({ channelList: channels });
            renderChannels(channels);
            channelNameElmnt.value = "";
        }
    });
});
listModeElmnt.addEventListener("click", () => {
    if (listModeElmnt.classList.contains("blacklist")) {
        listModeElmnt.classList.remove("blacklist");
        listModeElmnt.textContent = "Whitelist";
        saveConfig({ listMode: "whitelist" });
    }
    else {
        listModeElmnt.classList.add("blacklist");
        listModeElmnt.textContent = "Blacklist";
        saveConfig({ listMode: "blacklist" });
    }
});
enableScheduleElmnt.addEventListener("change", () => {
    saveConfig({ scheduleEnabled: enableScheduleElmnt.checked });
});
scheduleModeElmnt.addEventListener("click", () => {
    if (scheduleModeElmnt.classList.contains("blacklist")) {
        scheduleModeElmnt.classList.remove("blacklist");
        scheduleModeElmnt.textContent = "Whitelist";
        schdlModeDescriptionElmnt.innerText = "Counting is disabled on the specified periods";
        saveConfig({ scheduleMode: "whitelist" });
    }
    else {
        scheduleModeElmnt.classList.add("blacklist");
        scheduleModeElmnt.textContent = "Blacklist";
        schdlModeDescriptionElmnt.innerText = "Counting is enabled only on the specified periods";
        saveConfig({ scheduleMode: "blacklist" });
    }
});
addToScheduleElmnt.addEventListener("click", () => {
    const weekDay = parseInt(weekDaySelectionElmnt.value);
    const startTimeValue = startTimeElmnt.value;
    const endTimeValue = endTimeElmnt.value;
    const splitStartString = startTimeValue.split(":");
    const splitEndString = endTimeValue.split(":");
    const startObj = { start: {
            hour: parseInt(splitStartString[0]),
            minute: parseInt(splitStartString[1])
        } };
    const endObj = { end: {
            hour: parseInt(splitEndString[0]),
            minute: parseInt(splitEndString[1])
        } };
    if (isNaN(startObj.start.hour) || isNaN(startObj.start.minute) || isNaN(endObj.end.hour) || isNaN(endObj.end.minute)) {
        alert("Both starting and ending times must have a value");
        return;
    }
    if (startObj.start.hour > endObj.end.hour ||
        (startObj.start.hour === endObj.end.hour && startObj.start.minute > endObj.end.minute) ||
        (startObj.start.hour === endObj.end.hour && startObj.start.minute === endObj.end.minute)) {
        alert("Invalid time... Starting time cannot be the same as or after ending time");
        return;
    }
    let weekDayName;
    switch (weekDay) {
        case 0:
            weekDayName = "sunday";
            break;
        case 1:
            weekDayName = "monday";
            break;
        case 2:
            weekDayName = "tuesday";
            break;
        case 3:
            weekDayName = "wednesday";
            break;
        case 4:
            weekDayName = "thursday";
            break;
        case 5:
            weekDayName = "friday";
            break;
        case 6:
            weekDayName = "saturday";
            break;
        default:
            weekDayName = "sunday";
            break;
    }
    addSchedulePeriod(Object.assign(Object.assign({}, endObj), startObj), weekDayName);
});
//getting values from storage to set the initial state---------------------------------------------------------------
setInterval(() => {
    chrome.storage.local.get(["currentTime", "configs"]).then(result => {
        timeLeftElmnt.textContent = (result.configs.dailyLimit - result.currentTime).toString();
    });
}, 1000);
chrome.storage.local.get(["currentTime", "configs"]).then((result) => {
    currentLimitElmnt.innerText = result.configs.dailyLimit;
    excludeNavElmnt.checked = result.configs.excludeNav;
    excludeShortsElmnt.checked = result.configs.excludeShorts;
    styleButton(result.configs.subscriptionMode);
    enableListElmnt.checked = result.configs.listEnabled;
    renderChannels(result.configs.channelList);
    result.configs.listMode == "blacklist" ? listModeElmnt.classList.add("blacklist") : "";
    result.configs.listMode == "whitelist" ? listModeElmnt.innerText = "Whitelist" : listModeElmnt.innerText = "Blacklist";
    enableScheduleElmnt.checked = result.configs.scheduleEnabled;
    result.configs.scheduleMode == "blacklist" ? scheduleModeElmnt.classList.add("blacklist") : "";
    result.configs.scheduleMode == "whitelist" ? scheduleModeElmnt.innerText = "Whitelist" : scheduleModeElmnt.innerText = "Blacklist";
    result.configs.scheduleMode == "whitelist" ? schdlModeDescriptionElmnt.innerText = "Counting is disabled on the specified periods" : schdlModeDescriptionElmnt.innerText = "Counting is enabled only on the specified periods";
    renderSchedule(result.configs.schedule);
});
//helper funtions---------------------------------------------------------------------------------------------------
function saveConfig(configObj) {
    chrome.storage.local.get(["currentTime", "currentDateUnix", "configs"]).then((result) => {
        chrome.storage.local.set(Object.assign(Object.assign({ configs: Object.assign(Object.assign({}, result.configs), configObj) }, result.currentTime), result.currentDateUnix));
        chrome.runtime.sendMessage({ type: "configChanged" });
    });
}
function styleButton(mode) {
    switch (mode) {
        case "neutral":
            subscriptionModeElmnt.classList.add("neutral");
            subscriptionModeElmnt.classList.remove("blacklist", "whitelist");
            subscriptionModeElmnt.innerText = "Neutral";
            subModeDescriptionElmnt.innerText = "Subscriptions will not interfere in the counting";
            break;
        case "whitelist":
            subscriptionModeElmnt.classList.add("whitelist");
            subscriptionModeElmnt.classList.remove("blacklist", "neutral");
            subscriptionModeElmnt.innerText = "Whitelist";
            subModeDescriptionElmnt.innerText = "Counting is disabled on subscribed channels";
            break;
        case "blacklist":
            subscriptionModeElmnt.classList.add("blacklist");
            subscriptionModeElmnt.classList.remove("neutral", "whitelist");
            subscriptionModeElmnt.innerText = "Blacklist";
            subModeDescriptionElmnt.innerText = "Counting enabled only on subscribed channels";
            break;
    }
}
function removeChannel(name) {
    chrome.storage.local.get(["configs"]).then((result) => {
        const channels = result.configs.channelList.filter((channel) => channel != name);
        saveConfig({ channelList: channels });
        renderChannels(channels);
    });
}
function renderChannels(channels) {
    channelListElmnt.innerHTML = "";
    if (channels.length < 1)
        return;
    channels.forEach(channel => {
        const liElmnt = document.createElement("li");
        const btnElmnt = document.createElement("button");
        btnElmnt.innerText = "X";
        btnElmnt.addEventListener("click", () => removeChannel(channel));
        liElmnt.innerText = channel;
        liElmnt.appendChild(btnElmnt);
        channelListElmnt.appendChild(liElmnt);
    });
}
function renderSchedule(schedule) {
    sundayScheduleElmnt.innerHTML = "";
    mondayScheduleElmnt.innerHTML = "";
    tuesdayScheduleElmnt.innerHTML = "";
    wednesdayScheduleElmnt.innerHTML = "";
    thursdayScheduleElmnt.innerHTML = "";
    fridayScheduleElmnt.innerHTML = "";
    saturdayScheduleElmnt.innerHTML = "";
    schedule.sunday.forEach(period => {
        const schedulePeriod = createScheduleElements(period, "sunday");
        sundayScheduleElmnt.appendChild(schedulePeriod);
    });
    schedule.monday.forEach(period => {
        const schedulePeriod = createScheduleElements(period, "monday");
        mondayScheduleElmnt.appendChild(schedulePeriod);
    });
    schedule.tuesday.forEach(period => {
        const schedulePeriod = createScheduleElements(period, "tuesday");
        tuesdayScheduleElmnt.appendChild(schedulePeriod);
    });
    schedule.wednesday.forEach(period => {
        const schedulePeriod = createScheduleElements(period, "wednesday");
        wednesdayScheduleElmnt.appendChild(schedulePeriod);
    });
    schedule.thursday.forEach(period => {
        const schedulePeriod = createScheduleElements(period, "thursday");
        thursdayScheduleElmnt.appendChild(schedulePeriod);
    });
    schedule.friday.forEach(period => {
        const schedulePeriod = createScheduleElements(period, "friday");
        fridayScheduleElmnt.appendChild(schedulePeriod);
    });
    schedule.saturday.forEach(period => {
        const schedulePeriod = createScheduleElements(period, "saturday");
        saturdayScheduleElmnt.appendChild(schedulePeriod);
    });
}
function createScheduleElements(period, weekDay) {
    const divElmnt = document.createElement("div");
    const spanElmnt = document.createElement("span");
    const buttonElmnt = document.createElement("button");
    buttonElmnt.innerText = "X";
    buttonElmnt.addEventListener("click", () => removeSchedulePeriod(period, weekDay));
    const periodString = `${period.start.hour < 10 ? "0" + period.start.hour : period.start.hour}:${period.start.minute < 10 ? "0" + period.start.minute : period.start.minute} - ${period.end.hour < 10 ? "0" + period.end.hour : period.end.hour}:${period.end.minute < 10 ? "0" + period.end.minute : period.end.minute}`;
    spanElmnt.textContent = periodString;
    divElmnt.classList.add("hourRange");
    divElmnt.appendChild(spanElmnt);
    divElmnt.appendChild(buttonElmnt);
    return divElmnt;
}
function removeSchedulePeriod(period, weekDay) {
    chrome.storage.local.get(["configs"]).then((result) => {
        const daySchedule = result.configs.schedule[weekDay];
        const newDaySchedule = daySchedule.filter(schedule => JSON.stringify(schedule) !== JSON.stringify(period));
        const newSchedule = { schedule: Object.assign(Object.assign({}, result.configs.schedule), { [weekDay]: newDaySchedule }) };
        saveConfig(newSchedule);
        renderSchedule(newSchedule.schedule);
    });
}
function addSchedulePeriod(period, weekDay) {
    chrome.storage.local.get(["configs"]).then((result) => {
        const schedule = result.configs.schedule;
        const daySchedule = schedule[weekDay];
        let overlaps = false;
        daySchedule.forEach(schedule => {
            const startingHourOverlaps = (period.start.hour >= schedule.start.hour && period.start.hour <= schedule.end.hour);
            const endingHourOverlaps = (period.end.hour >= schedule.start.hour && period.end.hour <= schedule.end.hour);
            if (startingHourOverlaps) {
                const startingMinuteOverlaps = (period.start.minute >= schedule.start.minute && period.start.minute <= schedule.end.minute);
                if (startingMinuteOverlaps) {
                    alert("This period overlaps with an existign period!");
                    overlaps = true;
                    return;
                }
            }
            else if (endingHourOverlaps) {
                const endingMinuteOverlaps = (period.end.minute >= schedule.start.minute && period.end.minute <= schedule.end.minute);
                if (endingMinuteOverlaps) {
                    alert("This period overlaps with an existign period!");
                    overlaps = true;
                    return;
                }
            }
        });
        if (overlaps)
            return;
        daySchedule.push(period);
        daySchedule.sort((a, b) => a.start.hour === b.start.hour ? a.start.minute - b.start.minute : a.start.hour - b.start.hour);
        saveConfig({ schedule });
        renderSchedule(schedule);
    });
}
