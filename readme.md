
# Youtube focus helper

This is a Chrome extension to help maintain your focus by controlling time spent on youtube. Like most of the apps I build, this one is entirely idealized and coded by me, no copy paste. I do this because I think the best way to learn something is by encountering challenges and overcoming them on your own.

I had the idea to build this extension because in the time I was unenployed and studying all day, I constantly got distracted by youtube videos. I searched online for focus extensions but only found some that did not fit my needs so, I decided take to oportunity to learn about chrome extensions and build one that was very customizable, designed specifically for youtube and could adapt to anyone's studying schedule and usage.





## How it works

Because this was my first time coding an extension, I wanted to try and use only the essential web technologies, no frameworks or libraries except for typescript, so I opted for a minimalistic design and coding approach. The entire extension only uses typescript, html and css and is designed with usability in mind, not looks. That said, this is how it works:

Basically, you have a configurable daily limit of seconds that you can stay on youtube. You can configure a bunch of settings to tell the extension when to discount from your daily limit or not. Once the limit is reached, your youtube will be blocked for the day.

For the user, there are 2 interactable parts to this extension, the first thing you would probably see when you install the extension is whats called the "popup". By default it stays hidden inside your extensions folder, but you can pin it in the extensions bar. When you click the icon(currently the default), a very small window will open and display if your time is ticking and your current time remaining. If you are watching a video, it will also have a button for adding the current channel to the channel list(covered in the options section). Like this:
![Popup](https://i.imgur.com/VnTAjWS.png)



## Options
If you go to the options page you will see what this extension is really about. All the options are pretty self-explanatory so I'll try to cover all of them in a short way. All the settings default to what you see on the images

The first section of the configs is the **Time config.**
![Time config](https://i.imgur.com/ULx09Qw.png)

In this section you can see your current daily time limit, how much time you have left, and change you daily limit by typing the new value in the input box and clicking set, all in seconds.

Exclude navigation makes so that your time will not get discounted when you are navigating on youtube and not watching anything(e.g. searching for a video to watch). Exclude shorts does the same thing but with youtube shorts.


The next section you'll encounter is the **Channels config.**
![Channels config](https://i.imgur.com/QTccasU.png)

Here you can configure what relevance channels will have on your time. Subscription mode, the first option, lets you decide if watching a video from a channel you are subscribed to does not matter to the counting(neutral), if it should stop(whitelist) or if it should start(blacklist).

Right after is the channel list configuration, wich you can enable by checking the box. As the text says, you can specify channels(has to be exactly the same) and the mode that the list operates. Blacklist enables the counting in the said channels and whitelist prevents it.

Finally, there's the **Schedule config**

![Schedule config](https://i.imgur.com/0EsA0P8.png)

As the name suggests, in this section, you can set specific time ranges in any day of the week where the counting will or will not be enabled.

Enable by checking the box and toggle between modes in the button. As the legend says, whitelist will halt the counting in the specified periods and blacklist will enable it.



## Run on your browser

I don't plan on releasing this to the chrome store, at least for now, mainly for two reasons: Because i dont spend nearly as much time as I did on youtube anymore, i cannot properly test this extension to the level I would like to have it released to the public as a finished product AND this code was written in two different stages, the first part(unfortunately the majority) was written before I started working as a full time dev so there's probably a lot of bugs. When i got my job, there was a big gap before I started to slowly pick this project back up and finish it. Because of that, mostly of the code is not really maintanable and kinda hard to work on to make changes.

If you still want to try it, you will have to download the code and load it as an unpacked extension in chrome. To do this, go to the extensions page by clicking the puzzle piece somewhere on your browser, then activate the "Developer mode" at the top right corner. Doing that will allow you to load an unpacked extension in the top left corner. Click the button and select the extension folder you just download it.

If you really like the extension and have a request or a bug you really want fixed, contact me through my email, LinkedIn or any other way you want, and MAYBE, i will have it fixed.