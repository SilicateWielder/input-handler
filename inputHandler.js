/////////////////////////////////////////////////////////////////////////////////////////
//
//  [Redacted], UI revision 3.
//
//  Written by Michael Warner, November 2021.
// 
//  The purpose of this revision is due to me being with the complexity and
//  inconsistency in previous attempts. Now that I've figured more out I'm starting
//  over from scratch. Though this may just be old habits talking.
//
/////////////////////////////////////////////////////////////////////////////////////////
//  The purpose of this particular file:
//
//      To add a central system for handling user input within the terminal. With
//      previous versions keyboard input was the only available input method, however
//      this revision attempts to remedy the issue of mouse input, at least on linux.
//
//      With previous versions, input was handled all over the place, with long chains
//      of if-else statements being written to handle user input. While this will still
//      allow for grabbing input directly from the source, it will be possible to give
//      this input controller callbacks to make when specific keystrokes are made.
//  
/////////////////////////////////////////////////////////////////////////////////////////
//
//  Notes: This version is incomplete but usable.
//
/////////////////////////////////////////////////////////////////////////////////////////

const { throws } = require('assert');
const colors = require('colors');
const tty = require('tty');

class inputHandler {
    constructor(verboseMode = false, callback = console.log) {
        this.qeue = [];

        this.cursor = {
            x: 0,
            y: 0,
            leftClick: false,
            reading: false,
            raw: '',
            scroll: 0
        }

        this.verboseMode = verboseMode;
        this.printCallback = callback

        // Enable raw input mode. Use TTY if necessary.
        if(process.stdin.setRawMode) {
            process.stdin.setRawMode(true);
        } else {
            tty.setRawMode(true);
        }

        // Enable cursor tracking.
        process.stdout.write('\x1b[?1003h');
        process.stdout.write('\x1b[?1005h');
        process.stdout.write('\x1b[?1006h');
        process.stdout.write('\x1b[?1015h');

        this.readline = require('readline');
        this.readline.emitKeypressEvents(process.stdin);	

        process.stdin.on('keypress', (str, key) => {

            // Since we're intercepting keypresses. We need to implement a surefire 
            // way for users to quit the program if needed. CTRL + C
            if(key.ctrl && key.sequence == '\u0003') {

                // Gotta disable cursor tracking.
                process.stdout.write('\x1b[?1003l');
                process.stdout.write('\x1b[?1005l');
                process.stdout.write('\x1b[?1006l');
                process.stdout.write('\x1b[?1015l');

                // Now we can clear the screen and exit the process.
                console.clear();
                return process.exit(0);

            // If we see this escape code we need to handle it differently.
            // A flag needs to be set since the following events are almost
            // certainly going to be related to mouse positioning/input.
            } else if (key.sequence == '\x1b[<') {
                this.cursor.raw = '';
                this.cursor.reading = true;
                this.handleCursor(key);
            } else if (this.cursor.reading == true) {
                this.handleCursor(key);

            // Anything else is most likely a keypress and can be handled as such.
            } else {
                this.handleKeyboard(key);
            }
        });
    }

    handleCursor(key) {
        //console.log(this.cursor.raw);
 
        if(key.sequence == 'm' || key.sequence == 'M')
        {
            let values = this.cursor.raw.split(';');

            if(values[0] == '0') {
                this.cursor.leftClick = true;
            } else {
                this.cursor.leftClick = false;
                
                this.cursor.x = values[1];
                this.cursor.y = values[2];
            }

            if(values[0] != '0' && values[0] != '35') {
                this.cursor.scroll = (values[0] == '64') ? 1 : -1;
            } else {
                this.cursor.scroll = 0;
            }

            this.cursor.reading = false;

            console.log(this.cursor);
        } else if (key.sequence != '\x1b[<') this.cursor.raw += '' + key.sequence;
    }

    handleKeyboard(key) {
        this.qeue.push(key);

        if(this.qeue.length > 20) {
            this.qeue.shift();
        }

        if(this.verboseMode) {
            this.printCallback(key);
        }
    }
}

let testController = new inputHandler(false, console.log);
