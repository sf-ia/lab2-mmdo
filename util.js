function createElement(element, parent, classes, id, text, grid) {
    const el = document.createElement(element);

    el.classList.add(...classes);
    el.id = id;
    el.innerText = text;
    if (grid) {
        el.style.gridArea = id;
    }

    parent.appendChild(el);
}

function roundstr(num) {
    if (num.toString().length > 4) {
        return num.toFixed(2);
    } else {
        return num.toString();
    }
}
