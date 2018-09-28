const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

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


const shuffling = {
    QUERY : [],
    STRING: [],
    DEFAULT_STRINGS: '古今東西',

    main: function () {
        shuffling.QUERY = getQuery();
        shuffling.STRING = shuffling.split(shuffling.QUERY['text']);
        shuffling.init(shuffling.STRING);
        shuffling.changeAction(shuffling.STRING);
        shuffling.speech();
        shuffling.setColor();

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
    },

    setColor:function(){
        if(typeof shuffling.QUERY['font'] !== 'undefined'){
            $('.char').each(function(){
                $(this).css({'color': shuffling.QUERY['font']});
            });
        } else{
            $('.char').each(function(){
                $(this).css({'color':'black'});
            });
        }
        if(typeof shuffling.QUERY['canvas'] !== 'undefined'){
            $('#canvas').css({'background':shuffling.QUERY['canvas']});
        } else{
            $('#canvas').css({'background':'radial-gradient(circle, white, white, lightgray)'});
        }
    },

    split: function (textByQuery) {
        if(typeof textByQuery !== 'undefined'){
            return textByQuery.split('');
        }
        else {
            return shuffling.DEFAULT_STRINGS.split('');
        }
    },

    init: function (query) {
        var fontsize = 0.8 * screen.width / query.length;
        for (var i = 0; i < query.length; i++) {
            $('body').append($('<div>').addClass('char').css({ 'font-size': fontsize }).text(query[i]));
        }

    },

    changeAction: function (query) {
        $('.char').each(function () {
            var fontsize = 0.8 * screen.width / 5 * rand(0.2, 3);
            shuffling.rotate(this, rand(500, 3000), rand(-1, 1));
            $(this).animate({ 'top': rand(-50, 50) + 'vh', 'left': rand(-50, 50) + 'vw', 'font-size': fontsize }, 1800);
        });
    },

    endAction: function (query) {
        var fontsize = 0.8 * screen.width / query.length;
        $('.char').each(function (i) {
            shuffling.rotateEnd(this, rand(500, 3000), rand(-1, 2));
            $(this).animate({ 'top': '10%', 'left': '0%', 'font-size': fontsize }, 1000);
        });
    },

    rotate: function (dom, msec, direction) {
        if (direction > 0) {
            $(dom).css({ 'animation': 'rotate-clock ' + msec + 'ms linear infinite both' });
        }
        else if (direction < 0) {
            $(dom).css({ 'animation': 'rotate-counterclock ' + msec + 'ms linear infinite both' });
        }
        else {
            $(dom).css({ 'animation': 'none' });
        }
    },

    rotateEnd: function (dom, msec, direction) {
        if (direction > 0) {
            $(dom).css({ 'animation': 'rotate-clock ' + msec + 'ms linear both' });
        }
        else if (direction < 0) {
            $(dom).css({ 'animation': 'rotate-counterclock ' + msec + 'ms linear both' });
        }
        else {
            $(dom).css({ 'animation': 'none' });
        }
    },

    speech: function () {
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
                speech[i].pitch = rand(1,2);    
                speechSynthesis.speak(speech[i]);
                var self = this;
                $(self).css({ 'animation': 'glitch 500ms linear both' });
                setTimeout(function(){$(self).css({ 'animation': 'none' });},1000);
            });
        });
    }
};

const audio = function(URL) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;  
    const context = new AudioContext();

    const getAudioBuffer = function(url, fn) {  
        var req = new XMLHttpRequest();
        req.responseType = 'arraybuffer';

        req.onreadystatechange = function() {
            if (req.readyState === 4) {
                if (req.status === 0 || req.status === 200) {
                    context.decodeAudioData(req.response, function(buffer) {
                    fn(buffer);
                    });
                }
            }
        };
        req.open('GET', url, true);
        req.send('');
    };

    const playSound = function(buffer) {  
        const source = context.createBufferSource();
        source.buffer = buffer;
        const gainNode = context.createGain();
        gainNode.gain.value = 0.3; 
        gainNode.connect(context.destination);
        source.connect(gainNode);
        source.start(0);
    };

    getAudioBuffer(URL, function(buffer) {
        playSound(buffer);
    });
}

window.onload = function () {
    shuffling.main();
    new audio('https://snst-lab.github.io/shuffling/assets/audio/loop.mp3');
    setInterval(function(){new audio('https://snst-lab.github.io/shuffling/assets/audio/loop.mp3');},128000);
}