document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.getElementById('terminal');
    let isDragging = false;

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

function typeText(element, text, interval = 100) {
    let i = 0;
    const typing = setInterval(() => {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
        } else {
            clearInterval(typing);
        }
    }, interval);
}

// Usage
document.addEventListener('DOMContentLoaded', function () {
    const terminalBody = document.querySelector('.terminal__body h4');
    terminalBody.innerHTML = ''; // Clear initial text
    typeText(terminalBody, 'Dear reader, this site is an ode to the simple, personal, and personable websites of the past, present, and future. Treat this as a record of my practice and process.', 50);
});

document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.getElementById('terminal');
    const maximizeBtn = document.querySelector('.action--max');
    const minimizeBtn = document.querySelector('.action--min');
    const closeBtn = document.querySelector('.action--close');

    maximizeBtn.addEventListener('click', () => {
        terminal.classList.toggle('maximized');
    });

    minimizeBtn.addEventListener('click', () => {
        terminal.classList.add('minimized');
        setTimeout(() => terminal.classList.remove('minimized'), 300); // Revert minimized state for potential maximize action
    });

    closeBtn.addEventListener('click', () => {
        terminal.classList.add('shake');
        setTimeout(() => terminal.classList.remove('shake'), 820); // Length of the shake animation
    });
});
