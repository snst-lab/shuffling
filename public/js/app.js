const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const sleep = (time) => {return new Promise(resolve => {setTimeout(() => {resolve()}, time)})};

const getQuery = function() {
    var result = {};
    if ( 1 < location.search.length) {
      var query = location.search.substring(1);
      var parameters = query.split('&');
  
      for (var i = 0; i < parameters.length; i++) {
        var element = parameters[i].split('=');
        var paramName = decodeURIComponent(element[0]);
        var paramValue = decodeURIComponent(element[1]);
        result[paramName] = paramValue;
      }
    }
    return result;
}

window.QUERY = getQuery();

const shuffling = function(){
    const shuffling = this;

    shuffling.controller = function(){
        var align = true;
        var interval = setInterval(function () {
            shuffling.changeAction(shuffling.STRING);
        }, 2000);
        align = false;
    
        $('#canvas').on('click', function () {
            if (align) {
                shuffling.changeAction(shuffling.STRING);
                interval = setInterval(function () {
                    shuffling.changeAction(shuffling.STRING);
                }, 2000);
                align = false;
            }
            else {
                shuffling.endAction(shuffling.STRING);
                clearInterval(interval);
                align = true;
            }
        });
    }

    shuffling.setColor = function(){
        if(typeof QUERY['font'] !== 'undefined'){
            $('.char').each(function(){
                $(this).css({'color': QUERY['font']});
            });
        } else{
            $('.char').each(function(){
                $(this).css({'color':'black'});
            });
        }
        if(typeof QUERY['canvas'] !== 'undefined'){
            $('#canvas').css({'background':QUERY['canvas']});
        } else{
            $('#canvas').css({'background':'radial-gradient(circle, white,whitesmoke ,darkgray)'});
        }
    }

    shuffling.split = function (textByQuery) {
        if(typeof textByQuery !== 'undefined'){
            return textByQuery.split('');
        }
        else {
            return shuffling.DEFAULT_STRINGS.split('');
        }
    }

    shuffling.init = function (query) {
        var fontsize = 0.8 * screen.width / query.length;
        for (var i = 0; i < query.length; i++) {
            $('body').append($('<div>').addClass('char').css({ 'font-size': fontsize, 'top':'-100vh' }).text(query[i]));
        }

    }

    shuffling.changeAction = function (query) {
        $('.char').each(function () {
            var fontsize = 0.8 * Math.max(screen.width,screen.height) / 5 * rand(0.2, 3);
            shuffling.rotate(this, rand(500, 3000), rand(-1, 1));
            $(this).animate({ 'top': rand(-50, 50) + 'vh', 'left': rand(-50, 50) + 'vw', 'font-size': fontsize }, 1800);
        });
    }

    shuffling.endAction = function (query) {
        var fontsize = 0.8 * screen.width / query.length;
        $('.char').each(function (i) {
            shuffling.rotateEnd(this, rand(500, 3000), rand(-1, 2));
            $(this).animate({ 'top': '0%', 'left': '0%', 'font-size': fontsize }, 1000);
        });
    }

    shuffling.rotate = function (dom, msec, direction) {
        if (direction > 0) {
            $(dom).css({ 'animation': 'rotate-clock ' + msec + 'ms linear infinite both' });
        }
        else if (direction < 0) {
            $(dom).css({ 'animation': 'rotate-counterclock ' + msec + 'ms linear infinite both' });
        }
        else {
            $(dom).css({ 'animation': 'none' });
        }
    }

    shuffling.rotateEnd = function (dom, msec, direction) {
        if (direction > 0) {
            $(dom).css({ 'animation': 'rotate-clock ' + msec + 'ms linear both' });
        }
        else if (direction < 0) {
            $(dom).css({ 'animation': 'rotate-counterclock ' + msec + 'ms linear both' });
        }
        else {
            $(dom).css({ 'animation': 'none' });
        }
    }

    shuffling.DEFAULT_STRINGS = '十三不塔';
    shuffling.STRING = shuffling.split(QUERY['text']);
    shuffling.init(shuffling.STRING);
    shuffling.changeAction(shuffling.STRING);
    shuffling.setColor();
    shuffling.controller();
}

const speech = function () {
    var speech = [];
    $('.char').each(function (i) {
        var msg = new SpeechSynthesisUtterance($(this).text());
        var voices = speechSynthesis.getVoices();
        msg.voice = voices[7];
        msg.rate = 1;
        msg.volume =1;
        speech.push(msg);
    });
    $('.char').each(function (i) {
        $(this).click(function () {
            speech[i].pitch = rand(0,2);    
            speechSynthesis.speak(speech[i]);
            var self = this;
            $(self).css({ 'animation': 'glitch 500ms linear both' });
            setTimeout(function(){$(self).css({ 'animation': 'none' });},1000);
        });
    });
}

const audio = function(URL) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;  
    window.CONTEXT = new AudioContext();

    const getAudioBuffer = function(url, fn) {  
        var req = new XMLHttpRequest();
        req.responseType = 'arraybuffer';

        req.onreadystatechange = function() {
            if (req.readyState === 4) {
                if (req.status === 0 || req.status === 200) {
                    CONTEXT.decodeAudioData(req.response, function(buffer) {
                    fn(buffer);
                    });
                }
            }
        };
        req.open('GET', url, true);
        req.send('');
    };

    const playSound = function(buffer) {  
        const source = CONTEXT.createBufferSource();
        source.buffer = buffer;
        const gainNode = CONTEXT.createGain();
        gainNode.gain.value = 0.3; 
        gainNode.connect(CONTEXT.destination);
        source.connect(gainNode);
        source.start(0);
    };

    getAudioBuffer(URL, function(buffer) {
        playSound(buffer);
    });
}

const controller= function(){
    $("#music").on('click',function(){
        if($(this).attr('music')==='on'){
            $(this).attr({'music':'off'});
            $(this).text('music_off');
            CONTEXT.suspend()
        }else{
            $(this).attr({'music':'on'});
            $(this).text('music_note');
            CONTEXT.resume()
        }
    });
    $('#share').click(function(){
        $('.social').each(function(i){
            var self = this;
            setTimeout(function(){
                $(self).css({'height':'3rem','font-size':'0.8em'});
                $(self).children('a').children('img').css({'width':'3rem','height':'3rem'});
            },100*i);
        });
        $('#modal').css({'z-index':'2'});
    });
    $('div').not( "#share" ).click(function(){ 
        $('.social').css({'height':'0','font-size':'0'});
        $('.social img').css({'width':'3rem','height':'0'});
        $('#modal').css({'z-index':'-1'});
    });
    $('.social.facebook a').attr({'href':'https://www.facebook.com/dialog/share?href=https://snst-lab.github.io/shuffling/public/redirect?'+location.search.substring(1)});
    $('.social.twitter a').attr({'href':'https://twitter.com/intent/tweet?url=https://snst-lab.github.io/shuffling/public/redirect?'+location.search.substring(1)});
    $('.social.google a').attr({'href':'https://plus.google.com/share?url=https://snst-lab.github.io/shuffling/public/redirect?'+location.search.substring(1)});
    $('.social.line a').attr({'href':'http://line.me/R/msg/text/?https://snst-lab.github.io/shuffling/public/redirect?'+location.search.substring(1)});
}

window.onload = function () {
    new shuffling();
    new controller();
    new speech();
    new audio('https://snst-lab.github.io/shuffling/public/assets/audio/loop.mp3');
    setInterval(function(){new audio('https://snst-lab.github.io/shuffling/public/assets/audio/loop.mp3');},132000);
}