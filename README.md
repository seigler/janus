#JANUS

This is a browser-based presentation framework with two connected views: one for the presenter, and one for the audience.

## Features:

* Presenter view and presentation view, connected through Localstorage
* Specializes in live-coding demos

## How to Use:

Use `npm run start` to serve the project folder on `localhost` and launch it in your default browser.

After you have edited index.html to your liking, you can run `npm run build` to compile the whole presentation into a single portable file for use elsewhere.

## Gotchas:

Firefox and Chrome handle `file:///` urls differently. In Firefox, local files are allowed to interact with LocalStorage, but on Chrome they are not. To circumvent this issue, you have to serve the file on `localhost` with `npm run start` or some other local server.