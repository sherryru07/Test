sap.riv.module(
{
  qname : 'sap.viz.lang.langManager',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.ObjectUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.Locale',
  version : '4.0.0'
}
],
function Setup(FunctionUtils, ObjectUtils, TypeUtils, Locale) {

  function loadResource(url,  cb, onError) {
    var head = document.getElementsByTagName("head")[0]
        || document.documentElement;
    var script = document.createElement("script");
    script.type = 'text/javascript';
    script.src = url;

    var done = false;
    script.onload = script.onreadystatechange = function() {
      if (!done
          && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
        done = true;
        script.onload = script.onreadystatechange = null;
        if (head && script.parentNode) {
          head.removeChild(script);
        }
        cb();
      }
    };
    if (script.addEventListener) {
      script.addEventListener('error', function() {
        //clear script
        script.onload = script.onreadystatechange = null;
        script.parentNode.removeChild(script);
        //call error callback
        onError();
      }, true);
    }

    head.insertBefore(script, head.firstChild);
  }
  
  function loadResources(loadPath, index, id, cb, onError ){
    if(index < loadPath.length){
      var url = loadPath[index] + 'language_' + id + '.js';
      var done = function(){
        loadResources(loadPath, index+1, id, cb, onError);
      };
      loadResource(url, done, done);
    }else{
      var c_language = get(id);
      if(c_language){ cb(c_language);}
      else onError();
    }
  }
  function initialLanguageMap(){
	  	
	  	var map = d3.map();
	  	//3 for ar
	  	map.set("ar_AE","ar");
	  	map.set("ar_EG","ar");
	  	map.set("ar_SA","ar");
	  	//1 for bg
	  	map.set("bg_BG","bg");
	  	//1 for ca
	  	map.set("ca_ES","ca");
	  	//1 for cs
	  	map.set("cs_CZ","cs");
	  	//1 for da
	  	map.set("da_DK","da");
	  	//5 for de
	  	map.set("de_CH","de");
	  	map.set("de_AT","de");
	  	map.set("de_BE","de");
	  	map.set("de_LU","de");
	  	map.set("de_DE","de");
	  	//2 for el
	  	map.set("el_CY","el");
	  	map.set("el_GR","el");
	  	//14 for en
	  	map.set("en_AU","en");
	  	map.set("en_CA","en");
	  	map.set("en_GB","en");
	  	map.set("en_HK","en");
	  	map.set("en_ID","en");
	  	map.set("en_IE","en");
	  	map.set("en_IN","en");
	  	map.set("en_IS","en");
	  	map.set("en_MY","en");
	  	map.set("en_NZ","en");
	  	map.set("en_PH","en");
	  	map.set("en_SG","en");
	  	map.set("en_US","en");
	  	map.set("en_ZA","en");
	  	//9 for es
	  	map.set("es_AR","es");
	  	map.set("es_BO","es");
	  	map.set("es_CL","es");
	  	map.set("es_CO","es");
	  	map.set("es_ES","es");
	  	map.set("es_MX","es");
	  	map.set("es_PE","es");
	  	map.set("es_UY","es");
	  	map.set("es_VE","es");
	  	//1 for et
	  	map.set("et_EE","et");
	  	//1 for fa
	  	map.set("fa_IR","fa");
	  	//1 for fi
		map.set("fi_FI","fi");
		//5 for fr
		map.set("fr_BE","fr");
		map.set("fr_CA","fr");
		map.set("fr_CH","fr");
		map.set("fr_FR","fr");
		map.set("fr_LU","fr");
		//1 for iw
		map.set("he_IL","iw");
		//1for hr
		map.set("hr_HR","hr");
		//1 for hu
		map.set("hu_HU","hu");
		//2 for it
		map.set("it_CH","it");
	  	map.set("it_IT","it");
	  	//1 for ja
		map.set("ja_JP","ja");
		//1 for ko
		map.set("ko_KR","ko");
		//1 for lt
		map.set("lt_LT","lt");
		//1 for lv
		map.set("lv_LV","lv");
		//2 for nl
		map.set("nl_BE","nl");
	  	map.set("nl_NL","nl");
	  	//1 for no
	  	map.set("nn_NO","no");
	  	//1 for pl
	  	map.set("pl_PL","pl");
	  	//2 for pt
	  	map.set("pt_BR","pt");
	  	map.set("pt_PT","pt");
	  	//1 for ro
	  	map.set("ro_RO","ro");
	  	//3 for ru
	  	map.set("ru_KZ","ru");
	  	map.set("ru_RU","ru");
	  	map.set("ru_UA","ru");
	  	//2 for sr
	  	map.set("sh_ME","sr");
	  	map.set("sh_RS","sr");
	  	//1 for sk
	  	map.set("sk_SK","sk");
	  	//1 for sl
	  	map.set("sl_SL","sl");
	  	//1 for sv
	  	map.set("sv_SE","sv");
	  	//1 for th 
	  	map.set("th_TH","th");
	  	//1 for tk
	  	map.set("tr_CY","tk");
	  	map.set("tr_TR","tk");
	  	//1 for uk
	  	map.set("uk_UA","uk");
	  	//1 for vi
	  	map.set("vi_VI","vi");
	  	//1 for zh_TW
	  	map.set("zf_TW","zh_TW");
	  	//2 for zh_Cn
	  	map.set("zh_CN","zh_CN");
	  	map.set("zh_HK","zh_CN");

	  	//
	  	map.set("ar","ar");
	  	map.set("bg","bg");
	  	map.set("ca","ca");
	  	map.set("cs","cs");
	  	map.set("da","da");
	  	map.set("de","de");
	  	map.set("el","el");
	  	map.set("en","en");
	  	map.set("es","es");
	  	map.set("et","et");
	  	map.set("fi","fi");
	  	map.set("fr","fr");
	  	map.set("iw","iw");
	  	map.set("hr","hr");
	  	map.set("hu","hu");
	  	map.set("it","it");
	  	map.set("ja","ja");
	  	map.set("ko","ko");
	  	map.set("lt","lt");
	  	map.set("lv","lv");
	  	map.set("nl","nl");
	  	map.set("no","no");
	  	map.set("pl","pl");
	  	map.set("pt","pt");
	  	map.set("ro","ro");
	  	map.set("ru","ru");
	  	map.set("sr","sr");
	  	map.set("sk","sk");
	  	map.set("sl","sl");
	  	map.set("sv","sv");
	  	map.set("th","th");
	  	map.set("tk","tk");
		map.set("uk","uk");
		map.set("vi","vi");
		map.set("zh_TW","zh_TW");
		//
	  	return map;
	     
  }
  var listeners = [];
  var languageMap = initialLanguageMap();
  
  function onLocaleChanged(cb) {
    listeners.forEach(function(listener) {
      listener.fn.apply(listener.scope, [ currentLanguage ]);
    });
    
    if(cb) cb();
  }
  
  function get(id){
    return languageSetting[id];
  }
  
  var languageSetting = {};
  

  var currentLanguage = languageSetting['dev'] = {IDS_DEFAULTMND:'All Measures',IDS_DEFAULTCHARTTITLE:'Title of Chart',IDS_ISNOVALUE:'No value',IDS_BARCHART:'Bar Chart',IDS_COMBINATIONCHART:'Combined Column Line Chart',IDS_DUALBARCHART:'Bar Chart with 2 X-Axes',IDS_DUALCOMBINATIONCHART:'Combined Column Line Chart with 2 Y-Axes',IDS_DUALHORIZONTALCOMBINATIONCHART:'Combined Bar Line Chart with 2 X-Axes',IDS_DUALHORIZONTALLINECHART:'Horizontal Line Chart with 2 X-Axes',IDS_DIUALLINECHART:'Line Chart with 2 Y-Axes',IDS_DUALPERCENTAGESTACKEDBARCHART:'100% Stacked Bar Chart with 2 X-Axes',IDS_DUALSTACKEDVERTICALBARCHART:'Stacked Column Chart with 2 Y-Axes',IDS_DUALPERCENTAGESTACKEDVERTICALBARCHART:'100% Stacked Column Chart with 2 Y-Axes',IDS_DUALSTACKEDBARCHART:'Stacked Bar Chart with 2 X-Axes',IDS_DUALVERTICALBARCHART:'Column Chart with 2 Y-Axes',IDS_HORIZONTALBOXPLOTCHART:'Horizontal Box Plot',IDS_HORIZONTALCOMBINATIONCHART:'Combined Bar Line Chart',IDS_HORIZONTALLINECHART:'Horizontal Line Chart',IDS_HORIZONTALWATERFALLCHART:'Horizontal Waterfall Chart',IDS_LINECHART:'Line Chart',IDS_PERCENTAGESTACKEDBARCHART:'100% Stacked Bar Chart',IDS_PERCENTAGESTACKEDVERTICALBARCHART:'100% Stacked Column Chart',IDS_SPARKLINECHART:'Spark Line Chart (POC)',IDS_STACKEDBARCHART:'Stacked Bar Chart',IDS_STACKEDVERTICALBARCHART:'Stacked Column Chart',IDS_VARIANTBARCHART:'Variant Bar Chart (POC)',IDS_VERTICALBARCHART:'Column Chart',IDS_VERTICALBOXPLOTCHART:'Box Plot',IDS_WATERFALLCHART:'Waterfall Chart',IDS_DONUTCHART:'Donut Chart',IDS_PIECHART:'Pie Chart',IDS_BASEBUBBLECHART:'Base Scatter Chart',IDS_BUBBLECHART:'Bubble Chart',IDS_SCATTERCHART:'Scatter Plot',IDS_BASECHART:'Base Chart',IDS_BASEHORIZONTALCHART:'Base horizontal XY Chart',IDS_BASEVERTICALCHART:'Base Vertical XY Chart',IDS_BASEMULTIPLECHART:'Base Multiple Chart',IDS_BASEMULTIPLEXYCHART:'Base Multiple XY Chart',IDS_BASESINGLECHART:'Base Single Chart',IDS_HEATMAPCHART:'Heat Map',IDS_TREEMAPCHART:'Tree Map',IDS_MULTIBARCHART:'Multiple Bar Chart',IDS_MULTIBUBBLECHART:'Multiple Bubble Chart',IDS_MULTIDONUTCHART:'Multiple Donut Chart',IDS_MULTIDUALBARCHART:'Multiple Bar Chart with 2 X-Axes',IDS_MULTIDUALHORIZONTALLINECHART:'Multiple Horizontal Line Chart with 2 X-Axes',IDS_MULTIDUALLINECHART:'Multiple Line Chart with 2 Y-Axes',IDS_MULTIDUALPERCENTAGESTACKEDBARCHART:'Multiple 100% Stacked Bar Chart with 2 X-Axes',IDS_MULTIDUALPERCENTAGESTACKEDVERTICALBARCHART:'Multiple 100% Stacked Column Chart with 2 Y-Axes',IDS_MULTIDUALSTACKEDBARCHART:'Multiple Stacked Bar Chart with 2 X-Axes',IDS_MULTIDUALSTACKEDVERTICALBARCHART:'Multiple Stacked Column Chart with 2 Y-Axes',IDS_MULTIDUALVERTICALBARCHART:'Multiple Column Chart with 2 Y-Axes',IDS_MULTIHORIZONTALLINECHART:'Multiple Horizontal Line Chart',IDS_MULTILINECHART:'Multiple Line Chart',IDS_MULTIPERCENTAGESTACKEDBARCHART:'Multiple 100% Stacked Bar Chart',IDS_MULTIPERCENTAGESTACKEDVERTICALBARCHART:'Multiple 100% Stacked Column Chart',IDS_MULTIPIECHART:'Multiple Pie Chart',IDS_MULTISCATTERCHART:'Multiple Scatter Plot',IDS_MULTISTACKEDBARCHART:'Multiple Stacked Bar Chart',IDS_MULTISTACKEDVERTICALBARCHART:'Multiple Stacked Column Chart',IDS_MULTIVERTICALBARCHART:'Multiple Column Chart',IDS_MULTIRADARCHART:'Multiple Radar Chart',IDS_RADARCHART:'Radar Chart',IDS_SCATTERMATRIXCHART:'Scatter Matrix Chart',IDS_TAGCLOUDCHART:'Tag Cloud',IDS_TREEMAPCHART:'Tree Map',IDS_GEOBUBBLE:'Geo Bubble Chart',IDS_GEOPIE:'Geo Pie Chart',IDS_CHOROPLETH:'Geo Choropleth Chart',IDS_MULTIGEOBUBBLE:'Multiple Geo Bubble Chart',IDS_MULTICHOROPLETH:'Multiple Geo Choropleth Chart',IDS_REGIONCOLOR:'Region Color',IDS_PRIMARYVALUES:'Primary Values',IDS_SECONDARYVALUES:'Secondary Values',IDS_AXISLABELS:'Axis Labels',IDS_RECTANGLETITLE:'Rectangle Title',IDS_RECTANGLEWEIGHT:'Rectangle Weight',IDS_RECTANGLECOLOR:'Rectangle Color',IDS_TAGNAME:'Tag Name',IDS_TAGWEIGHT:'Tags Weight',IDS_TAGFAMILY:'Tags Family',IDS_CATEGORYAXIS:'Axis Labels Category',IDS_REGIONSHAPE:'Region Shape',IDS_BUBBLEWIDTH:'Bubble Width',IDS_BUBBLEHEIGHT:'Bubble Height',IDS_RADARAXES:'Radar Axes',  IDS_RADARAXESVALUE:'Radar Axes Values',IDS_PIESECTORCOLORNAME:'Sector Color',IDS_PIESECTORSIZE:'Sector Size',IDS_MAINLABELAXISNAME:'Main Category Axis',IDS_SECONDARYAXISLABELNAME:'Secondary Category Axis',IDS_SELECTABILITY:'selectability',IDS_PRIMARYVALUECOLORPALETTE:'primaryValuesColorPalette',IDS_SECONDARYVALUESCOLORPALETTE:'secondaryValuesColorPalette',IDS_DRAWINGEFFECT:'drawingEffect',IDS_TOOLTIPVISIBLE:'tooltipVisible',IDS_ENABLEROUNDCORNER:'enableRoundCorner',IDS_ANIMATION:'animation',IDS_DATALOADING:'dataLoading',IDS_DATAUPDATING:'dataUpdating',IDS_BAR:'bar',IDS_LINE:'line',IDS_WIDTH:'width',IDS_HOVERLINEVISIBLE:'hoverlineVisible',IDS_MARKER:'marker',IDS_VISIBLE:'visible',IDS_SHAPE:'shape',IDS_SIZE:'size',IDS_HEADERVISIBLE:'headerVisible',IDS_AXISVISIBLE:'axisVisible',IDS_GRIDVISIBLE:'gridVisible',IDS_COLUMNSEQUENCE:'columnSequence',IDS_COLUMNCONFIG:'columnConfig',IDS_STARTCOLUMN:'startColumn',IDS_LABEL:'label',IDS_VALUEFORMAT:'valueFormat',IDS_ENDCOLUMN:'endColumn',IDS_HIGHCOLUMN:'highColumn',IDS_LOWCOLUMN:'lowColumn',IDS_LINECONFIG:'lineConfig',IDS_MARKERS:'markers',IDS_FILLVISIBLE:'fillVisible',IDS_REFINEVISIBLE:'reflineVisible',IDS_MODE:'mode',IDS_TITLE:'title',IDS_TEXT:'text',IDS_GRIDLINE:'gridline',IDS_SHOWFIRSTLINE:'showFirstLine',IDS_TYPE:'type',IDS_FORMAT:'format',IDS_POSITION:'position',IDS_BORDER:'border',IDS_STARTCOLOR:'startcolor',IDS_ENDCOLOR:'endcolor',
      IDS_MEKKOCHART:'Mekko Chart', IDS_HORIZONTALMEKKOCHART: 'Horizontal Mekko Chart', IDS_PERCENTAGEMEKKOCHART: '100% Mekko Chart', IDS_PERCENTAGEHORIZONTALMEKKOCHART: '100% Horizontal Mekko Chart', 
      IDS_AREACHART:'Area Chart', IDS_PERCENTAGEAREACHART: '100% Area Chart', IDS_HORIZONTALAREACHART:'Horizontal Area Chart', IDS_PERCENTAGEHORIZONTALAREACHART: '100% Horizontal Area Chart', IDS_MULTIAREACHART:'Multi Area Chart', IDS_MULTIHORIZONTALAREACHART:'Multi Horizontal Area Chart', IDS_MULTIPERCENTAGEAREACHART:'Multi 100% Area Chart', IDS_MULTIPERCENTAGEHORIZONTALAREACHART:'Multi 100% Horizontal Area Chart',IDS_HORIZONTALSTACKEDWATERFALL:'Horizontal Stacked Waterfall Chart', IDS_STACKEDWATERFALLCHART: 'Stacked Waterfall Chart'};
  var currentId = 'dev', defaultLanguage = 'en';
  var manager = 
    /** @lends sap.viz.lang.langManager */
  {    /**
       * @constructs
       */
      constructor : function(){
        return;
      },
      /**
       * The file paths of language folder. 
       * 
       * @default ["../../../resources/langs/"]
       */
      loadPath : ["../../../resources/langs/"],
       /**
       * Return current applied language Id.
       * 
       * @returns {String}
       */
      current : function() {
          return currentId;
      },
      
      /**
       * Register new language.
       * 
       * @param {Object...}
       * 
       * @returns {Object} {@link sap.viz.lang.langManager}
       */
      register : function(obj) {
            currentId = obj.id;
          currentLanguage = languageSetting[obj.id] = ObjectUtils.extend(true, languageSetting[obj.id], obj.value);
          return manager;
      },
      
       /**
       * Apply(switch) language.
       * 
       * @param {String}
       *          id the language id
       * @param {Function}
       *          [cb] the call back function. It will be executed after language
       *          is applied successfully with current language as parameter. *
       * 
       * @returns {Object} {@link sap.viz.lang.langManager}
       */
      apply : function(id, callback) {
        if(id){
          id = languageMap.get(id);
          loadResources(manager.loadPath, 0, id, function(){
            onLocaleChanged(callback);
          }, function(){
            loadResources(manager.loadPath, 0, defaultLanguage, function(){
              onLocaleChanged(callback);
              FunctionUtils.error('Loading language {0} failed.', id);
            }, function(){
               currentId = 'dev', currentLanguage = languageSetting['dev'];
               onLocaleChanged(callback);
               FunctionUtils.error('Loading language {0}, {1} failed.', id, defaultLanguage);
            });
            
          });
        }
         return manager;
      },
      
      /**
       * Get globalization value.
       * 
       * @param {String} 
       *       id of labels
       * 
       * @returns {String}  globalization value
       */
      get: function(ids){
        if(currentLanguage[ids])
          return currentLanguage[ids];
        return languageSetting['dev'][ids];
      },
      
      /**
       * Add a listener which will be executed when current language is changed.
       * 
       * @param {Object}
       *          listener
       * @param {Function}
       *          listener.fn the listener function
       * @param {Object}
       *          listener.scope the "this" object in the listener function
       * 
       * @returns {Object} {@link sap.viz.lang.langManager}
       */
      addListener : function(listener) {
          listeners.push(listener);
          return manager;
       },
       
       /**
       * Remove the listener.
       * 
       * @param {Object} listener
       *          the listener reference
       * 
       * @returns {Object} {@link sap.viz.lang.langManager}
       */
      removeListener : function(listener) {
        var index = listeners.indexOf(listener);
        if (index != -1)
          listeners.splice(index, 1);
        return manager;
      }
  };
  
  Locale.addListener({
	  fn:function(locale, callback){
		  manager.apply(locale, callback);
	  },
	  scope:manager
  });
  return manager;
});