$(function(){
    //use strict
    //var POINT_ICON = "M16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466z M14.757,8h2.42v2.574h-2.42V8z M18.762,23.622H16.1c-1.034,0-1.475-0.44-1.475-1.496v-6.865c0-0.33-0.176-0.484-0.484-0.484h-0.88V12.4h2.662c1.035,0,1.474,0.462,1.474,1.496v6.887c0,0.309,0.176,0.484,0.484,0.484h0.88V23.622z";
    var POINT_ICON = "resources/images/point_icon.png";
    var NOTE_IMG = "resources/images/note-img.png";
    var annotation = function(chartInstance, container){
        return new annotation.fn.init(chartInstance, container);
    };

    annotation.fn = annotation.prototype = {
        constructor: annotation,
        init: function(chartInstance, container){
            this.container = {
                id: $(container).attr("id"),
                width: chartInstance.size().width,
                height: chartInstance.size().height
            };
            return this;
        },
        length: 0,
        push: Array.prototype.push,
        each: Array.prototype.forEach,
        splice: Array.prototype.splice,
        filter: Array.prototype.filter,
        map: Array.prototype.map,
        draw: function(){
            this.each(function(shape){
                shape.draw();
            });
        },
        load: function(jsonStr){
            var json = JSON.parse(jsonStr);
            var instance = this;
            //in case of resize
            var wProportion = instance.container.width/json.container.width,
                hProportion = instance.container.height/json.container.height;
            json.shapes.forEach(function(shape){
                switch(shape.type){
                    case "point":
                        instance.point(shape.x*wProportion,
                            shape.y*hProportion,
                            shape.text);
                        break;
                    case "rect":
                        instance.rect(shape.x1*wProportion, shape.y1*hProportion,
                                shape.x2*wProportion, shape.y2*hProportion, 
                                shape.text,shape.color);
                        break;
                }
            });
        },
        dump: function(){
            return JSON.stringify({
                container: this.container,
                shapes: this.filter(function(s){
                    return !s.removed;
                }).map(function(s){
                    return s.dump();
                })
            });
        },
        clear: function(){
            this.each(function(shape){
                shape.remove();
            });
            this.length=0;
            return this;
        },
        //annotation shapes
        point: function(x,y,text){
            var point = new this.shapes.Point(x, y, text, this);
            this.push(point);
            return point.draw();
        },
        rect: function(x1,y1,x2,y2,text,color){
            var rect = new this.shapes.Rect(x1,y1,x2,y2,text,color,this);
            var element;
            this.push(rect);
            return rect.draw();
        },
        shapes: {
            draggableOptions: function(shape){
                return {
                    distance: 20,
                    containment: "parent",
                    drag: function(){
                        shape.x = parseInt(shape.element.css("left") ,10);
                        shape.y = parseInt(shape.element.css("top") ,10);
                        shape.toggleNote();
                        shape.toggleNote();
                    },
                    stop: function(e){
                        shape.x = parseInt(shape.element.css("left") ,10);
                        shape.y = parseInt(shape.element.css("top") ,10);
                        shape.toggleNote();
                    }
                };
            },
            noteToggler: function(shape, noteOffset){
                var visable = true;
                var NOTE_HTML = '<div style="width:216px;height:120px;background: url('+NOTE_IMG+') no-repeat">'+
                    '</div>',
                DELNOTE_HTML = '<a class="deleteNote" style="border-radius:1px;margin-right:5px;display:inline-block;float:right;cursor:pointer;width:18px;height:18px;background:url('+'resources/images/delete-note.png'+'); "/>',
                PIN_HTML = '<a class="pinNote" style="border-radius:2px;margin-right:5px;display:inline-block;float:right;cursor:pointer;width:18px;height:18px;background:url('+'resources/images/pin-note.png'+'); "/>',
                delNoteBtn = $(DELNOTE_HTML),
                pinNoteBtn = $(PIN_HTML),
                noteHeader = $('<div style="position:relative;top:-16px">').append(delNoteBtn).append(pinNoteBtn),
                note = $(NOTE_HTML)
                    .css("position", "absolute")
                    .css("left",shape.x+noteOffset.x+"px")
                    .css("top",shape.y+noteOffset.y+"px")
                    .css("z-index",99)
                    .append(noteHeader),
                noteContent =  $('<div contenteditable style="height:100px;margin:10px;"></div></div>')
                    .html(shape.text)
                    .on("DOMCharacterDataModified", function(){
                        shape.text = this.innerText;
                    });

                note.append(noteContent);
                delNoteBtn.add(pinNoteBtn).hover(function(){
                    $(this).css("background-color","#bfbfbf");
                },function(){
                    $(this).css("background-color", "transparent");
                });
                delNoteBtn.on("click", function(){
                    $('<div title="Confirm"><p>Delete this Note?</p></div>').dialog({
                        buttons:{
                            OK: function(){
                                note.remove();
                                shape.remove();
                                $(this).dialog('close');
                            }
                        }
                    });
                });
                pinNoteBtn.on("click",function(){
                    shape.togglePin();
                });
                //draw arrow
                var x1 = noteOffset.x>=0?0:-noteOffset.x,
                    y1 = noteOffset.y>=0?0:-noteOffset.y,
                    x2 = noteOffset.x>=0?noteOffset.x-shape.x:0,
                    y2 = noteOffset.y>=0?noteOffset.y-shape.x:0;
                // var arrow = $('<svg><line x1='+x1+' x2='+x2+' y1='+y1+' y2='+y2+' style="stroke:rgb(255,0,0);stroke-width:2"/></svg>')
                //     .css("position","absolute")
                //     .css("width",Math.abs(x2-x1)).css("height",Math.abs(y2-y1))
                //     .css("left",shape.x+(noteOffset.x>=shape.width?shape.width:(noteOffset.x>=0?0:noteOffset.x))+"px")
                //     .css("top",shape.y+(noteOffset.x>=shape.height?shape.height:(noteOffset.y>=0?0:noteOffset.y))+"px")
                //     .css("z-index",98);
                $("#"+shape.ctx.container.id).append(note); 
                // $("#"+shape.ctx.container.id).append(arrow); 

                return function(){
                    note.css("left",shape.x+noteOffset.x+"px")
                        .css("top",shape.y+noteOffset.y+"px");
                    note.toggle();
                    // arrow.toggle();
                };
            },
            Point: (function(){
                function Point(x, y, text, ctx){
                    this.x = x;
                    this.y = y;
                    this.width = 10;
                    this.height = 10;
                    this.ctx = ctx;
                    this.type = "point";
                    this.text = text||"";
                }
                Point.prototype ={
                    draw: function(){
                        //var shape = this;
                        this.toggleNote = this.ctx.shapes.noteToggler(this, {x:this.width,y:this.height});
                        this.draggableOptions = this.ctx.shapes.draggableOptions(this);
                        this.element = $('<img src="'+POINT_ICON+'"/>').css("position","absolute")
                            .css("left",this.x+"px").css("top",this.y+"px")
                            .css("z-index",99)
                            .on("click",this.toggleNote)
                            .draggable(this.draggableOptions);

                        $("#"+this.ctx.container.id)
                            .append(this.element);
                        return this.element;
                    },
                    dump: function(){
                        return {
                            type: "point",
                            x: this.x,
                            y: this.y,
                            text: this.text
                        };
                    },
                    remove: function(){
                        this.removed = true;
                        $(this.element).remove();
                    },
                    togglePin: function(){
                        if(this.element.draggable('option','disabled')){
                            this.element.draggable("enable");
                        }else{
                            this.element.draggable("disable");
                        }
                    }
                };
                return Point;
            }()),
            Rect: (function(){
                function Rect(x1,y1,x2,y2,text,color,ctx){
                    this.x = x1;
                    this.y = y1;
                    this.width = x2 - x1;
                    this.height = y2 - y1;
                    this.ctx = ctx;
                    this.type = "rect";
                    this.text = text||"";
                    this.color = color||"#000";
                }
                Rect.prototype = {
                    draw: function(){
                        //var shape = this;
                        this.toggleNote = this.ctx.shapes.noteToggler(this,{x:this.width,y:this.height});
                        this.draggableOptions = this.ctx.shapes.draggableOptions(this);
                        this.element = $("<div/>")
                            .css("position","absolute")
                            .css("width",this.width).css("height",this.height)
                            .css("z-index",99)
                            .css("left", this.x).css("top", this.y)
                            .css("border","2px solid "+this.color)
                            .on("click", this.toggleNote)
                            .draggable(this.draggableOptions);
                        $("#"+this.ctx.container.id).append(this.element);
                    },
                    dump: function(){
                        return {
                            type: "rect",
                            x1: this.x,
                            y1: this.y,
                            x2: this.x+this.width,
                            y2: this.y+this.height,
                            text: this.text,
                            color: this.color
                        };
                    },
                    remove: function(){
                        this.removed = true;
                        this.element.remove();
                    },
                    togglePin: function(){
                        if(this.element.draggable('option','disabled')){
                            this.element.draggable("enable");
                        }else{
                            this.element.draggable("disable");
                        }
                    }
                };
                return Rect;
            }()),
        },
    };
    annotation.fn.init.prototype = annotation.fn;

    var annotationId = 0;
    function startAnnotation(chartInstance, container){
        var annotation_color="red";
        var containerEl = $(document.getElementById(container));
        var ANNOTATION_PANEL_HTML = '<div style="height:24px;padding:3px 3px 0px 80px;">'+
            '<input type="image" class="selectTool" style="margin-right:5px;" src="resources/images/chose-tools.png"/></div>';
        var TOOLS_PANEL_HTML = '<div style="position:absolute;height:50px;z-index:9999;padding:0px 100px 0px 50px;">'+
            '<div style="position:relative;left:30px;opacity:0.7;width:0px;height:0px;border-style:solid;border-width: 0 10px 10px 10px;border-color: transparent transparent black transparent;"/>'+
            '<div style="height:40px;background-color:black;opacity:0.7;box-shadow:0px 0px 3px black;">'+
            '<div style="padding:10px 20px;"><input id="rectSelection" style="margin-right:20px;" type="image" src="resources/images/rect-tool.png"/>'+
            //'<input id="elipseSelection" style="margin-right:20px;" type="image" src="resources/images/circle-tool.png"/>'+
            '<input id="pointSelection" type="image" src="resources/images/arrow-tool.png"/></div></div></div>';
        containerEl.append($("<div/>",{
            class: "annotation_board",
            style:"position: absolute;opacity:0.7;background-color:black;display:none;",
        }).css("width", containerEl.width())
            .css("height", containerEl.height())
            .css("z-index",9999)
        );
        var annotation_board = containerEl.find(".annotation_board");
        var annotation_panel = $(ANNOTATION_PANEL_HTML).width(containerEl.width());
        var tools_panel = $($(TOOLS_PANEL_HTML).width(annotation_panel.width()).css("display","none"));
        annotation_panel.append($('<div class="colorpicker" style="display:inline-block;cursor:pointer;">'+
            '<a style="display:inline-block;width:16px;height:16px;border:2px solid #333;background-color:black;" value="black"/>'+
            '<a style="display:inline-block;width:16px;height:16px;border:2px solid #333;background-color:red;" value="red"/>'+
            '</div>'));
        annotation_panel.append($('<input type="image" id="save" width="16px" src="resources/images/Save.png" alt="_">'));
        annotation_panel.append($('<input type="image" id="load" width="16px" src="resources/images/open.png" alt="_">'));
        // annotation_panel.append($('<input type="image" id="rectSelection" src="resources/images/rect.png" alt="_">'));
        // annotation_panel.append($('<input type="image" id="pointSelection" src="resources/images/pointer.png" />'));
        annotation_panel.after(tools_panel);
        annotation_panel.find(".colorpicker>a").css("margin","0 5px")
            .on("click",function(){
                annotation_color = $(this).attr("value");
            });
        //containerEl.offsetParent().css("top","30px")
        $(document.getElementById(container)).before(annotation_panel);
        annotation_panel.find("input.selectTool").on("click",function(){
            tools_panel.toggle();
        });

        $("#save").on("click",function(){
            var shapes = anno.dump();
            $('<div title="annotation code" />').html('<textarea style="width:100%;height:100%;">'+shapes+'</textarea>').dialog();
        });
        $("#load").on("click",function(){
            var codeWin = $('<div title="annotation code" contenteditable/>')
                .html("paste code here").dialog({
                    buttons: {
                        OK: function(){
                            anno.clear();
                            anno.load(this.innerText);
                            $( this ).dialog( "close" );
                        }
                    }
                });
            


        });
        $("#pointSelection").on("click",function(){
            startDrawing("point");
            tools_panel.toggle();
        });
        $("#rectSelection").on("click",function(){
            startDrawing("rect");
            tools_panel.toggle();
        });
        window.anno = annotation(chartInstance, document.getElementById(container));
        var drawing = false;
        var tool = "point";
        annotation_board.on("mousedown", addAnnotation);
        //annotation_board.on("mouseup", finishAnnotation)
        function addAnnotation(e){
            switch(tool){
                case "point":
                anno.point(e.pageX-annotation_board.offset().left,e.pageY-annotation_board.offset().top);
                stopDrawing();
                break;
                case "rect":
                addrect(e.pageX-annotation_board.offset().left,e.pageY-annotation_board.offset().top);
                break;
                default:
                alert("unknown tool: "+tool);
            }
        }
        function addrect(x,y){
            var lassoArea = $('<div style="border:1px dotted grey;position:absolute;"/>')
                .css("left",x+"px").css("top",y+"px");
            annotation_board.append(lassoArea);
            function setLassoSize(e){
                lassoArea.width(e.pageX-annotation_board.offset().left-x);
                lassoArea.height(e.pageY-annotation_board.offset().top-y);
            }
            annotation_board.on("mousemove", setLassoSize);
            annotation_board.on("mouseup", function(e){
                annotation_board.off("mousemove", setLassoSize);
                anno.rect(x,y,e.pageX-annotation_board.offset().left,e.pageY-annotation_board.offset().top,"",annotation_color);
                annotation_board.off("mouseup");
                annotation_board.children().remove();
                stopDrawing();
            });
        }
        function startDrawing(selectedTool){
            drawing = true;
            tool = selectedTool;
            annotation_board.show();
            switch(tool){
                case "point":
                annotation_board.css('cursor','url('+POINT_ICON+')');
                break;
                case "rect":
                annotation_board.css('cursor','crosshair');
                break;
            }

        }
        function stopDrawing(){
            drawing = false;
            annotation_board.hide();
        }
        //startDrawing()
        //anno.point(100,100);
        //anno.rect(200,100,300,300)
        //anno.load('{"container":{"id":"chart","width":800,"height":600},"shapes":[{"type":"point","x":100,"y":100,"text":"sadcsdsdc"}]}')
        // anno.draw();
    }
    window.startAnnotation = startAnnotation;
    
});