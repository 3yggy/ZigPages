
const ZIGPAGE = "!ZIG:";
const ZIGREL = '!ZreL!';
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
                data = result.join("");
                
                pfxIndex = data.indexOf(',');
                if(pfxIndex!=-1){
                    var prefix = data.substring(0,pfxIndex+1);
                    if(prefix.endsWith(';base64,')){
                        var body = data.substring(pfxIndex+1);
                        var decoded = atob(body);
                        decoded = decoded.replaceAll(ZIGREL,url.protocol+'//'+url.hostname);
                        data=prefix+btoa(decoded);
                        console.log(`transformed into `+data);
                    }
                }

                return {redirectUrl: data};
            }else
                console.log('pathname not found');
        }else
            console.log('hostname not found');
        
        console.log('trying to get rsc '+url.hostname);
        var HighLevelQuery='https://dns.google.com/resolve?name='+url.hostname+'&type=TXT';
        var pending = true;
        var prom = new Promise(function(resolve){
            fetch(HighLevelQuery,{cache: "no-store"})
            .then(r => r.json())
            .then(p => {
                console.log(p);
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
    {   urls: ["*://zigpa.ga/*"],
        types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "other"]}, 
    ['blocking']
    );
