document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.getElementById('terminal');
    let isDragging = false;

    const terminalBody = document.querySelector('.terminal__body');
    let commandsIndex = 0;
    const commands = [
        {
            command: 'w3m thehonestape.com', response: `  
   <p>Local time is {{ site.time | date: '%Y-%m-%d %H:%M:%S' }}` },
        {
            command: 'abe-bio', response: `<p>My name is Abraham Garcia, I am the co-founder of <a class="yellow" href="http://wrkhrs.co" target="_blank">Workhorse</a> in Washington, DC.</p>
<p>I <a class="magenta" href="https://dribbble.com/thehonestape" target="_blank">design</a> and <a class="mint" href="https://github.com/thehonestape" target="_blank">build</a> things for the web(world) from Charleston, SC &#127796;.</p>
<p>Have a question? Shoot me an <a class="blue" href="mailto:abe@wrkhrs.co" target="_top">email at abe@wrkhrs.co</a></p>` },
        { command: 'exit', response: '' }
    ];

    // Drag functionality
    const header = terminal.querySelector('.terminal__header');
    header.addEventListener('mousedown', function (e) {
        isDragging = true;
        let dragOffsetX = e.clientX - terminal.offsetLeft;
        let dragOffsetY = e.clientY - terminal.offsetTop;
        function mouseMoveHandler(e) {
            terminal.style.left = e.clientX - dragOffsetX + 'px';
            terminal.style.top = e.clientY - dragOffsetY + 'px';
        }
        function mouseUpHandler() {
            window.removeEventListener('mousemove', mouseMoveHandler);
            window.removeEventListener('mouseup', mouseUpHandler);
            isDragging = false;
        }
        window.addEventListener('mousemove', mouseMoveHandler);
        window.addEventListener('mouseup', mouseUpHandler);
    });

    // Maximize functionality
    document.querySelector('.action--max').addEventListener('click', function () {
        terminal.classList.toggle('big');
        terminal.style.top = '0';
        terminal.style.left = '0';
    });

    // Minimize functionality
    document.querySelector('.action--min').addEventListener('click', function () {
        terminal.classList.toggle('small');
    });

    // Close functionality
    document.querySelector('.action--close').addEventListener('click', function () {
        terminal.classList.add('shake');
        setTimeout(() => terminal.classList.remove('shake'), 500);
    });
});













document.addEventListener('DOMContentLoaded', () => {
    const terminalBody = document.querySelector('.terminal__body');
    let commandsIndex = 0;
    const commands = [
        {
            command: 'w3m thehonestape.com', response: `  
   <p>Local time is {{ site.time | date: '%Y-%m-%d %H:%M:%S' }}` },
        {
            command: 'abe-bio', response: `<p>My name is Abraham Garcia, I am the co-founder of <a class="yellow" href="http://wrkhrs.co" target="_blank">Workhorse</a> in Washington, DC.</p>
<p>I <a class="magenta" href="https://dribbble.com/thehonestape" target="_blank">design</a> and <a class="mint" href="https://github.com/thehonestape" target="_blank">build</a> things for the web(world) from Charleston, SC &#127796;.</p>
<p>Have a question? Shoot me an <a class="blue" href="mailto:abe@wrkhrs.co" target="_top">email at abe@wrkhrs.co</a></p>` },
        { command: 'exit', response: '' }
    ];

    function simulateCommandInput() {
        if (commandsIndex < commands.length) {
            const command = commands[commandsIndex];
            typeCommand(command.command, () => {
                addResponse(command.response);
                commandsIndex++;
                simulateCommandInput();
            });
        } else {
            // Final state with editable caret
            addFinalCaret();
        }
    }

    function typeCommand(command, callback) {
        const prompt = document.createElement('div');
        prompt.innerHTML = `abe@wrkhrs.co ~ % <span class="typed-command"></span>`;
        terminalBody.appendChild(prompt);
        const typedCommand = prompt.querySelector('.typed-command');

        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < command.length) {
                typedCommand.textContent += command.charAt(i);
                i++;
                scrollToBottom();
            } else {
                clearInterval(typingInterval);
                if (callback) callback(); // Proceed to add response after typing command
            }
        }, 100); // Adjust typing speed as needed
    }

    function addResponse(responseHTML) {
        const response = document.createElement('div');
        response.innerHTML = responseHTML;
        terminalBody.appendChild(response);
        scrollToBottom();
        setTimeout(() => { // Wait a bit before next command for readability
            if (responseHTML.trim() !== '') scrollToBottom();
        }, 500);
    }

    function addFinalCaret() {
        const finalPrompt = document.createElement('div');
        finalPrompt.innerHTML = `abe@wrkhrs.co ~ % <span contenteditable="true">&nbsp;&nbsp;</span><span class="caret"></span>`;
        terminalBody.appendChild(finalPrompt);
        scrollToBottom();
    }

    function scrollToBottom() {
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    simulateCommandInput(); // Start the simulation
});
