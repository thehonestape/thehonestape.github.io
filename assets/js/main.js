document.addEventListener('DOMContentLoaded', () => {
    // Custom cursor initialization - ADD THIS FIRST
    if (!document.querySelector('.custom-cursor')) {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';

        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
            <path d="M25 0C11.19 0 0 11.19 0 25s11.19 25 25 25 25-11.19 25-25S38.81 0 25 0m11 27.01c0 .52-.43.95-.95.95s-.95-.43-.95-.95v-9.78L15.61 35.72a.948.948 0 0 1-1.34-1.34l18.49-18.49h-9.78c-.52 0-.95-.43-.95-.95s.43-.95.95-.95h12.06c.52 0 .95.43.95.95V27Z"/>
        </svg>`;

        cursor.innerHTML = svgContent;
        document.body.appendChild(cursor);

        document.addEventListener('mousemove', (e) => {
            requestAnimationFrame(() => {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            });
        });

        const links = document.querySelectorAll('a:has(.blog-roll-image)');
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                cursor.style.opacity = '1';
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            });

            link.addEventListener('mouseleave', () => {
                cursor.style.opacity = '0';
                cursor.style.transform = 'translate(-50%, -50%) scale(0.5)';
            });
        });
    }


    
    const terminal = document.getElementById('terminal');
    if (terminal) {
        const shakeWrapper = document.querySelector('.terminal-wrapper');
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        // Store the initial position and size
        const initialPosition = {
            x: terminal.getBoundingClientRect().left,
            y: terminal.getBoundingClientRect().top,
            width: terminal.offsetWidth,
            height: terminal.offsetHeight,
        };
        

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

    function dragEnd() {
        initialX = currentX;
        initialY = currentY;

        isDragging = false;
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }

    // Maximize functionality
    document.querySelector('.action--max').addEventListener('click', function () {
        terminal.classList.remove('minimized');
        terminal.classList.toggle('big');
        xOffset = 0;
        yOffset = 0;
        setTranslate(0, 0, terminal);
    });

    // Minimize functionality
    document.querySelector('.action--min').addEventListener('click', function () {
        terminal.classList.remove('big');
        terminal.classList.toggle('minimized');
        if (!terminal.classList.contains('minimized')) {
            setTranslate(0, 0, terminal);
        }
    });

    // Close functionality (with shake animation)
    document.querySelector('.action--close').addEventListener('click', function () {
        shakeWrapper.classList.add('headShake');
        setTimeout(() => shakeWrapper.classList.remove('headShake'), 500);
    });

    // Terminal typing effect
    initializeTerminal();
    }

});



async function typeText(element, html, interval = 100) {
    const contentArray = html.split(/(<[^>]+>)/g);
    for (let part of contentArray) {
        if (part.startsWith('<')) {
            element.innerHTML += part;
        } else {
            for (let char of part) {
                element.innerHTML += char;
                await new Promise(resolve => setTimeout(resolve, interval));
            }
        }
    }
}

async function initializeTerminal() {
    const terminalBody = document.querySelector('.terminal__body');
    terminalBody.innerHTML = '';

    await showInitialIntro(terminalBody);
    await showPromptAndAwaitInput(terminalBody);
}

async function showInitialIntro(terminalBody) {
    const promptElement = document.createElement('p');
    const outputElement = document.createElement('h4');

    promptElement.className = 'terminal__prompt';
    promptElement.textContent = 'abe@wrkhrs.co ~ % ';
    terminalBody.appendChild(promptElement);

    await new Promise(resolve => setTimeout(resolve, 200));
    await typeText(promptElement, 'about', 50);
    await new Promise(resolve => setTimeout(resolve, 100));

    terminalBody.appendChild(outputElement);
    await typeText(outputElement, 'These are the words and images of Abraham Garcia. Designing for meaning, creating identities, and shaping worlds.', 10);
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

    let isTerminalFocused = false;

    inputElement.addEventListener('focus', () => {
        isTerminalFocused = true;
    });

    inputElement.addEventListener('blur', () => {
        isTerminalFocused = false;
    });

    inputElement.addEventListener('keydown', async function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const command = this.textContent;
            this.remove();
            await typeText(promptElement, command, 10);
            await processCommand(command, terminalBody);
            await showPromptAndAwaitInput(terminalBody);
        } else if (this.textContent.length === 0 && e.key === 'Backspace') {
            e.preventDefault();
        }
    });

    // Prevent focus on terminal input when clicking outside
    document.addEventListener('click', function (e) {
        const terminal = document.getElementById('terminal');
        if (terminal && !terminal.contains(e.target)) {
            const inputElement = terminal.querySelector('.terminal__input');
            if (inputElement) inputElement.blur();
        }
    });

    // Prevent automatic focus on page load
    window.addEventListener('load', () => {
        inputElement.blur();
    });

    // Handle focus only when clicking directly on the terminal
    terminal.addEventListener('mousedown', (e) => {
        if (e.target === inputElement || inputElement.contains(e.target)) {
            isTerminalFocused = true;
        } else {
            isTerminalFocused = false;
            inputElement.blur();
        }
    });

    // Prevent scrolling to the terminal when typing elsewhere
    document.addEventListener('focus', (e) => {
        if (!isTerminalFocused && e.target !== inputElement) {
            e.preventDefault();
            e.target.focus();
        }
    }, true);
}

async function processCommand(command, terminalBody) {
    const outputElement = document.createElement('p');
    terminalBody.appendChild(outputElement);

    switch (command.toLowerCase().trim()) {
        case 'help':
            await typeText(outputElement, 'Available commands: help, about, clear', 20);
            break;
        case 'about':
            await typeText(outputElement, 'Abraham is an interdisciplinary designer, creative technologist, and the co-founder of Workhorse.', 10);
            break;
        case 'clear':
            terminalBody.innerHTML = '';
            break;
        default:
            await typeText(outputElement, `Searching for: ${command}`, 20);
    }
}