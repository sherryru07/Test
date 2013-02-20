sap.riv.module(
{
  qname : 'sap.viz.mvc.CSSParser',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.mvc.CSSParserUtility',
  version : '4.0.0'
}
],
function Setup(CSSParserUtility) {
	
	/*######################### ThemeGrammarGenerated Begin*/
				/* Jison generated parser */
				var parser = (function(){
				var parser = {trace: function trace() { },
				yy: {},
				symbols_: {"error":2,"theme":3,"ruleset":4,"rule":5,"selector_list":6,"{":7,"declaration_list":8,"}":9,"selector":10,",":11,"class":12,".":13,"IDENT":14,"declaration":15,";":16,"property":17,":":18,"expr":19,"prio":20,"IMPORTANT_SYM":21,"term":22,"operator":23,"/":24,"signed_term":25,"STRING":26,"URI":27,"HASH":28,"function":29,"NUMBER":30,"PERCENTAGE":31,"LENGTH":32,"EMS":33,"EXS":34,"ANGLE":35,"TIME":36,"FREQ":37,"unary_operator":38,"FUNCTION":39,")":40,"-":41,"+":42,"$accept":0,"$end":1},
				terminals_: {2:"error",7:"{",9:"}",11:",",13:".",14:"IDENT",16:";",18:":",21:"IMPORTANT_SYM",24:"/",26:"STRING",27:"URI",28:"HASH",30:"NUMBER",31:"PERCENTAGE",32:"LENGTH",33:"EMS",34:"EXS",35:"ANGLE",36:"TIME",37:"FREQ",39:"FUNCTION",40:")",41:"-",42:"+"},
				productions_: [0,[3,1],[4,1],[4,2],[5,4],[6,1],[6,3],[10,1],[10,2],[12,2],[8,1],[8,3],[8,2],[15,3],[15,2],[17,1],[20,1],[19,1],[19,2],[19,3],[23,1],[23,1],[22,1],[22,1],[22,1],[22,1],[22,1],[22,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,2],[29,3],[38,1],[38,1]],
				performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {
				
				var $0 = $$.length - 1;
				switch (yystate) {
				case 1: return $$[$0];
				case 2: this.$ = [$$[$0]];
				break;
				case 3: this.$ = $$[$0-1]; this.$.push($$[$0]);
				break;
				case 4: this.$ = {selector: $$[$0-3], declaration: $$[$0-1]};
				break;
				case 5: this.$ = [$$[$0]];
				break;
				case 6: this.$ = $$[$0-2]; this.$.push($$[$0]);
				break;
				case 7: this.$ = $$[$0];
				break;
				case 8: this.$ = $$[$0-1] + $$[$0];
				break;
				case 9: this.$ = $$[$0-1] + $$[$0];
				break;
				case 10: this.$ = [$$[$0]];
				break;
				case 11:
					this.$ = $$[$0-2];
					this.$.push($$[$0]);
				break;
				case 12: this.$ = $$[$0-1];
				break;
				case 13: this.$ = { name: $$[$0-2], value: $$[$0] };
				break;
				case 14: this.$ = $$[$0-1]; this.$.important = true;
				break;
				case 18: this.$ = $$[$0-1] + ' ' + $$[$0];
				break;
				case 19: this.$ = $$[$0-2] + $$[$0-1] + $$[$0];
				break;
				case 36: this.$ = $$[$0-1] + $$[$0];
				break;
				case 37: this.$ = $$[$0-2] + $$[$0-1] + $$[$0];
				break;
				}
				},
				table: [{3:1,4:2,5:3,6:4,10:5,12:6,13:[1,7]},{1:[3]},{5:8,6:4,10:5,12:6,13:[1,7],1:[2,1]},{1:[2,2],13:[2,2]},{7:[1,9],11:[1,10]},{12:11,13:[1,7],7:[2,5],11:[2,5]},{7:[2,7],13:[2,7],11:[2,7]},{14:[1,12]},{1:[2,3],13:[2,3]},{8:13,15:14,17:15,14:[1,16]},{10:17,12:6,13:[1,7]},{7:[2,8],13:[2,8],11:[2,8]},{7:[2,9],11:[2,9],13:[2,9]},{9:[1,18],16:[1,19]},{20:20,21:[1,21],9:[2,10],16:[2,10]},{18:[1,22]},{18:[2,15]},{12:11,13:[1,7],7:[2,6],11:[2,6]},{1:[2,4],13:[2,4]},{15:23,17:15,14:[1,16],9:[2,12],16:[2,12]},{9:[2,14],21:[2,14],16:[2,14]},{21:[2,16],9:[2,16],16:[2,16]},{19:24,22:25,25:26,26:[1,27],14:[1,28],27:[1,29],28:[1,30],29:31,30:[1,32],31:[1,33],32:[1,34],33:[1,35],34:[1,36],35:[1,37],36:[1,38],37:[1,39],38:40,39:[1,41],41:[1,42],42:[1,43]},{20:20,21:[1,21],9:[2,11],16:[2,11]},{22:44,23:45,25:26,26:[1,27],14:[1,28],27:[1,29],28:[1,30],29:31,24:[1,46],11:[1,47],30:[1,32],31:[1,33],32:[1,34],33:[1,35],34:[1,36],35:[1,37],36:[1,38],37:[1,39],38:40,39:[1,41],41:[1,42],42:[1,43],9:[2,13],21:[2,13],16:[2,13]},{9:[2,17],16:[2,17],30:[2,17],31:[2,17],32:[2,17],33:[2,17],34:[2,17],35:[2,17],36:[2,17],37:[2,17],41:[2,17],42:[2,17],26:[2,17],14:[2,17],27:[2,17],28:[2,17],39:[2,17],24:[2,17],11:[2,17],21:[2,17],40:[2,17]},{16:[2,22],9:[2,22],21:[2,22],11:[2,22],24:[2,22],39:[2,22],28:[2,22],27:[2,22],14:[2,22],26:[2,22],42:[2,22],41:[2,22],37:[2,22],36:[2,22],35:[2,22],34:[2,22],33:[2,22],32:[2,22],31:[2,22],30:[2,22],40:[2,22]},{16:[2,23],9:[2,23],21:[2,23],11:[2,23],24:[2,23],39:[2,23],28:[2,23],27:[2,23],14:[2,23],26:[2,23],42:[2,23],41:[2,23],37:[2,23],36:[2,23],35:[2,23],34:[2,23],33:[2,23],32:[2,23],31:[2,23],30:[2,23],40:[2,23]},{16:[2,24],9:[2,24],21:[2,24],11:[2,24],24:[2,24],39:[2,24],28:[2,24],27:[2,24],14:[2,24],26:[2,24],42:[2,24],41:[2,24],37:[2,24],36:[2,24],35:[2,24],34:[2,24],33:[2,24],32:[2,24],31:[2,24],30:[2,24],40:[2,24]},{16:[2,25],9:[2,25],21:[2,25],11:[2,25],24:[2,25],39:[2,25],28:[2,25],27:[2,25],14:[2,25],26:[2,25],42:[2,25],41:[2,25],37:[2,25],36:[2,25],35:[2,25],34:[2,25],33:[2,25],32:[2,25],31:[2,25],30:[2,25],40:[2,25]},{16:[2,26],9:[2,26],21:[2,26],11:[2,26],24:[2,26],39:[2,26],28:[2,26],27:[2,26],14:[2,26],26:[2,26],42:[2,26],41:[2,26],37:[2,26],36:[2,26],35:[2,26],34:[2,26],33:[2,26],32:[2,26],31:[2,26],30:[2,26],40:[2,26]},{16:[2,27],9:[2,27],21:[2,27],11:[2,27],24:[2,27],39:[2,27],28:[2,27],27:[2,27],14:[2,27],26:[2,27],42:[2,27],41:[2,27],37:[2,27],36:[2,27],35:[2,27],34:[2,27],33:[2,27],32:[2,27],31:[2,27],30:[2,27],40:[2,27]},{9:[2,28],16:[2,28],30:[2,28],31:[2,28],32:[2,28],33:[2,28],34:[2,28],35:[2,28],36:[2,28],37:[2,28],41:[2,28],42:[2,28],26:[2,28],14:[2,28],27:[2,28],28:[2,28],39:[2,28],24:[2,28],11:[2,28],21:[2,28],40:[2,28]},{9:[2,29],16:[2,29],30:[2,29],31:[2,29],32:[2,29],33:[2,29],34:[2,29],35:[2,29],36:[2,29],37:[2,29],41:[2,29],42:[2,29],26:[2,29],14:[2,29],27:[2,29],28:[2,29],39:[2,29],24:[2,29],11:[2,29],21:[2,29],40:[2,29]},{9:[2,30],16:[2,30],30:[2,30],31:[2,30],32:[2,30],33:[2,30],34:[2,30],35:[2,30],36:[2,30],37:[2,30],41:[2,30],42:[2,30],26:[2,30],14:[2,30],27:[2,30],28:[2,30],39:[2,30],24:[2,30],11:[2,30],21:[2,30],40:[2,30]},{9:[2,31],16:[2,31],30:[2,31],31:[2,31],32:[2,31],33:[2,31],34:[2,31],35:[2,31],36:[2,31],37:[2,31],41:[2,31],42:[2,31],26:[2,31],14:[2,31],27:[2,31],28:[2,31],39:[2,31],24:[2,31],11:[2,31],21:[2,31],40:[2,31]},{9:[2,32],16:[2,32],30:[2,32],31:[2,32],32:[2,32],33:[2,32],34:[2,32],35:[2,32],36:[2,32],37:[2,32],41:[2,32],42:[2,32],26:[2,32],14:[2,32],27:[2,32],28:[2,32],39:[2,32],24:[2,32],11:[2,32],21:[2,32],40:[2,32]},{9:[2,33],16:[2,33],30:[2,33],31:[2,33],32:[2,33],33:[2,33],34:[2,33],35:[2,33],36:[2,33],37:[2,33],41:[2,33],42:[2,33],26:[2,33],14:[2,33],27:[2,33],28:[2,33],39:[2,33],24:[2,33],11:[2,33],21:[2,33],40:[2,33]},{9:[2,34],16:[2,34],30:[2,34],31:[2,34],32:[2,34],33:[2,34],34:[2,34],35:[2,34],36:[2,34],37:[2,34],41:[2,34],42:[2,34],26:[2,34],14:[2,34],27:[2,34],28:[2,34],39:[2,34],24:[2,34],11:[2,34],21:[2,34],40:[2,34]},{9:[2,35],16:[2,35],30:[2,35],31:[2,35],32:[2,35],33:[2,35],34:[2,35],35:[2,35],36:[2,35],37:[2,35],41:[2,35],42:[2,35],26:[2,35],14:[2,35],27:[2,35],28:[2,35],39:[2,35],24:[2,35],11:[2,35],21:[2,35],40:[2,35]},{25:48,30:[1,32],31:[1,33],32:[1,34],33:[1,35],34:[1,36],35:[1,37],36:[1,38],37:[1,39],38:40,41:[1,42],42:[1,43]},{19:49,22:25,25:26,26:[1,27],14:[1,28],27:[1,29],28:[1,30],29:31,30:[1,32],31:[1,33],32:[1,34],33:[1,35],34:[1,36],35:[1,37],36:[1,38],37:[1,39],38:40,39:[1,41],41:[1,42],42:[1,43]},{30:[2,38],31:[2,38],32:[2,38],33:[2,38],34:[2,38],35:[2,38],36:[2,38],37:[2,38],41:[2,38],42:[2,38]},{30:[2,39],31:[2,39],32:[2,39],33:[2,39],34:[2,39],35:[2,39],36:[2,39],37:[2,39],41:[2,39],42:[2,39]},{9:[2,18],16:[2,18],30:[2,18],31:[2,18],32:[2,18],33:[2,18],34:[2,18],35:[2,18],36:[2,18],37:[2,18],41:[2,18],42:[2,18],26:[2,18],14:[2,18],27:[2,18],28:[2,18],39:[2,18],24:[2,18],11:[2,18],21:[2,18],40:[2,18]},{22:50,25:26,26:[1,27],14:[1,28],27:[1,29],28:[1,30],29:31,30:[1,32],31:[1,33],32:[1,34],33:[1,35],34:[1,36],35:[1,37],36:[1,38],37:[1,39],38:40,39:[1,41],41:[1,42],42:[1,43]},{30:[2,20],31:[2,20],32:[2,20],33:[2,20],34:[2,20],35:[2,20],36:[2,20],37:[2,20],41:[2,20],42:[2,20],26:[2,20],14:[2,20],27:[2,20],28:[2,20],39:[2,20]},{30:[2,21],31:[2,21],32:[2,21],33:[2,21],34:[2,21],35:[2,21],36:[2,21],37:[2,21],41:[2,21],42:[2,21],26:[2,21],14:[2,21],27:[2,21],28:[2,21],39:[2,21]},{9:[2,36],16:[2,36],30:[2,36],31:[2,36],32:[2,36],33:[2,36],34:[2,36],35:[2,36],36:[2,36],37:[2,36],41:[2,36],42:[2,36],26:[2,36],14:[2,36],27:[2,36],28:[2,36],39:[2,36],24:[2,36],11:[2,36],21:[2,36],40:[2,36]},{40:[1,51],22:44,23:45,25:26,26:[1,27],14:[1,28],27:[1,29],28:[1,30],29:31,24:[1,46],11:[1,47],30:[1,32],31:[1,33],32:[1,34],33:[1,35],34:[1,36],35:[1,37],36:[1,38],37:[1,39],38:40,39:[1,41],41:[1,42],42:[1,43]},{9:[2,19],16:[2,19],30:[2,19],31:[2,19],32:[2,19],33:[2,19],34:[2,19],35:[2,19],36:[2,19],37:[2,19],41:[2,19],42:[2,19],26:[2,19],14:[2,19],27:[2,19],28:[2,19],39:[2,19],24:[2,19],11:[2,19],21:[2,19],40:[2,19]},{9:[2,37],16:[2,37],30:[2,37],31:[2,37],32:[2,37],33:[2,37],34:[2,37],35:[2,37],36:[2,37],37:[2,37],41:[2,37],42:[2,37],26:[2,37],14:[2,37],27:[2,37],28:[2,37],39:[2,37],24:[2,37],11:[2,37],21:[2,37],40:[2,37]}],
				defaultActions: {16:[2,15]},
				parseError: function parseError(str, hash) {
					throw new Error(str);
				},
				parse: function parse(input) {
					var self = this,
					stack = [0],
					vstack = [null], // semantic value stack
					lstack = [], // location stack
					table = this.table,
					yytext = '',
					yylineno = 0,
					yyleng = 0,
					recovering = 0,
					TERROR = 2,
					EOF = 1;
				
					//this.reductionCount = this.shiftCount = 0;
				
					this.lexer.setInput(input);
					this.lexer.yy = this.yy;
					this.yy.lexer = this.lexer;
					this.yy.parser = this;
					if (typeof this.lexer.yylloc == 'undefined')
						this.lexer.yylloc = {};
					var yyloc = this.lexer.yylloc;
					lstack.push(yyloc);
				
					var ranges = this.lexer.options && this.lexer.options.ranges;
				
					if (typeof this.yy.parseError === 'function')
						this.parseError = this.yy.parseError;
				
					function popStack (n) {
						stack.length = stack.length - 2*n;
						vstack.length = vstack.length - n;
						lstack.length = lstack.length - n;
					}
				
					function lex() {
						var token;
						token = self.lexer.lex() || 1; // $end = 1
						// if token isn't its numeric value, convert
						if (typeof token !== 'number') {
							token = self.symbols_[token] || token;
						}
						return token;
					}
				
					var symbol, preErrorSymbol, state, action, a, r, yyval={},p,len,newState, expected;
					while (true) {
						// retreive state number from top of stack
						state = stack[stack.length-1];
				
						// use default actions if available
						if (this.defaultActions[state]) {
							action = this.defaultActions[state];
						} else {
							if (symbol === null || typeof symbol == 'undefined') {
								symbol = lex();
							}
							// read action for current state and first input
							action = table[state] && table[state][symbol];
						}
				
						// handle parse error
						_handle_error:
						if (typeof action === 'undefined' || !action.length || !action[0]) {
				
							var errStr = '';
							if (!recovering) {
								// Report error
								expected = [];
								for (p in table[state]) if (this.terminals_[p] && p > 2) {
									expected.push("'"+this.terminals_[p]+"'");
								}
								if (this.lexer.showPosition) {
									errStr = 'Parse error on line '+(yylineno+1)+":\n"+this.lexer.showPosition()+"\nExpecting "+expected.join(', ') + ", got '" + (this.terminals_[symbol] || symbol)+ "'";
								} else {
									errStr = 'Parse error on line '+(yylineno+1)+": Unexpected " +
											(symbol == 1 /*EOF*/ ? "end of input" :
												("'"+(this.terminals_[symbol] || symbol)+"'"));
								}
								this.parseError(errStr,
									{text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
							}
				
							// just recovered from another error
							if (recovering == 3) {
								if (symbol == EOF) {
									throw new Error(errStr || 'Parsing halted.');
								}
				
								// discard current lookahead and grab another

								yyleng = this.lexer.yyleng;
								yytext = this.lexer.yytext;
								yylineno = this.lexer.yylineno;
								yyloc = this.lexer.yylloc;
								symbol = lex();
							}
				
							// try to recover from error
							while (1) {
								// check for error recovery rule in this state
								if ((TERROR.toString()) in table[state]) {
									break;
								}
								if (state === 0) {
									throw new Error(errStr || 'Parsing halted.');
								}
								popStack(1);
								state = stack[stack.length-1];
							}
				
							preErrorSymbol = symbol == 2 ? null : symbol; // save the lookahead token
							symbol = TERROR;		 // insert generic error symbol as new lookahead
							state = stack[stack.length-1];
							action = table[state] && table[state][TERROR];
							recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
						}
				
						// this shouldn't happen, unless resolve defaults are off
						if (action[0] instanceof Array && action.length > 1) {
							throw new Error('Parse Error: multiple actions possible at state: '+state+', token: '+symbol);
						}
				
						switch (action[0]) {
				
							case 1: // shift
								//this.shiftCount++;
				
								stack.push(symbol);
								vstack.push(this.lexer.yytext);
								lstack.push(this.lexer.yylloc);
								stack.push(action[1]); // push state
								symbol = null;
								if (!preErrorSymbol) { // normal execution/no error
									yyleng = this.lexer.yyleng;
									yytext = this.lexer.yytext;
									yylineno = this.lexer.yylineno;
									yyloc = this.lexer.yylloc;
									if (recovering > 0)
										recovering--;
								} else { // error just occurred, resume old lookahead f/ before error
									symbol = preErrorSymbol;
									preErrorSymbol = null;
								}
								break;
				
							case 2: // reduce
								//this.reductionCount++;
				
								len = this.productions_[action[1]][1];
				
								// perform semantic action
								yyval.$ = vstack[vstack.length-len]; // default to $$ = $1
								// default location, uses first token for firsts, last for lasts
								yyval._$ = {
									first_line: lstack[lstack.length-(len||1)].first_line,
									last_line: lstack[lstack.length-1].last_line,
									first_column: lstack[lstack.length-(len||1)].first_column,
									last_column: lstack[lstack.length-1].last_column
								};
								if (ranges) {
								  yyval._$.range = [lstack[lstack.length-(len||1)].range[0], lstack[lstack.length-1].range[1]];
								}
								r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
				
								if (typeof r !== 'undefined') {
									return r;
								}
				
								// pop off stack
								if (len) {
									stack = stack.slice(0,-1*len*2);
									vstack = vstack.slice(0, -1*len);
									lstack = lstack.slice(0, -1*len);
								}
				
								stack.push(this.productions_[action[1]][0]);	// push nonterminal (reduce)
								vstack.push(yyval.$);
								lstack.push(yyval._$);
								// goto new state = table[STATE][NONTERMINAL]
								newState = table[stack[stack.length-2]][stack[stack.length-1]];
								stack.push(newState);
								break;
				
							case 3: // accept
								return true;
						}
				
					}
				
					return true;
				}};
				/* Jison generated lexer */
				var lexer = (function(){
				var lexer = ({EOF:1,
				parseError:function parseError(str, hash) {
						if (this.yy.parser) {
							this.yy.parser.parseError(str, hash);
						} else {
							throw new Error(str);
						}
					},
				setInput:function (input) {
						this._input = input;
						this._more = this._less = this.done = false;
						this.yylineno = this.yyleng = 0;
						this.yytext = this.matched = this.match = '';
						this.conditionStack = ['INITIAL'];
						this.yylloc = {first_line:1,first_column:0,last_line:1,last_column:0};
						if (this.options.ranges) this.yylloc.range = [0,0];
						this.offset = 0;
						return this;
					},
				input:function () {
						var ch = this._input[0];
						this.yytext += ch;
						this.yyleng++;
						this.offset++;
						this.match += ch;
						this.matched += ch;
						var lines = ch.match(/(?:\r\n?|\n).*/g);
						if (lines) {
							this.yylineno++;
							this.yylloc.last_line++;
						} else {
							this.yylloc.last_column++;
						}
						if (this.options.ranges) this.yylloc.range[1]++;
				
						this._input = this._input.slice(1);
						return ch;
					},
				unput:function (ch) {
						var len = ch.length;
						var lines = ch.split(/(?:\r\n?|\n)/g);
				
						this._input = ch + this._input;
						this.yytext = this.yytext.substr(0, this.yytext.length-len-1);
						//this.yyleng -= len;
						this.offset -= len;
						var oldLines = this.match.split(/(?:\r\n?|\n)/g);
						this.match = this.match.substr(0, this.match.length-1);
						this.matched = this.matched.substr(0, this.matched.length-1);
				
						if (lines.length-1) this.yylineno -= lines.length-1;
						var r = this.yylloc.range;
				
						this.yylloc = {first_line: this.yylloc.first_line,
						  last_line: this.yylineno+1,
						  first_column: this.yylloc.first_column,
						  last_column: lines ?
							  (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length:
							  this.yylloc.first_column - len
						  };
				
						if (this.options.ranges) {
							this.yylloc.range = [r[0], r[0] + this.yyleng - len];
						}
						return this;
					},
				more:function () {
						this._more = true;
						return this;
					},
				less:function (n) {
						this.unput(this.match.slice(n));
					},
				pastInput:function () {
						var past = this.matched.substr(0, this.matched.length - this.match.length);
						return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
					},
				upcomingInput:function () {
						var next = this.match;
						if (next.length < 20) {
							next += this._input.substr(0, 20-next.length);
						}
						return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
					},
				showPosition:function () {
						var pre = this.pastInput();
						var c = new Array(pre.length + 1).join("-");
						return pre + this.upcomingInput() + "\n" + c+"^";
					},
				next:function () {
						if (this.done) {
							return this.EOF;
						}
						if (!this._input) this.done = true;
				
						var token,
							match,
							tempMatch,
							index,
							col,
							lines;
						if (!this._more) {
							this.yytext = '';
							this.match = '';
						}
						var rules = this._currentRules();
						for (var i=0;i < rules.length; i++) {
							tempMatch = this._input.match(this.rules[rules[i]]);
							if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
								match = tempMatch;
								index = i;
								if (!this.options.flex) break;
							}
						}
						if (match) {
							lines = match[0].match(/(?:\r\n?|\n).*/g);
							if (lines) this.yylineno += lines.length;
							this.yylloc = {first_line: this.yylloc.last_line,
											last_line: this.yylineno+1,
											first_column: this.yylloc.last_column,
											last_column: lines ? lines[lines.length-1].length-lines[lines.length-1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length};
							this.yytext += match[0];
							this.match += match[0];
							this.matches = match;
							this.yyleng = this.yytext.length;
							if (this.options.ranges) {
								this.yylloc.range = [this.offset, this.offset += this.yyleng];
							}
							this._more = false;
							this._input = this._input.slice(match[0].length);
							this.matched += match[0];
							token = this.performAction.call(this, this.yy, this, rules[index],this.conditionStack[this.conditionStack.length-1]);
							if (this.done && this._input) this.done = false;
							if (token) return token;
							else return;
						}
						if (this._input === "") {
							return this.EOF;
						} else {
							return this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(),
									{text: "", token: null, line: this.yylineno});
						}
					},
				lex:function lex() {
						var r = this.next();
						if (typeof r !== 'undefined') {
							return r;
						} else {
							return this.lex();
						}
					},
				begin:function begin(condition) {
						this.conditionStack.push(condition);
					},
				popState:function popState() {
						return this.conditionStack.pop();
					},
				_currentRules:function _currentRules() {
						return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;
					},
				topState:function () {
						return this.conditionStack[this.conditionStack.length-2];
					},
				pushState:function begin(condition) {
						this.begin(condition);
					}});
				lexer.options = {"flex":true,"case-insensitive":true};
				lexer.performAction = function anonymous(yy, yy_, $avoiding_name_collisions, YY_START) {
				
				var YYSTATE=YY_START;
				switch($avoiding_name_collisions) {
				case 0:/*return 'S';*/
				break;
				case 1:/* ignore comments */
				break;
				case 2:/* unclosed comment at EOF */
				break;
				case 3:return 'CDO';
				
				case 4:return 'CDC';
				
				case 5:return 'INCLUDES';
				
				case 6:return 'DASHMATCH';
				
				case 7:return 26;
				
				case 8:return 'BAD_STRING';
				
				case 9:return 14;
				
				case 10:return 28;
				
				case 11:return 'IMPORT_SYM';
				
				case 12:return 'PAGE_SYM';
				
				case 13:return 'MEDIA_SYM';
				
				case 14:return 'CHARSET_SYM';
				
				case 15:return 21;
				
				case 16:return 33;
				
				case 17:return 34;
				
				case 18:return 32;
				
				case 19:return 32;
				
				case 20:return 32;
				
				case 21:return 32;
				
				case 22:return 32;
				
				case 23:return 32;
				
				case 24:return 35;
				
				case 25:return 35;
				
				case 26:return 35;
				
				case 27:return 36;
				
				case 28:return 36;
				
				case 29:return 37;
				
				case 30:return 37;
				
				case 31:return 'DIMENSION';
				
				case 32:return 31;
				
				case 33:return 30;
				
				case 34:return 27;
				
				case 35:return 27;
				
				case 36:return 'BAD_URI';
				
				case 37:return 39;
				
				case 38:return yy_.yytext;
				
				case 39:console.log(yy_.yytext);
				break;
				}
				};
				lexer.rules = [/^(?:([ \t\r\n\f]+))/i,/^(?:\/\*[^*]*\*+([^\/*][^*]*\*+)*\/)/i,/^(?:((\/\*[^*]*\*+([^\/*][^*]*\*+)*)|(\/\*[^*]*(\*+[^\/*][^*]*)*)))/i,/^(?:<!--)/i,/^(?:-->)/i,/^(?:~=)/i,/^(?:\|=)/i,/^(?:(("([^\n\r\f\\"]|\\(\n|\r\n|\r|\f)|((\\([0-9a-f]){1,6}(\r\n|[ \t\r\n\f])?)|\\[^\r\n\f0-9a-f]))*")|('([^\n\r\f\\']|\\(\n|\r\n|\r|\f)|((\\([0-9a-f]){1,6}(\r\n|[ \t\r\n\f])?)|\\[^\r\n\f0-9a-f]))*')))/i,/^(?:(("([^\n\r\f\\"]|\\(\n|\r\n|\r|\f)|((\\([0-9a-f]){1,6}(\r\n|[ \t\r\n\f])?)|\\[^\r\n\f0-9a-f]))*\\?)|('([^\n\r\f\\']|\\(\n|\r\n|\r|\f)|((\\([0-9a-f]){1,6}(\r\n|[ \t\r\n\f])?)|\\[^\r\n\f0-9a-f]))*\\?)))/i,/^(?:([-]?([_a-zA-Z]|([\240-\377])|((\\([0-9a-f]){1,6}(\r\n|[ \t\r\n\f])?)|\\[^\r\n\f0-9a-f]))([_a-zA-Z0-9-]|([\240-\377])|((\\([0-9a-f]){1,6}(\r\n|[ \t\r\n\f])?)|\\[^\r\n\f0-9a-f]))*))/i,/^(?:#(([_a-zA-Z0-9-]|([\240-\377])|((\\([0-9a-f]){1,6}(\r\n|[ \t\r\n\f])?)|\\[^\r\n\f0-9a-f]))+))/i,/^(?:@([iI])([mM])([pP])([oO])([rR])([tT]))/i,/^(?:@([pP])([aA])([gG])([eE]))/i,/^(?:@([mM])([eE])([dD])([iI])([aA]))/i,/^(?:@charset )/i,/^(?:!((([ \t\r\n\f]+)?)|(\/\*[^*]*\*+([^\/*][^*]*\*+)*\/))*([iI])([mM])([pP])([oO])([rR])([tT])([aA])([nN])([tT]))/i,/^(?:([0-9]+|[0-9]*\.[0-9]+)([eE])([mM]))/i,/^(?:([0-9]+|[0-9]*\.[0-9]+)([eE])([xX]))/i,/^(?:([0-9]+|[0-9]*\.[0-9]+)([pP])([xX]))/i,/^(?:([0-9]+|[0-9]*\.[0-9]+)([cC])([mM]))/i,/^(?:([0-9]+|[0-9]*\.[0-9]+)([mM])([mM]))/i,/^(?:([0-9]+|[0-9]*\.[0-9]+)([iI])([nN]))/i,/^(?:([0-9]+|[0-9]*\.[0-9]+)([pP])([tT]))/i,/^(?:([0-9]+|[0-9]*\.[0-9]+)([pP])([cC]))/i,/^(?:([0-9]+|[0-9]*\.[0-9]+)([dD])([eE])([gG]))/i,/^(?:([0-9]+|[0-9]*\.[0-9]+)([rR])([aA])([dD]))/i,/^(?:([0-9]+|[0-9]*\.[0-9]+)([gG])([rR])([aA])([dD]))/i,/^(?:([0-9]+|[0-9]*\.[0-9]+)([mM])([sS]))/i,/^(?:([0-9]+|[0-9]*\.[0-9]+)([sS]))/i,/^(?:([0-9]+|[0-9]*\.[0-9]+)([hH])([zZ]))/i,/^(?:([0-9]+|[0-9]*\.[0-9]+)([kK])([hH])([zZ]))/i,/^(?:([0-9]+|[0-9]*\.[0-9]+)([-]?([_a-zA-Z]|([\240-\377])|((\\([0-9a-f]){1,6}(\r\n|[ \t\r\n\f])?)|\\[^\r\n\f0-9a-f]))([_a-zA-Z0-9-]|([\240-\377])|((\\([0-9a-f]){1,6}(\r\n|[ \t\r\n\f])?)|\\[^\r\n\f0-9a-f]))*))/i,/^(?:([0-9]+|[0-9]*\.[0-9]+)%)/i,/^(?:([0-9]+|[0-9]*\.[0-9]+))/i,/^(?:url\((([ \t\r\n\f]+)?)(("([^\n\r\f\\"]|\\(\n|\r\n|\r|\f)|((\\([0-9a-f]){1,6}(\r\n|[ \t\r\n\f])?)|\\[^\r\n\f0-9a-f]))*")|('([^\n\r\f\\']|\\(\n|\r\n|\r|\f)|((\\([0-9a-f]){1,6}(\r\n|[ \t\r\n\f])?)|\\[^\r\n\f0-9a-f]))*'))(([ \t\r\n\f]+)?)\))/i,/^(?:url\((([ \t\r\n\f]+)?)(([!#$%&*-~]|([\240-\377])|((\\([0-9a-f]){1,6}(\r\n|[ \t\r\n\f])?)|\\[^\r\n\f0-9a-f]))*)(([ \t\r\n\f]+)?)\))/i,/^(?:((url\((([ \t\r\n\f]+)?)([!#$%&*-\[\]-~]|([\240-\377])|((\\([0-9a-f]){1,6}(\r\n|[ \t\r\n\f])?)|\\[^\r\n\f0-9a-f]))*(([ \t\r\n\f]+)?))|(url\((([ \t\r\n\f]+)?)(("([^\n\r\f\\"]|\\(\n|\r\n|\r|\f)|((\\([0-9a-f]){1,6}(\r\n|[ \t\r\n\f])?)|\\[^\r\n\f0-9a-f]))*")|('([^\n\r\f\\']|\\(\n|\r\n|\r|\f)|((\\([0-9a-f]){1,6}(\r\n|[ \t\r\n\f])?)|\\[^\r\n\f0-9a-f]))*'))(([ \t\r\n\f]+)?))|(url\((([ \t\r\n\f]+)?)(("([^\n\r\f\\"]|\\(\n|\r\n|\r|\f)|((\\([0-9a-f]){1,6}(\r\n|[ \t\r\n\f])?)|\\[^\r\n\f0-9a-f]))*\\?)|('([^\n\r\f\\']|\\(\n|\r\n|\r|\f)|((\\([0-9a-f]){1,6}(\r\n|[ \t\r\n\f])?)|\\[^\r\n\f0-9a-f]))*\\?)))))/i,/^(?:([-]?([_a-zA-Z]|([\240-\377])|((\\([0-9a-f]){1,6}(\r\n|[ \t\r\n\f])?)|\\[^\r\n\f0-9a-f]))([_a-zA-Z0-9-]|([\240-\377])|((\\([0-9a-f]){1,6}(\r\n|[ \t\r\n\f])?)|\\[^\r\n\f0-9a-f]))*)\()/i,/^(?:.)/i,/^(?:.)/i];
				lexer.conditions = {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39],"inclusive":true}};
				return lexer;})();
				parser.lexer = lexer;
				function Parser () { this.yy = {}; }Parser.prototype = parser;parser.Parser = Parser;
				return new Parser();
				})();
				if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
				exports.parser = parser;
				exports.Parser = parser.Parser;
				exports.parse = function () { return parser.parse.apply(parser, arguments); };
				exports.main = function commonjsMain(args) {
					if (!args[1])
						throw new Error('Usage: '+args[0]+' FILE');
					var source, cwd;
					if (typeof process !== 'undefined') {
						source = require("fs").readFileSync(require("path").resolve(args[1]), "utf8");
					} else {
						source = require("file").path(require("file").cwd()).join(args[1]).read({charset: "utf-8"});
					}
					return exports.parser.parse(source);
				};
				if (typeof module !== 'undefined' && require.main === module) {
					exports.main(typeof process !== 'undefined' ? process.argv.slice(1) : require("system").args);
				}
				}	

	/* ThemeGrammarGenerated End#########################*/

    var CSSParser = function() {
	};
    
    var cp = CSSParser.prototype;
    
    var u = new CSSParserUtility();
    
    cp._processBorderCommon = function(valStr, edges) {
        /*
        border-width
        border-style (required)
        border-color
         */
        var vals = valStr.split(' ');
        var l = vals.length;
		if ( l == 0 || l > 3) return null;
        var repos = {};
        var res = [];
        var legalTypes = [u.TYPE_COLOR, u.TYPE_WIDTH, u.TYPE_BORDERSTYLE];
        for (var i = 0; i < l; i++) {
            var val = vals[i];
            var type = u.valueType(val);
            //check duplication
            if (legalTypes.indexOf(type) < 0 || repos[type]) return null;
            repos[type] = 'XXX';
            //expand to result object
            for (var j = 0; j < edges.length; j++) {
                var name = edges[j] + '-';
                switch(type) {
                    case u.TYPE_COLOR:
                        name += 'color';
                        break;
                    case u.TYPE_WIDTH:
                        name += 'width';
                        break;
                    case u.TYPE_BORDERSTYLE:
                        name += 'style';
                        break;
                }   
                res.push({name: name, value: val});
            }
        }
        if (!repos[u.TYPE_BORDERSTYLE]) return null;
        return res;
    };
    
    cp.processBorder = function(valStr) {
        var edges = ['border-top', 'border-right', 'border-bottom', 'border-left'];
        return this._processBorderCommon(valStr, edges);
    };
    
    cp.processBorderEdge = function(valStr, border) {
        return this._processBorderCommon(valStr, [border]);
    };
    
    cp._expandAttrTo4Edges = function(valStr, attrName, vFunc, range, edges) {
        var vals = valStr.split(' ');
        var l = vals.length;
        if (l == 0 || l > 4) return null;
        var res = [];
        for (var i = 0; i < 4; i++) {
            var name = edges[i].replace('*', attrName);
            var k = i;
            k < l || (k -= 2) < l || (k -= 3) < l;
            k >= 0 || (k = 0);
            var value = vals[k];
            if (valStr != 'inherit' && !vFunc.call(range, value)) return null;
            res.push({name: name, value: value});
        }
        return res;
    };
    
    cp._processBorderAttr = function(valStr, attrName) {
        var vFunc = null;
        switch (attrName) {
            case 'color':
                vFunc = u.isColor;
                break;
            case 'width':
                vFunc = u.isWidth;
                break;
            case 'style':
                vFunc = u.isBorderStyle;
                break;
            default:
                return null;
        }
        var edges = ['border-top-*', 'border-right-*', 'border-bottom-*', 'border-left-*'];
        return this._expandAttrTo4Edges(valStr, attrName, vFunc, u, edges);
    };
    
    cp.processBorderColor = function(valStr) {
        return this._processBorderAttr(valStr, 'color');
    };
    cp.processBorderWidth = function(valStr) {
        return this._processBorderAttr(valStr, 'width');
    };
    cp.processBorderStyle = function(valStr) {
        return this._processBorderAttr(valStr, 'style');
    };
    
    cp.processFont = function(valStr) {
        var vals = u.split(valStr, ' ');
        if (vals.length < 2) return null;
        var hasHeight = valStr.indexOf('/') >= 0;
        var res = [];
        res.push({name: 'font-family', value: vals.pop()});
        var size = vals.pop();
        if (hasHeight) {
            var eles = size.split('/');
            if (eles.length != 2 || eles[1] == '') return null;
            res.push({name: 'line-height', value: eles[1]});
            size = eles[0];
        }
        if (size == '') return null;
        if (!u.validateFontSize(size)) return null;
        res.push({name: 'font-size', value: size});
        var repos = {};
        var legalTypes = [u.TYPE_FONTSTYLE, u.TYPE_FONTVARIANT, u.TYPE_FONTWEIGHT];
        for (var i = 0, l = vals.length; i < l; i++) {
            var type = u.valueType(vals[i]);
            if (legalTypes.indexOf(type) < 0 || repos[type]) return null;
            repos[type] = 'XXX';
            var name = null;
            res.push({name: type, value: vals[i]});
        }
        return res;
    };
    
    cp.processMargin = function(str) {
        var edges = ['*-top', '*-right', '*-bottom', '*-left'];
        return this._expandAttrTo4Edges(str, 'padding', u.validateMargin, u, edges);
    };
    
    cp.processPadding = function(str) {
        var edges = ['*-top', '*-right', '*-bottom', '*-left'];
        return this._expandAttrTo4Edges(str, 'margin', u.validatePadding, u, edges);
    };
    
    cp.processParentAttrs = function(declarations) {
        /*
         * according to CSS 2.1:
         * 
         * parent attributes (need expanding to children attributes)
         * border, border-bottom, border-left, border-right, border-top, border-color, border-style, border-width, font, margin, outline(TODO), padding
         * 
         * abstract attributes (no expanding needed)
         * background, list-style
         * 
         */
        var res = [];
        for ( var i = 0, l = declarations.length; i < l; i++) {
            var attr = declarations[i];
            var attrName = attr.name.toLowerCase();
            var subAttrs = attr;
            switch (attrName) {
                case 'border':
                    subAttrs = this.processBorder(attr.value);
                    break;
                case 'border-top':
                case 'border-right':
                case 'border-bottom':
                case 'border-left':
                    subAttrs = this.processBorderEdge(attr.value, attrName);
                    break;
                case 'border-color':
                    subAttrs = this.processBorderColor(attr.value);
                    break;
                case 'border-style':
                    subAttrs = this.processBorderStyle(attr.value);
                    break;
                case 'border-width':
                    subAttrs = this.processBorderWidth(attr.value);
                    break;
                case 'font':
                    subAttrs = this.processFont(attr.value);
                    break;
                case 'margin':
                    subAttrs = this.processMargin(attr.value);
                    break;
                case 'padding':
                    subAttrs = this.processPadding(attr.value);
                    break;
                default:
                    break;
            }
            if (subAttrs === attr) {
                res.push(attr);
            } else {
                for (var idx in subAttrs) {
                    subAttrs[idx].important = attr.important;
                    res.push(subAttrs[idx]);
                }
            }
        }
        return res;
    };
    /**
     * parse css string
     */
    cp.parse = function(cssText) {
        var sheet = null;
        try {
            sheet = parser.parse(cssText);
        } catch(ex) {
            alert('Parse error, please check your console output: \n' + ex);
            console.log( ex );
            console.log( ex.message );
            return null;
        }
        var records = [];
        var idx = 1;
        for (var i = 0, l = sheet.length; i < l; i++) {
            var rawRule = sheet[i];
            var des = this.processParentAttrs(rawRule.declaration);
            for (var j = 0, k = des.length; j < k; j++) {
                var record = {
                    idx: idx++,
                    selector: rawRule.selector,
                    property: des[j].name,
                    value: des[j].value,
                    important: des[j].important ? true : false
                };
                records.push(record);
            }
        }
        return records;
    };
    
    return new CSSParser();	
});