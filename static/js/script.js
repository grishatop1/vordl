new fullpage('#fullpage', {
    anchors: ["", "game"]
});
fullpage_api.setAllowScrolling(false);

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
        if (!processing && row_word.length == 5) {
            $.post("/checkWord", {word: row_word}, function(data) {
                if (data == "OK") {
                    row.children().addClass("correct");
                    setTimeout(function() {
                        processing = false;
                        clearGame();
                        current_lvl++;
                        $(".level-display p").html(
                            "Trenutni nivo: " + current_lvl
                        )
                    }, 1000);
                } else if (data == "NEMA") {
                    //word not found in json play wrong animation
                    processing = false;
                } else {
                    putWord(row, row_word, data);
                    row_word = "";
                    selected_block = 1;
                    selected_row += 1;
                    if (selected_row > 6) {
                        //game over
                    }
                    processing = false;
                }
                
            });
        } else {
            
        }
    } else if (letter == "backspace") {
        if (row_word.length > 0) {
            selected_block--;
            var block = row.children(":nth-child("+selected_block+")")
            block.html("")
            row_word = row_word.substring(0, row_word.length - 1);
        }
    } else {
        if (row_word.length < 5) {
            var block = row.children(":nth-child("+selected_block+")")
            block.html(letter)
            row_word += letter;
            selected_block += 1;
        }
    }
}

function putWord(row, word, data) {
    for (var i = 0; i < data.length; i++) {
        //?row.children(":nth-child("+(i+1)+")").html(word[i]);
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

function clearGame() {
    row_word = "";
    selected_block = 1;
    selected_row = 1;
    $(".game").find(".block").html("");
    $(".game").find(".block").removeClass("wrong");
    $(".game").find(".block").removeClass("correct");
    $(".game").find(".block").removeClass("place");
    $("#keyboard").find(".tipka").removeClass("wrong-tipka");
}

generateKeyboard()

$("#play").click(function(){
    fullpage_api.moveSectionDown();
    setTimeout(function(){
        document.body.style.cursor = 'default';
    }, 500);
    document.getElementById("play").style.cursor = "default";
});