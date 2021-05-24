
const ZIGPAGE = "!ZIG:";
var TXTCache={};

/* hostname
*\   |
/*   {identafier} ...
*\      |  |  |
/* part 1  2  3 ...
*/

chrome.webRequest.onBeforeRequest.addListener( 
    function(details) {
        console.log(details);
        url = new URL(details.url);
        if(url.hostname in TXTCache){
            var result;
            var identafier = url.pathname;
            if(!identafier.endsWith('/'))
                identafier+='/';
            if(!identafier.startsWith('/'))
                identafier='/'+identafier;
            result = TXTCache[url.hostname][identafier];
            if(result){
                console.log('pulling from cache: '+result);
                return {redirectUrl: result.join("")};
            }else
                console.log('pathname not found');
        }else
            console.log('hostname not found');
        
        console.log('trying to get rsc '+url.hostname);
        var HighLevelQuery='https://dns.google.com/resolve?name='+url.hostname+'&type=TXT';
        var pending = true;
        var prom = new Promise(function(resolve){
            fetch(HighLevelQuery)
            .then(r => r.json())
            .then(p => {
                var Entries = {}
                p.Answer.forEach(function(t){
                    var resource = t.data;
                    if(resource.startsWith(ZIGPAGE)){
                        console.log(resource);
                        var divIndex = resource.indexOf('=',ZIGPAGE.length);
                        if(divIndex!=-1){
                            var head = resource.substring(ZIGPAGE.length,divIndex);
                            var numIndex = head.lastIndexOf('.');
                            if(divIndex!=-1){
                                var num = head.substring(numIndex+1);
                                var identafier = head.substring(0,numIndex);
                                if(!identafier.endsWith('/'))
                                    identafier+='/';
                                if(!identafier.startsWith('/'))
                                    identafier='/'+identafier;
                                var data = resource.substring(divIndex+1);
                                console.log({identafier});
                                console.log({num});
                                console.log({data});
                                if(!(identafier in Entries))
                                    Entries[identafier]=[];
                                Entries[identafier][num]=data;
                            }
                        }
                    }
                });
                console.log(Entries);
                TXTCache[url.hostname]=Entries;
            });
        });
        return {redirectUrl: 'data:text/html,<meta http-equiv="refresh" content="1; URL='+url.href+'" /><title>'+url.hostname+'</title> TRYING...'};    
    }, 
    {   urls: ["*://ziggy.cf/*"],
        types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "other"]}, 
    ['blocking']
    );
