new fullpage('#fullpage', {
    //anchors: ["", "game"]
});
fullpage_api.setAllowScrolling(true);

var tap = new Audio('static/media/tap.mp3');
tap.volume = 0.4;

//GENERATE GAME CANVAS
var rows = 6;
var cols = 5;
for (var i = 0; i < rows; i++) {
    var row = document.createElement('div');
    row.className = 'row-block'
    for (var j = 0; j < cols; j++) {
        block = document.createElement('div');
        block.className = 'block';
        row.appendChild(block);
    }
    var loadingsvg = document.createElement('img');
    loadingsvg.src = "static/media/loading.svg";
    loadingsvg.className = 'loadingsvg';
    row.appendChild(loadingsvg);
    document.getElementsByClassName("game")[0].appendChild(row)
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

var selected_row = 1;
var selected_block = 1;
var row_word = "";
var processing = false;

function doLetter(letter) {
    var row = $(".game").children(":nth-child("+selected_row+")");
    if (letter == "enter") {
        if (!processing && row_word.length == 5 && selected_row < 7) {
            processing = true;
            showLoadingSvg(row);
            $.post("/checkWord", {word: row_word}, function(data) {
                if (data == "NEMA") {
                    processing = false;
                    hideLoadingSvg(row);
                    badWordAnimation(row);
                    return;
                }
                var tl = anime.timeline({
                    easing: 'easeOutExpo',
                    easing: 'easeOutSine',
                    autoplay: false,
                    complete: function() {
                        putWord(row, row_word, data);
                        row_word = "";
                        selected_block = 1;
                        selected_row += 1;
                        processing = false;
                        if (data == "!!!!!") {
                            nextLvl();
                            current_lvl++;
                            nextLevelTextAnim(current_lvl);
                        }
                    }
                });
                for (var i = 0; i < row_word.length; i++) {
                    if(data[i] == "!") {
                        color = "#00ff00";
                    } else if (data[i] == "?") {
                        color = "#bbbe00";
                    } else {
                        color = "#808080";
                    }
                    tl.add({
                        targets: row.find(":nth-child("+(i+1)+")")[0],
                        duration: 450,
                        keyframes: [
                            {
                                scale: 1,
                                rotateX: 90,
                            },
                            {
                                rotateX: 0,
                                backgroundColor: color,
                                borderColor: color,
                                borderRadius: 5,
                            }
                        ]
                    }, i*150);
                }
                tl.play();

                if (selected_row > 6) {
                    //game over
                }
                hideLoadingSvg(row);
            });
        } else {
            badWordAnimation(row);
        }
    } else if (letter == "backspace") {
        if (row_word.length > 0) {
            selected_block--;
            var block = row.children(":nth-child("+selected_block+")")
            block.html("")
            row_word = row_word.substring(0, row_word.length - 1);
        }
    } else {
        tap.play()
        if (row_word.length < 5) {
            var block = row.children(":nth-child("+selected_block+")")
            block.html(letter)
            row_word += letter;
            selected_block += 1;
            anime({
                targets: block[0],
                scale: [1, 1.2],
                duration: 50,
                direction: 'alternate',
                easing: "linear"
            })
        }
    }
}

function nextLevelTextAnim(lvl) {
    var tl = anime.timeline({
        easing: 'linear',
        duration: 200,
        autoplay: true
    });
    tl.add({
        targets: "#lvlcount",
        translateY: [0, 20],
        opacity: [1, 0],
        complete: function() {
            $(".level-display p span").html(
                current_lvl
            )
        }
    })
    tl.add({
        targets: "#lvlcount",
        translateY: [-20, 0],
        opacity: [0, 1],
    })
}

function putWord(row, word, data) {
    for (var i = 0; i < data.length; i++) {
        row.children(":nth-child("+(i+1)+")").html(word[i]);
        if (data[i] == "!") {
            row.children(":nth-child("+(i+1)+")").addClass("correct");
        } else if (data[i] == "?") {
            row.children(":nth-child("+(i+1)+")").addClass("place");
        } else {
            row.children(":nth-child("+(i+1)+")").addClass("wrong");
            $("#kkk-"+word[i]).addClass("wrong-tipka")
        }
    }
}

function badWordAnimation(row) {
    anime({
        targets: row[0],
        keyframes: [
            {translateX: [0,-10]},
            {translateX: 10}
        ],
        duration: 150,
        easing: 'linear',
        direction: "alternate"
    })
}

function showLoadingSvg(row) {
    $(row).children(".loadingsvg").css("visibility", "visible");
}
function hideLoadingSvg(row) {
    $(row).children(".loadingsvg").css("visibility", "hidden");
}

function nextLvl() {
    row_word = "";
    selected_block = 1;
    selected_row = 1;
    var tl = anime.timeline({
        easing: 'easeInOutBack',
        duration: 300,
        autoplay: false
    });
    tl.add({
        targets: ".game",
        translateX: [0, -50],
        opacity: [1, 0],
        complete: function() {
            $(".game").find(".block").html("");
            $(".game").find(".block").removeClass("wrong");
            $(".game").find(".block").removeClass("correct");
            $(".game").find(".block").removeClass("place");
            $(".game").find(".block").css({"background-color": "#212121", "border-color": "#808080", "border-radius": "0px"});
        }
    });
    tl.add({
        targets: ".game",
        opacity: [0, 1],
        translateX: [50, 0]
    })
    tl.play();
    $("#keyboard").find(".tipka").removeClass("wrong-tipka");
}

function fillGame() {
    var row = -1;
    for (row in table) {
        var row = parseInt(row);
        [word, data] = table[row];
        var rowdiv = $(".game").children(":nth-child("+(row+1)+")");
        putWord(rowdiv, word, data);
    }
    selected_row = parseInt(row)+2;
}

generateKeyboard()
fillGame()

$("#play").click(function(){
    fullpage_api.moveSectionDown();
    document.getElementById("play").style.cursor = "default";
});