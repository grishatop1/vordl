new fullpage('#fullpage', {
    anchors: ["", "game"]
});
fullpage_api.setAllowScrolling(false);


//GENERATE GAME CANVAS
var cols = 5;
var rows = 6;
for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
        block = document.createElement('div');
        block.className = 'block';
        block.id = 'block' + (i + j);
        document.getElementsByClassName("game")[0].appendChild(block);
    }
}

function generateKeyboard() {
    var order = [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace']
    ]
    var keyboard = document.getElementById('keyboard');
    var row;
    var button;
    for (var i = 0; i < order.length; i++) {
        row = document.createElement('div');
        row.className = 'keyrow';
        for (var j = 0; j < order[i].length; j++) {
            button = document.createElement('button');
            button.innerHTML = order[i][j];
            button.className = 'tipka';
            button.id = "kkk-" + order[i][j];
            button.setAttribute("tabindex", "-1");
            row.appendChild(button);
            button.onclick = function() {
                doLetter(this.innerHTML);
                this.blur();
            }
        }
        keyboard.appendChild(row);
    }
    window.addEventListener("keydown", function (e) {
        let key = e.key.toLowerCase().replace(/ /g,'');
        if (key == "backspace" || key == "enter" || key.length==1) {
            doLetter(key);
        }
    });
}

generateKeyboard()

$("#play").click(function(){
    fullpage_api.moveSectionDown();
    setTimeout(function(){
        document.body.style.cursor = 'default';
    }, 500);
    document.getElementById("play").style.cursor = "default";
});