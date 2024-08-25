document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.getElementById('terminal');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    // Drag functionality
    const header = terminal.querySelector('.terminal__header');

    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target === header) {
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, terminal);
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;

        isDragging = false;
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }

    // Maximize functionality
    document.querySelector('.action--max').addEventListener('click', function () {
        terminal.classList.toggle('big');
        xOffset = 0;
        yOffset = 0;
        setTranslate(0, 0, terminal);
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

    // Terminal typing effect
    initializeTerminal();
});

function typeText(element, text, interval = 100) {
    return new Promise((resolve) => {
        let i = 0;
        const typing = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typing);
                resolve();
            }
        }, interval);
    });
}

async function initializeTerminal() {
    const terminalBody = document.querySelector('.terminal__body');
    terminalBody.innerHTML = ''; // Clear initial text

    // Initial intro
    await showInitialIntro(terminalBody);

    // Start interactive prompt
    await showPromptAndAwaitInput(terminalBody);
}

async function showInitialIntro(terminalBody) {
    const promptElement = document.createElement('p');
    const outputElement = document.createElement('h4');

    promptElement.className = 'terminal__prompt';
    promptElement.textContent = 'abe@wrkhrs.co ~ % ';
    terminalBody.appendChild(promptElement);

    // Pause before typing command
    await new Promise(resolve => setTimeout(resolve, 500));

    // Type the command
    await typeText(promptElement, 'bio', 50);

    // Small pause after command
    await new Promise(resolve => setTimeout(resolve, 200));

    // Add and type the output
    terminalBody.appendChild(outputElement);
    await typeText(outputElement, 'Abraham is a highly experienced interdisciplinary designer, creative technologist, and award-winning studio founder.', 20);
}

async function showPromptAndAwaitInput(terminalBody) {
    const promptElement = document.createElement('p');
    promptElement.className = 'terminal__prompt';
    promptElement.textContent = 'abe@wrkhrs.co ~ % ';
    terminalBody.appendChild(promptElement);

    const inputElement = document.createElement('span');
    inputElement.className = 'terminal__input';
    inputElement.contentEditable = true;
    promptElement.appendChild(inputElement);
    inputElement.focus();

    inputElement.addEventListener('keydown', async function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const command = this.textContent;
            this.remove();
            await typeText(promptElement, command, 10);
            await processCommand(command, terminalBody);
            await showPromptAndAwaitInput(terminalBody);
        } else if (this.textContent.length === 0 && e.key === 'Backspace') {
            e.preventDefault(); // Prevent backspace from navigating back
        }
    });
}

async function processCommand(command, terminalBody) {
    const outputElement = document.createElement('p');
    terminalBody.appendChild(outputElement);

    switch (command.toLowerCase().trim()) {
        case 'help':
            await typeText(outputElement, 'Available commands: help, bio, clear', 20);
            break;
        case 'bio':
            await typeText(outputElement, 'Abraham is a highly experienced interdisciplinary designer, creative technologist, and award-winning studio founder.', 20);
            break;
        case 'clear':
            terminalBody.innerHTML = '';
            break;
        default:
            // Here you can implement your search functionality
            await typeText(outputElement, `Searching for: ${command}`, 20);
        // Add your search logic here
    }
}