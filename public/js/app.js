"use strict";

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const getQuery = function() {
    var result = {};
    if ( 1 < location.search.length) {
      const query = location.search.substring(1);
      const parameters = query.split('&');
  
      for (var i = 0; i < parameters.length; i++) {
        const element = parameters[i].split('=');
        const paramName = decodeURIComponent(element[0]);
        const paramValue = decodeURIComponent(element[1]);
        result[paramName] = paramValue;
      }
    }
    return result;
}

const QUERY = getQuery();

const Shuffling = function(){
    const Shuffling = this;

    Shuffling.controller = function(){
        var align = true;
        var interval = setInterval(function () {
            Shuffling.changeAction(Shuffling.STRING);
        }, 2000);
        align = false;
    
        $('#canvas').on('click', function (event) {
            event.preventDefault();
            if (align) {
                Shuffling.changeAction(Shuffling.STRING);
                interval = setInterval(function () {
                    Shuffling.changeAction(Shuffling.STRING);
                }, 2000);
                align = false;
            }
            else {
                Shuffling.endAction(Shuffling.STRING);
                clearInterval(interval);
                align = true;
            }
        });
    }

    Shuffling.split = function (textByQuery) {
        if(typeof textByQuery !== 'undefined'){
            return textByQuery.split('');
        }
        else {
            return Shuffling.DEFAULT_STRINGS.split('');
        }
    }

    Shuffling.init = function (query) {
        var fontsize = 0.8 * screen.width / Math.min(query.length,5);
        for (var i = 0; i < query.length; i++) {
            $('body').append($('<div>').addClass('char').css({ 'font-size': fontsize, 'top':'-100vh' }).text(query[i]));
        }

    }

    Shuffling.changeAction = function (query) {
        $('.char').each(function () {
            var fontsize = 0.8 * Math.max(screen.width,screen.height) / 5 * rand(0.2, 3);
            Shuffling.rotate(this, rand(500, 3000), rand(-1, 1));
            $(this).animate({ 'top': rand(-50, 50) + 'vh', 'left': rand(-50, 50) + 'vw', 'font-size': fontsize }, 1800);
        });
    }

    Shuffling.endAction = function (query) {
        var fontsize = 0.8 * screen.width / Math.min(query.length,5);
        $('.char').each(function (i) {
            Shuffling.rotateEnd(this, rand(500, 3000), rand(-1, 2));
            $(this).animate({ 'top': '0%', 'left': '0%', 'font-size': fontsize }, 1000);
        });
    }

    Shuffling.rotate = function (dom, msec, direction) {
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

    Shuffling.rotateEnd = function (dom, msec, direction) {
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

    Shuffling.DEFAULT_STRINGS = '十三不塔';
    QUERY['text'] = QUERY['text'] ||  Shuffling.DEFAULT_STRINGS;
    Shuffling.STRING = Shuffling.split(unescape(QUERY['text'].replace(/@@/g,'%')));
    Shuffling.init(Shuffling.STRING);
    Shuffling.changeAction(Shuffling.STRING);
    Shuffling.controller();
}


const Speech = function () {
    var speeches = [];

    $('.char').each(function () {
        var speech = new SpeechSynthesisUtterance($(this).text());
        speech.rate = 5;
        speech.volume = 1;
        speeches.push(speech);
	});

    $('.char').each(function (i) {
        $(this).click(function (event) {
            event.preventDefault();
            speeches[i].pitch = rand(0,2);    
            window.speechSynthesis.speak(speeches[i]);
            const self = this;
            $(self).css({ 'animation': 'glitch 500ms linear both' });
            setTimeout(function(){$(self).css({ 'animation': 'none' });},1000);
        });
    });
}


const Audio = function(URL) {
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
        source.loop = true;
        source.start(0);
    };

    getAudioBuffer(URL, function(buffer) {
       playSound(buffer);
    });
}


const Controller= function(){
    $('#music').on('click',function(event){
        event.preventDefault();
        if($(this).attr('music')==='on'){
            $(this).attr({'music':'off'});
            $(this).text('music_off');
            CONTEXT.suspend();
        }else{
            $(this).attr({'music':'on'});
            $(this).text('music_note');
            CONTEXT.resume();
        }
    });
    $('#share').on('click',function(event){
        event.preventDefault();
        $('.social').each(function(i){
            var self = this;
            setTimeout(function(){
                $(self).css({'height':'3rem','font-size':'0.8em'});
                $(self).children('a').children('img').css({'width':'3rem','height':'3rem'});
            },80*i);
        });
        $('#overlay').css({'z-index':'2'});
    });
    $('#overlay').on('click',function(event){
        event.preventDefault(); 
        $('.social').css({'height':'0','font-size':'0'});
        $('.social img').css({'width':'3rem','height':'0'});
        $('#overlay').css({'z-index':'-1'});
    });
    setTimeout(function(){$('.social').show()},2000);
    $('.social.facebook a').attr({'href':'https://www.facebook.com/dialog/share?href=https://snst-lab.github.io/shuffling/public/redirect?text='+QUERY['text'] });
    $('.social.twitter a').attr({'href':'https://twitter.com/intent/tweet?url=https://snst-lab.github.io/shuffling/public/redirect?text='+QUERY['text'] });
    $('.social.google a').attr({'href':'https://plus.google.com/share?url=https://snst-lab.github.io/shuffling/public/redirect?text='+QUERY['text'] });
    $('.social.line a').attr({'href':'http://line.me/R/msg/text/?https://snst-lab.github.io/shuffling/public/redirect?text='+QUERY['text'] });
    $('.social').on('click',function(){
        CONTEXT.suspend();
    });
}


window.onload = function () {
    new Audio('https://snst-lab.github.io/shuffling/public/assets/audio/loop.mp3');
    new Shuffling();
    new Speech();
    new Controller();
}