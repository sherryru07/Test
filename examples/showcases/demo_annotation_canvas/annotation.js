$(document).ready(function(){

    function captureChart(svgEl, paintBoardId){
        //trick to get svg content
        var svgString = $('<div>').append(svgEl.clone()).remove().html();
        canvg(
            document.getElementById(paintBoardId),
             svgString,
             { 
                ignoreMouse: true, 
                ignoreAnimation: false,
             }
        );
    }
    // functions list used to add/remove functions on an event handler
    function FuncChain(funcs){
        this.funcs=funcs||[];
    }   
    FuncChain.prototype.add = function(fnc,args,context){
        var ctx = context;
        this.funcs.push({
            'func': fnc,
            'args': args,
            "context": ctx
        });
    }
    FuncChain.prototype.remove = function(func){
        this.funcs = this.funcs.filter(function(f){
            return f["func"]!==func;
        });
    }
    FuncChain.prototype.execute = function(){
        var i,fl = this.funcs.length;
        for(i=0;i<fl;i++){
            var fncObj = this.funcs[i],
                fnc = fncObj["func"],
                args = fncObj["args"],
                context = fncObj["context"]
            if(context){
                fnc.apply(context,args);
            }else{
                fnc(args);
            }
        }
    }
    //start drawing on svg of id
    var paintBoardNo=0;
    function openPaintBoard(svg){
        var svgEl = $(svg),
            paintBoardId = "drawingArea-" + (paintBoardNo++);
        var paintBoard = $("<canvas/>",{
            "id": paintBoardId,
            "width": svgEl.width(),
            "height": svgEl.height()
        }).css("position","absolute")
          .css("left", svgEl.position().left)
          .css("top", svgEl.position().top);
        // var ctx=paintBoard.get(0).getContext("2d");
        // ctx.fillStyle="#FFFFFF";
        // ctx.fillRect(0,0,paintBoard.width(),paintBoard.height());
        svgEl.after(paintBoard);
        captureChart(svgEl, paintBoardId)
        
        createAnnotation(paintBoardId);
    }
    function createAnnotation(paintBoardId){
        var chart = new Image();
        var container = document.getElementById(paintBoardId);
        chart.src = container.toDataURL();

        var annotation = Sketch.create({
            container: container,

            states: {
                select: "select",
                addPencilLine: "addPencilLine",
                drawPencilLine: "drawPencilLine",
                addNote: "addNote",
            },
            state: "addPencilLine",
            pencilLines:[],
            notes:[],
            //event handlers
            mousemoveHandlers: new FuncChain(),
            mousedownHandlers: new FuncChain(),
            mouseupHandlers: new FuncChain()
            //fullscreen: false
        });
        //shapes

        $("#control_panel>a.button").on("click", function(e){
            //if($(this).attr("tool"))
            annotation.state = $(this).attr("tool")||annotation.state;
        });


        annotation.mousemoveHandlers.add(function(){
            var note, i, nsl=annotation.notes.length, p = annotation.touches[annotation.touches.length-1];
            if(!p)
                return;

            for(i=nsl-1;i>=0;i--){
                note = annotation.notes[i];
                if(note.hitTest(p.x,p.y,"head")){
                    container.style.cursor="move";
                    //mousedownHandlers.add()
                    return;
                }
            }
            container.style.cursor="default";

            switch(annotation.state){
                case annotation.states.addPencilLine:
                    break;
                case annotation.states.drawPencilLine:
                    var i, tl = annotation.touches.length,
                        pencilLine = annotation.pencilLines.pop();
                    if(!pencilLine) return;
                    for(i=0;i<tl;i++){
                        pencilLine.addPoint(annotation.touches[i].x, annotation.touches[i].y);
                    }
                    annotation.pencilLines.push(pencilLine);
                    break;
            }
        });
        annotation.mousedownHandlers.add(function(){
            switch(annotation.state){
                case annotation.states.addPencilLine:
                    annotation.pencilLines.push(new PencilLine());
                    annotation.state = annotation.states.drawPencilLine;
                    break;
                case annotation.states.addNote:
                    var position = annotation.touches[annotation.touches.length-1];
                    if(!position)return;
                    var note = new Note(position.x,position.y,$("#"+paintBoardId).offset().left,$("#"+paintBoardId).offset().top);
                    annotation.notes.push(note);
                    annotation.state = annotation.states.pencil;
                    break;
                case "select":
                    var note, i, nsl=annotation.notes.length, p = annotation.touches[annotation.touches.length-1];
                    if(!p)
                        return;
                    for(i=nsl-1;i>=0;i--){
                        note = annotation.notes[i];
                        if(note.hitTest(p.x,p.y,"head")){
                            //container.style.cursor="move";
                            //mousedownHandlers.add()
                            return;
                        }
                    }
                    break;
            }
            //hit test
            var i, note, nsl = annotation.notes.length,
                p = annotation.touches[annotation.touches.length-1];
            if(!p)
                return;
            for(i=nsl-1;i>=0;i--){
                note = annotation.notes[i];
                if(note.hitTest(p.x,p.y,"textArea")){
                    note.textArea.show();
                    break;
                }
            }
        },[],annotation);
        annotation.mouseupHandlers.add(function(){
            switch(annotation.state){
                case annotation.states.drawPencilLine:
                    annotation.state = annotation.states.addPencilLine;
                    //annotation.mousemoveHandlers.remove(drawPencilLine);
                    break;
                case "addNote":
                    break;
            }
        });
        annotation.setup = function(){
            //keep chart
            // chart = new Image();
            // chart.src = annotation.canvas.toDataURL();
        }
        annotation.update = function(){
            //state.update && state.update();
        }
        annotation.draw = function(){
            annotation.drawImage(chart,0,0);
            var i, pencilLine, note,
                psl = annotation.pencilLines.length,
                nsl = annotation.notes.length;

            //draw pencilLines
            for(i=0;i<psl;i++){
                pencilLine = annotation.pencilLines[i];
                pencilLine.draw(annotation);
            }
            //draw notes
            for (i=0;i<nsl;i++){
                note = annotation.notes[i];
                note.draw(annotation);
            }
        };
        annotation.mousedown = function(){
            this.mousedownHandlers.execute();
        }
        annotation.mouseup = function(){
            this.mouseupHandlers.execute();
        }
        annotation.mousemove = function(){
            this.mousemoveHandlers.execute();
        }
    }
    function PencilLine(points,color,lineWidth){
        this.points = points||[]
        this.color = color||"#000";
        this.lineWidth = lineWidth||5;
    }
    PencilLine.prototype = {
        addPoint: function(x,y){
            this.points.push({'x':x,'y':y});
        },
        move: function(dx,dy){
            this.points = this.points.map(function(p){
                return {
                    x:p.x+dx,
                    y:p.y+dy
                }
            });
        },
        draw: function(ctx){
            var i,p,points = this.points, psl = points.length;
            if(psl===0)
                return;
            ctx.beginPath();
            startp = points[0];
            for(i=1;i<psl;i++){
                p=points[i];
                ctx.moveTo(startp.x, startp.y);
                ctx.lineTo(p.x,p.y);
                startp = p;
            }
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.lineWidth;
            ctx.stroke();
        }
    };
    //basex ,basey is the offset of container
    function Note(x,y,basex,basey){
        this.x = x||0;
        this.y = y||0;
        this.pinned = false;
        this.editing = false;
        this.display = true;
        this.width = 178;
        this.height = 193;
        this.text = [];
        this.noteImage = new Image();
        this.noteImage.src="resources/images/note.png";
        this.noteImage.style.opacity=0.8;
        var textArea = $("<textarea/>", {
            //display: "block",
            cols: 16,
            rows: 8
        }).css("position", "absolute")
          .css("float","left")
          .css("left",this.x+12+basex)
          .css("top",this.y+30+basey);
        this.textArea = textArea;
        var context = this;
        textArea.on("mouseout", function(){
            $(this).hide();
            context.text = textArea.attr("value")
                .split("") 
                .map(function(c,i){
                    if(i%16==0)
                        return "\n"+c;
                    else
                        return c;
                }).join("").split("\n");
        });
        $("body").after(textArea);

    }
    Note.prototype = {
        toggleDisplay: function(){
            this.display = !this.display;
        },
        togglePin: function(){
            this.pinned = !this.pinned;
        },
        move: function(x,y){
            this.x = x;
            this.y = y;
        },
        edit: function(){
            this.editing = true;
        },
        draw: function(ctx){
            ctx.font = "16px Arial"
            ctx.drawImage(this.noteImage, this.x,this.y);
            var i, t, tl=Math.min(this.text.length,13);
            for(i=0;i<tl;i++){
                ctx.fillText(this.text[i], this.x+18, this.y+40+ i*16);
            }
        },
        hitTest: function(x,y,component){
            var lbound,rbound,ubound,bbound;
            switch(component){
                case "textArea":
                    lbound = this.x+20, rbound = this.x+this.width-20,
                    ubound = this.y+40, bbound = this.y+this.height-20;
                    break;
                case "head":
                    lbound = this.x, rbound = this.x+this.width;
                    ubound = this.y, bbound = this.y+30;
                    break;
                default:    
                    lbound = this.x, rbound = this.x+this.width,
                    ubound = this.y, bbound = this.y+this.height;
                    break;
            }
            return (x>lbound && x<rbound && y>ubound && y<bbound)
        }
    }


    

    $("#start").on("click",function(){
        openPaintBoard("svg:first")
        //$('#drawingArea').sketch();


        
    });


    /*$(window).keypress(function(e){
        if(e.which==97){
            $("#start").click();
        }
    })*/
});