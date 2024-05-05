function fold(element) {
    var paragraph = element.nextElementSibling;
    var triangle = element.lastElementChild;
    paragraph.style.display = "none";
    triangle.innerHTML = "&triangleright;";
}

function unfold(element) {
    var paragraph = element.nextElementSibling;
    var triangle = element.lastElementChild;
    paragraph.style.display = "block";
    triangle.innerHTML = "&triangledown;";
}

function toggle(element) {
    var paragraph = element.nextElementSibling;
    var triangle = element.lastElementChild;
    var styleParagraph = getComputedStyle(paragraph).display;
    if (styleParagraph === "none") {
        unfold(element);
    } else {
        fold(element);
    }
}
