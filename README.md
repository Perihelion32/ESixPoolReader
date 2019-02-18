# e621.net Webcomic Reader

A Simple viewer. Javascript Required!

## How to install

 - *Please lookup a guide to hosting a website*
 - Make sure that the configuration has `Access-Control-Allow-Origin` set to `https://e621.net/*` to allow outgoing connections to the e621.net APIs

## How to use

- Go to the index page where you've hosted this site
- Enter the pool id (Required) and the desired page index (Optional, starting at 0)
- Start reading! :)
  - Use the buttons below the image (Labeled 'First', 'Previous', 'Next', 'Last') to navigate.
  - Click on the image to navigate to the next page

## Features

- Easy to navigate through any webcomic found on e621.net
- Optimized for Mobile (I hope)
- Shows the description and the score of the current page
- Shows the first 25 comments of the current page (Note: the api of e621 limits to 25 comments per request)

## Todo

- Show the date and time of the page and comments
- Add support for bbcode

## Why did I make this?

My problem with e621 is that the site makes it pretty hard to navigate through the pool when reading comics on a small screen (Like a phone) because of the way the navigator buttons are positioned. 
Lots of Webcomics are better optimized for this and allows you to click on the image to advance to the next page.
That is why I made this tool

## Contributing

Feel free to contribute any changes, fixes and features!
License: GPLv3
