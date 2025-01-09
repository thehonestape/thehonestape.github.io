const terminalManager = {
    initialize() {
        const terminal = document.getElementById('terminal');
        if (!terminal) return;

        this.setupTerminalComponents(terminal);
        this.initializeTerminal();
    },

    setupTerminalComponents(terminal) {
        const shakeWrapper = terminal.querySelector('.terminal-wrapper');
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        // Initialize drag functionality
        const header = terminal.querySelector('.terminal__header');
        if (header) {
            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
        }

        // Initialize buttons
        const maxButton = terminal.querySelector('.action--max');
        const minButton = terminal.querySelector('.action--min');
        const closeButton = terminal.querySelector('.action--close');

        if (maxButton) {
            maxButton.addEventListener('click', () => {
                terminal.classList.remove('minimized');
                terminal.classList.toggle('big');
                xOffset = 0;
                yOffset = 0;
                setTranslate(0, 0, terminal);
            });
        }

        if (minButton) {
            minButton.addEventListener('click', () => {
                terminal.classList.remove('big');
                terminal.classList.toggle('minimized');
                if (!terminal.classList.contains('minimized')) {
                    setTranslate(0, 0, terminal);
                }
            });
        }

        if (closeButton && shakeWrapper) {
            closeButton.addEventListener('click', () => {
                shakeWrapper.classList.add('headShake');
                setTimeout(() => shakeWrapper.classList.remove('headShake'), 500);
            });
        }

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
    },

    async initializeTerminal() {
        const terminalBody = document.querySelector('.terminal__body');
        if (!terminalBody) return;

        terminalBody.innerHTML = '';
        await this.showInitialIntro(terminalBody);
        await this.showPromptAndAwaitInput(terminalBody);
    },

    async typeText(element, html, interval = 100) {
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
    },

    async showInitialIntro(terminalBody) {
        const promptElement = document.createElement('p');
        const outputElement = document.createElement('h4');

        promptElement.className = 'terminal__prompt';
        promptElement.textContent = 'abe@wrkhrs.co ~ % ';
        terminalBody.appendChild(promptElement);

        await new Promise(resolve => setTimeout(resolve, 200));
        await this.typeText(promptElement, 'about', 50);
        await new Promise(resolve => setTimeout(resolve, 100));

        terminalBody.appendChild(outputElement);
        await this.typeText(outputElement, 'These are the words and images of Abraham Garcia. Designing for meaning, creating identities, and shaping worlds.', 10);
    },

    async showPromptAndAwaitInput(terminalBody) {
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

        inputElement.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const command = inputElement.textContent;
                inputElement.remove();
                await this.typeText(promptElement, command, 10);
                await this.processCommand(command, terminalBody);
                await this.showPromptAndAwaitInput(terminalBody);
            } else if (inputElement.textContent.length === 0 && e.key === 'Backspace') {
                e.preventDefault();
            }
        });

        // Prevent focus on terminal input when clicking outside
        document.addEventListener('click', (e) => {
            const terminal = document.getElementById('terminal');
            if (terminal && !terminal.contains(e.target)) {
                const inputElement = terminal.querySelector('.terminal__input');
                if (inputElement) inputElement.blur();
            }
        });

        // Handle focus only when clicking directly on the terminal
        const terminal = document.getElementById('terminal');
        if (terminal) {
            terminal.addEventListener('mousedown', (e) => {
                if (e.target === inputElement || inputElement.contains(e.target)) {
                    isTerminalFocused = true;
                } else {
                    isTerminalFocused = false;
                    inputElement.blur();
                }
            });
        }

        // Prevent scrolling to the terminal when typing elsewhere
        document.addEventListener('focus', (e) => {
            if (!isTerminalFocused && e.target !== inputElement) {
                e.preventDefault();
                e.target.focus();
            }
        }, true);
    },

    async processCommand(command, terminalBody) {
        const outputElement = document.createElement('p');
        terminalBody.appendChild(outputElement);

        switch (command.toLowerCase().trim()) {
            case 'help':
                await this.typeText(outputElement, 'Available commands: help, about, clear', 20);
                break;
            case 'about':
                await this.typeText(outputElement, 'Abraham is an interdisciplinary designer, creative technologist, and the co-founder of Workhorse.', 10);
                break;
            case 'clear':
                terminalBody.innerHTML = '';
                break;
            default:
                await this.typeText(outputElement, `Searching for: ${command}`, 20);
        }
    }
};

// Export for use in other files
window.terminalManager = terminalManager;