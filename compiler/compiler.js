window.onload=function(){
    fileInput.onchange = function(){
        for(let file of this.files){
            if(file){
                console.log(file);
                let reader = new FileReader();
                var process = function(c){
                    var e = document.createElement('div');
                    e.appendChild(document.createElement('hr'));
                    var x = document.createElement('label');
                    x.innerText = '[X] ';
                    x.onclick=function(){
                        outputs.removeChild(e);
                    }
                    e.appendChild(x);
                    var name = document.createElement('label');
                    name.innerText = file.name;
                    e.appendChild(name);
                    e.appendChild(document.createElement('br'));
                    var head = "!ZIG:"+file.name+".";
                    var chunkStep = 248-head.length;
                    console.log(c,head.length,chunkStep);
                    var chunks = c.match(new RegExp('[\\s\\S]{1,' + chunkStep + '}', 'g'));
                    console.log(chunks);
                    for(i=0;i<chunks.length;i++){
                        var entry = document.createElement('textarea');
                        entry.value=head+i+'='+chunks[i];
                        entry.style['max-width']='100hx';
                        entry.style['width']='100hx';
                        entry.style.left=0;
                        entry.style.right=0;
                        entry.style.position='relative'
                        e.appendChild(entry);
                    }
                    outputs.appendChild(e);  
                }
                if(file.type.startsWith('text')){
                    reader.onload = function() {
                        var string="data:"+file.type+","+this.result
                        if(!window.preserve)
                            string = string.replace(/[\r\n]+/g," ").replace(/\s+/g, ' ').trim();
                        process(string);
                    }
                    reader.readAsText(file);
                }else{
                    reader.onload = function() {
                        process(this.result);
                    }
                    reader.readAsDataURL(file);
                }
            }
        }
        this.value="";
    }
}