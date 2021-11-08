# API
input-handler is a general purpose module meant to aid in the handling of mouse and keyboard input on Linux systems, though it's possible that this may work on other platforms. 

Credit goes to the term-mouse module since this is where I found out that I can use the \x1b escape sequence to trigger cursor event reporting in the terminal. If you just need cursor input, I recommend using this instead as it's above my head in many regards.

Here is how to use input-handler. Once instantiated the module will immediately begin intercepting keyboard input as well as update the current mouse position/activity. Upon keyboard, or mouse input the module will emit events. Though it's possible to directly access the current keypress-qeue, and cursor information if you so desire.

You can instantiate input-handler as follows:

    // For those who don't need verbose output.
    let inputHandler = new require('input-handler')();
    // If you need verbose output you can specify true as a parameter, you can optionally specify where you want this verbose output to be piped, using a callback.
    let inputHandler = new require('input-handler')(true, console.log);

You may have noticed the false statement, along with passing console.log as a callback. This was added as I personally like to pipe debug information to custom TUI elements for debugging purposes, and felt it may be useful for others.

On user input the module emits various events

    // Need to know when the mouse moves, but don't want to constantly request/check it's position?
    // Use the mouse-move event.
    inputHandler.on('mouse-move', (pos) => {
	    console.log(`Cursor has moved to x:${pos.x}, y:${pos.y}`);
    });
    
    // Or maybe you need to know when and where the mouse has been clicked? mouse-click has you covered.
    inputHandler.om('mouse-click', (pos) => {
	    console.log(`Mouse was clicked at x:${pos.x}, y:${pos.y}`);
    });
    
    // Perhaps you need to scroll through a list of items. We've got mouse-scroll as well.
    inputHandler.on('mouse-scroll`, (pos, dir) {
	    console.log(`Mouse scrolled by ${dir} at x:${pos.x}, y: ${pos.y}`);
    }
    
    // You can even recieve keypress events!
    inputHandler.on('keypress', (currentKey) {
	    console.log(`Key "${key.name}" was pressed`);
    });

Right now you need to access the keypress qeue and cursor-state directly with inputHandler.keys or inputHandler.cursor but I have plans to add getters for this information.
