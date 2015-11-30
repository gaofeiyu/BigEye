'use strict';
function BigEye(){
    var self = this;
    self.show360 = function(options){
        return new show360(options);
    };
    function show360(options){
        var s360 = this;
        var defaults = {
            element: '',
            width: '',
            height: '',
            rotateRange: '2',
            touchSpeed: '10',
            imgPath: 'pic/',
            imgPrefix: 'threesixty_',
            imgType: 'jpg',

            startIndex: '1',
            autoPlay: false,
            loading: true,
        };
        self.extend(true,defaults,options);

        var consts = {
            rotate: 360,
        };
        var opt = {
            // 组件根部对象
            ele : document.querySelector(defaults.element),
            ele_ol : null,
            moveLock : true,
            imgTotal : consts.rotate/defaults.rotateRange,
            active: parseInt(defaults.startIndex),
            easeTime : null
        };

        var imgLoadState = {
            imgArr : [],
            imgComplete : 0,
            loadProgress : 0,

        };

        _renderList(opt.ele);
        var eleX = -1,
            range = 0;

        self.addEvent(opt.ele,'mousedown',function(e){
            e.preventDefault();
            eleX = -1;
            range = 0;
            clearTimeout(opt.easeTime);
            opt.moveLock = false;
        });
        self.addEvent(opt.ele,'mouseup',function(e){
            opt.moveLock = true;
            console.log(range);
            s360.easeStop(1);
            //console.log('up',e.touche);
        });
        s360.easeStop = function(now){
            var r = range > 0 ? 1 : -1;
            if(now<Math.abs(range)*2){
                opt.easeTime = setTimeout(function(){
                    console.log(now,range,Math.ceil(self.Tween.Quint.easeOut(now,0,range,Math.abs(range)*2)));
                    s360.turnRotate( range+r-Math.ceil(self.Tween.Circ.easeOut(now,0,range,Math.abs(range)*2)) );
                    s360.easeStop(now+1,range);
                },20);
            }
        };
        self.addEvent(opt.ele,'mousemove',function(e){
            if(!opt.moveLock){
                var x = e.pageX;
                if(typeof e.touches != 'undefined'){
                    x = e.touches[0].pageX;
                }
                if(eleX == -1){
                    eleX = x;
                    return;
                }
                range = parseInt((x - eleX) / defaults.rotateRange);
                s360.turnRotate(range);
                eleX = x;
            }
        });

        s360.turnRotate = function(range){
            opt.ele_ol.childNodes[opt.active - 1].style.display = "none";
            opt.active -= range;
            if(opt.active < 1){
                opt.active = opt.imgTotal - 1 + opt.active % opt.imgTotal;
            }
            if(opt.active > opt.imgTotal){
                opt.active = opt.active % opt.imgTotal +1;
            }
            console.log('active',opt.active,range);
            opt.ele_ol.childNodes[opt.active - 1].style.display = "block";
        };

        // 渲染组件Html结构
        function _renderList(){
            var list = document.createElement('ol');
            list.setAttribute('style','position:relative; display:none;');
            for(var i = 1; i<=opt.imgTotal; i++){
                var li = document.createElement('li');
                var display = 'display:none';
                if(i == defaults.startIndex){
                    display = '';
                }
                li.setAttribute('style','position:absolute; left:0; top:0;'+display);
                var img = new Image();
                img.src = defaults.imgPath + defaults.imgPrefix + i + '.' + defaults.imgType;
                li.appendChild(img);
                imgLoadState.imgArr.push(img);
                list.appendChild(li);
            }
            opt.ele_ol = list;
            opt.ele.appendChild(list);
            _imgLoading();
        }
        console.log(opt.ele_ol.childNodes);

        // 图片加载
        function _imgLoading(){
            imgLoadState.imgComplete = 0;
            for(var i = 0; i<opt.imgTotal; i++){
                if(imgLoadState.imgArr[i].complete){
                    imgLoadState.imgComplete++;
                }
            }
            imgLoadState.loadProgress = parseInt(imgLoadState.imgComplete / opt.imgTotal * 100);
            console.log(imgLoadState.loadProgress);
            if(imgLoadState.imgComplete !== opt.imgTotal){
                setTimeout(_imgLoading,100);
            }else{
                opt.ele_ol.style.display = 'block';
            }
        }
    }
}
BigEye.prototype.addEvent = function(ele,name,handle){
    var self = this;
    if(typeof ele.nodeType == 'undefined'){
        console.warn('操作的不是一个Node');
    }
    if(self.platform()){
        switch(name){
            case 'mousedown':
                name = 'touchstart';
                break;
            case 'mouseup':
                name = 'touchend';
                break;
            case 'mousemove':
                name = 'touchmove';
                break;
        }
    }
    ele.addEventListener(name,handle,false);
    return ele;
};
BigEye.prototype.removeEvent = function(ele,name,handle){
    var self = this;
    if(typeof ele.nodeType == 'undefined'){
        console.warn('操作的不是一个Node');
    }
    ele.removeEventListener(name,handle,false);
    return ele;
};

