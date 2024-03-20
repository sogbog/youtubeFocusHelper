type TabInfoObj = {
    id: number
    page: "nav" | "video" | "shorts"
    channel: string | null
    subscribed: boolean | null
}


type SchedulePeriod = {
    start: {
        hour: number
        minute: number
    }

    end: {
        hour: number
        minute: number
    }
}


type Schedule = {
    sunday: SchedulePeriod[]
    monday: SchedulePeriod[]
    tuesday: SchedulePeriod[]
    wednesday: SchedulePeriod[]
    thursday: SchedulePeriod[]
    friday: SchedulePeriod[]
    saturday: SchedulePeriod[]
}


type ConfigsObj = {
    dailyLimit: number
    excludeNav: boolean
    excludeShorts: boolean
    subscriptionMode: "neutral" | "blacklist" | "whitelist"
    listEnabled: boolean
    channelList: string[]
    listMode: "whitelist" | "blacklist"
    scheduleEnabled: boolean
    scheduleMode: "whitelist" | "blacklist"
    schedule: {
        sunday: SchedulePeriod[]
        monday: SchedulePeriod[]
        tuesday: SchedulePeriod[]
        wednesday: SchedulePeriod[]
        thursday: SchedulePeriod[]
        friday: SchedulePeriod[]
        saturday: SchedulePeriod[]
    }
}

type LocalStorageConfigs = {
    configs: ConfigsObj
    currentTime: number
    currentDateUnix: number
}

type WeekDays = "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday"