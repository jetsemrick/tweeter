## AFCRichmond
Developed by *Nathan Dodson, Taylor Himelhoch, Jet Semrick*

Project for EECS 647 Databases. The goal of this project is to create a Twitter like application to demonstrate database implementation.

## Installation Instructions

### Windows / Linux / MacOS:
Requires PHP server version 8.1.4 or later. For quick installation of PHP + webserver, use [XAMPP](https://www.apachefriends.org/index.html).

Clone the project directory; copy project path into `DocumentRoot` directives in `apache.conf` for XAMPP. For more details, see [here](https://stackoverflow.com/questions/18902887/how-to-configuring-a-xampp-web-server-for-different-root-directory).

It should look similar to this:

```
# symbolic links and aliases may be used to point to other locations.
#
DocumentRoot "C:\Users\Nathan\Documents\GitHub\AFCRichmond\www"
<Directory "C:\Users\Nathan\Documents\GitHub\AFCRichmond\www">
    #
```

Open `localhost` (or configured port) in browser.

## Tech Stack
- HTML, PHP 8.1.4, JS
- CSS was bootstrapped with [HTML Bootstrap v5.3](https://getbootstrap.com/docs/5.1/getting-started/introduction/)
- MySQL