BigEye.prototype.typeOf = function(val){
    var type = typeof val;
    if(typeof val != 'object'){
        return type;
    }else{
        return val == null ? 'null' : Object.prototype.toString.call(val).slice(8,-1).toLowerCase();
    }
};
BigEye.prototype.extend = function(flag){
    var self = this;
    var start = 0;
    if(typeof flag === 'boolean' && flag){
        start = 1;
    }
    if(self.typeOf(arguments[start]) === 'object' || self.typeOf(arguments[start]) === 'array'){
        //var arr = arguments.slice(start+1,-1);
        for(var i = start+1; i<arguments.length; i++){
            if(self.typeOf(arguments[i]) === 'object' || self.typeOf(arguments[i]) === 'array'){
                for(var key in arguments[i]){
                    console.log(key);
                    if(start === 1){
                        if(self.typeOf(arguments[i][key]) === 'object' || self.typeOf(arguments[i][key]) === 'array'){
                            //arguments.callee(flag,arguments[1][key],arr[i][key]); 严格模式禁用了callee
                            if(arguments[start][key] == undefined){
                                self.typeOf(arguments[i][key]) === 'object' ? arguments[start][key] = {} :  arguments[start][key] = [];
                            }
                            self.extend(true,arguments[start][key],arguments[i][key]);
                        }else{
                            arguments[start][key] = arguments[i][key];
                        }
                    }else{
                        arguments[start][key] = arguments[i][key];
                    }
                }
            }
        }
    }

};
BigEye.prototype.platform = function(){
    return navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i);
};
BigEye.prototype.Tween = (function(){
    return {
        Linear: function(t,b,c,d){ return c*t/d + b; },
        Quad: {
            easeIn: function(t,b,c,d){
                return c*(t/=d)*t + b;
            },
            easeOut: function(t,b,c,d){
                return -c *(t/=d)*(t-2) + b;
            },
            easeInOut: function(t,b,c,d){
                if ((t/=d/2) < 1) return c/2*t*t + b;
                return -c/2 * (( t)*(t-2) - 1) + b;
            }
        },
        Cubic: {
            easeIn: function(t,b,c,d){
                return c*(t/=d)*t*t + b;
            },
            easeOut: function(t,b,c,d){
                return c*((t=t/d-1)*t*t + 1) + b;
            },
            easeInOut: function(t,b,c,d){
                if ((t/=d/2) < 1) return c/2*t*t*t + b;
                return c/2*((t-=2)*t*t + 2) + b;
            }
        },
        Quart: {
            easeIn: function(t,b,c,d){
                return c*(t/=d)*t*t*t + b;
            },
            easeOut: function(t,b,c,d){
                return -c * ((t=t/d-1)*t*t*t - 1) + b;
            },
            easeInOut: function(t,b,c,d){
                if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
                return -c/2 * ((t-=2)*t*t*t - 2) + b;
            }
        },
        Quint: {
            easeIn: function(t,b,c,d){
                return c*(t/=d)*t*t*t*t + b;
            },
            easeOut: function(t,b,c,d){
                return c*((t=t/d-1)*t*t*t*t + 1) + b;
            },
            easeInOut: function(t,b,c,d){
                if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
                return c/2*((t-=2)*t*t*t*t + 2) + b;
            }
        },
        Sine: {
            easeIn: function(t,b,c,d){
                return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
            },
            easeOut: function(t,b,c,d){
                return c * Math.sin(t/d * (Math.PI/2)) + b;
            },
            easeInOut: function(t,b,c,d){
                return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
            }
        },
        Expo: {
            easeIn: function(t,b,c,d){
                return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
            },
            easeOut: function(t,b,c,d){
                return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
            },
            easeInOut: function(t,b,c,d){
                if (t==0) return b;
                if (t==d) return b+c;
                if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
                return c/2 * (-Math.pow(2, -10 *  t) + 2) + b;
            }
        },
        Circ: {
            easeIn: function(t,b,c,d){
                return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
            },
            easeOut: function(t,b,c,d){
                return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
            },
            easeInOut: function(t,b,c,d){
                if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
                return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
            }
        },
        Elastic: {
            easeIn: function(t,b,c,d,a,p){
                if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
                if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
                else var s = p/(2*Math.PI) * Math.asin (c/a);
                return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
            },
            easeOut: function(t,b,c,d,a,p){
                if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
                if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
                else var s = p/(2*Math.PI) * Math.asin (c/a);
                return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b);
            },
            easeInOut: function(t,b,c,d,a,p){
                if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
                if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
                else var s = p/(2*Math.PI) * Math.asin (c/a);
                if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
                return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
            }
        },
        Back: {
            easeIn: function(t,b,c,d,s){
                if (s == undefined) s = 1.70158;
                return c*(t/=d)*t*((s+1)*t - s) + b;
            },
            easeOut: function(t,b,c,d,s){
                if (s == undefined) s = 1.70158;
                return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
            },
            easeInOut: function(t,b,c,d,s){
                if (s == undefined) s = 1.70158;
                if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
                return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
            }
        },
        Bounce: {
            easeIn: function(t,b,c,d){
                return c - Tween.Bounce.easeOut(d-t, 0, c, d) + b;
            },
            easeOut: function(t,b,c,d){
                if ((t/=d) < (1/2.75)) {
                    return c*(7.5625*t*t) + b;
                } else if (t < (2/2.75)) {
                    return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
                } else if (t < (2.5/2.75)) {
                    return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
                } else {
                    return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
                }
            },
            easeInOut: function(t,b,c,d){
                if (t < d/2) return Tween.Bounce.easeIn(t*2, 0, c, d) * .5 + b;
                else return Tween.Bounce.easeOut(t*2-d, 0, c, d) * .5 + c*.5 + b;
            }
        }
    };
})();
