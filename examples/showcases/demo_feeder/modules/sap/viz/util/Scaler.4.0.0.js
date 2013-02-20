sap.riv.module(
{
  qname : 'sap.viz.util.Scaler',
  version : '4.0.0'},
[

],

function Setup() {
    
    var Scaler = {
        /**
         * @param _scale
         *        d3 quantitative scale
         *                
         * @param _roughTickNum
         *        rough tick number
         *                
         * @param _accurateTickNum
         *        accurate tick number
         *
         * @returns d3 quantitative scale which can be divided by ticks perfectly
         */
        perfect : function(_scale, _roughTickNum, _accurateTickNum)
        {
            //the function may change the domain, but never change the range.
            var const_minTickNum = 2;
            var const_extendNum = 100;

            var domainArray = _scale.domain();

            var originalDomainBegin = domainArray[0];
            var originalDomainEnd = domainArray[domainArray.length-1];

            //if the domain is [0,0], we change it to [0,100]
            //if the domain is [-x,-x], we change it to [-x,0]
            //if the domain is [x,x], we change it to [x,0]
            //we do this in modules
            
            var roughTickNum = -1;
            var accurateTickNum = -1;

            if(!_accurateTickNum || _accurateTickNum < const_minTickNum)
            {
                if(!_roughTickNum || _roughTickNum < const_minTickNum)
                {
                    var rangeArray = _scale.range();
                    var rangeLen = Math.abs(rangeArray[0] - rangeArray[rangeArray.length-1]);
                    if(rangeLen > 10)
                    {
                        roughTickNum = const_minTickNum + Math.round(rangeLen/100);
                    }
                    else
                    {
                        roughTickNum = const_minTickNum;
                    }
                }
                else
                {
                    roughTickNum = _roughTickNum;
                }
            }
            else
            {
                accurateTickNum = _accurateTickNum;
            }

            var qScale = _scale.nice();
            if(accurateTickNum < 0)
            {
                var ticks = qScale.ticks(roughTickNum);
                
                var adjustDomain = true;
                var distance;
                if(ticks.length == 0)
                {
                    adjustDomain = false;
                }
                else if(ticks.length > 1)
                {
                    distance = ticks[1] - ticks[0];//>0
                }
                else//ticks.length==1
                {
                    var beginDis = Math.abs(domainArray[0] - ticks[0]);//>0
                    var endDis = Math.abs(domainArray[domainArray.length - 1] - ticks[0]);//>0
                    if(beginDis > endDis)
                    {
                        distance = beginDis;
                    }
                    else
                    {
                        distance = endDis;
                    }
                }
                
                var realTickNum = const_minTickNum;
                if(adjustDomain)
                {
                    realTickNum = ticks.length;
                    if(domainArray[0] < domainArray[1])
                    {
                        if(ticks[0] != domainArray[0])
                        {
                            domainArray[0] = ticks[0] - distance;
                            realTickNum++;
                        }

                        if(ticks[ticks.length -1] != domainArray[domainArray.length - 1])
                        {
                            domainArray[domainArray.length - 1] = ticks[ticks.length - 1] + distance;
                            realTickNum++;
                        }
                    }
                    else
                    {
                        if(ticks[0] != domainArray[domainArray.length - 1])
                        {
                            domainArray[domainArray.length - 1] = ticks[0] - distance;
                            realTickNum++;
                        }

                        if(ticks[ticks.length -1] != domainArray[0])
                        {
                            domainArray[0] = ticks[ticks.length - 1] + distance;
                            realTickNum++;
                        }
                    }
                }

                qScale.tickNum = realTickNum;
                qScale.distance = distance;
                qScale.tickHint = realTickNum - 1;

                //to nice the domainArray, avoid the domain contains 0.00060000001
                domainArray[0] = parseFloat(domainArray[0].toFixed(8));
                domainArray[domainArray.length - 1] = parseFloat(domainArray[domainArray.length - 1].toFixed(8));
                qScale.domain(domainArray);
                
            }
            else
            {
                //accurateTickNum:
                //1. use it as roughTickNum. 
                //2. adjust the ticNum or not
                this.perfect(qScale, accurateTickNum);
                if(qScale.tickNum > accurateTickNum)
                {
                    //try to make sure qScale.tickNum < accurateTickNum
                    var tempNum = accurateTickNum;
                    for(;tempNum >= const_minTickNum;)
                    {
                        tempNum--;
                        this.perfect(qScale, tempNum);
                        if(qScale.tickNum <= accurateTickNum)
                        {
                            break;
                        }
                    }
                }
                
                //adjust the domain
                if(qScale.tickNum < accurateTickNum)
                {
                    var tickNumToAdd = (accurateTickNum - qScale.tickNum);
                    var domainArray = qScale.domain();
                    //var originalDomainBegin 
                    //var originalDomainEnd

                    for(;tickNumToAdd > 0;)
                    {
                        if(domainArray[0] < domainArray[1])
                        {
                            if(Math.abs(domainArray[1] - originalDomainEnd) > Math.abs(originalDomainBegin - domainArray[0]))
                            {
                                domainArray[0] -= qScale.distance;
                            }
                            else
                            {
                                domainArray[1] += qScale.distance;
                            }
                            tickNumToAdd--;
                            qScale.tickNum++;
                        }
                        else
                        {
                            if(Math.abs(domainArray[1] - originalDomainEnd) > Math.abs(originalDomainBegin - domainArray[0]))
                            {
                                domainArray[0] += qScale.distance;
                            }
                            else
                            {
                                domainArray[1] -= qScale.distance;
                            }
                            tickNumToAdd--;
                            qScale.tickNum++;
                        }
                    }
                    
                    qScale.tickHint = qScale.tickNum - 1;
                    //to nice the domainArray, avoid the domain contains 0.00060000001
                    domainArray[0] = parseFloat(domainArray[0].toFixed(8));
                    domainArray[domainArray.length - 1] = parseFloat(domainArray[domainArray.length - 1].toFixed(8));
                    qScale.domain(domainArray);
                    
                }
            }

            return qScale;
        },
        
        /**
         * @param _scaleA
         *        d3 linear scale
         *                
         * @param _scaleB
         *        d3 linear scale
         */
        perfectDual : function(_scaleA, _scaleB) {

            this.perfect(_scaleA);
            this.perfect(_scaleB);
            
            var domainArrayA = _scaleA.domain();
            var domainArrayB = _scaleB.domain();

            var rangeArrayA = _scaleA.range();
            var rangeArrayB = _scaleB.range();

            if( (domainArrayA[0] > domainArrayA[domainArrayA.length-1]
                && domainArrayB[0] < domainArrayB[domainArrayB.length-1])
                ||
                (domainArrayA[0] < domainArrayA[domainArrayA.length-1]
                && domainArrayB[0] > domainArrayB[domainArrayB.length-1])
                ||
                (domainArrayA[0] < 0
                && domainArrayA[domainArrayA.length-1] < 0)
                ||
                (domainArrayB[0] < 0
                && domainArrayB[domainArrayB.length-1] < 0)
                ||
                (domainArrayA[0] > 0
                && domainArrayA[domainArrayA.length-1] > 0)
                ||
                (domainArrayB[0] > 0
                && domainArrayB[domainArrayB.length-1] > 0)
                || 
                ( Math.abs(rangeArrayA[0] - rangeArrayA[rangeArrayA.length-1])
                != Math.abs(rangeArrayB[0] - rangeArrayB[rangeArrayB.length-1]) )
              )
            {
                //we do not need to do anythings to support this "dual"
                return;
            }

            //now make sure 
            //1. same tickNum before 0
            //2. same tickNum after 0
            var positiveTickNumA = 0;
            var negativeTickNumA = 0;

            var positiveTickNumB = 0;
            var negativeTickNumB = 0;

            var tickNumA = _scaleA.tickNum; //tickNumA >= const_minTickNum
            var tickNumB = _scaleB.tickNum; //tickNumB >= const_minTickNum

            var intervalA = (domainArrayA[domainArrayA.length-1] - domainArrayA[0])/(tickNumA-1);
            intervalA = parseFloat(intervalA.toFixed(8));

            for(var i = 0; i < tickNumA; i++)
            {
                var tickValue = domainArrayA[0] + i * intervalA;
                if(tickValue > 0)
                {
                    positiveTickNumA++;
                }
                else if(tickValue < 0)
                {
                    negativeTickNumA++;
                }
            }

            var intervalB = (domainArrayB[domainArrayB.length-1] - domainArrayB[0])/(tickNumB-1);
            intervalB = parseFloat(intervalB.toFixed(8));

            for(var i = 0; i < tickNumB; i++)
            {
                var tickValue = domainArrayB[0] + i * intervalB;
                if(tickValue > 0)
                {
                    positiveTickNumB++;
                }
                else if(tickValue < 0)
                {
                    negativeTickNumB++;
                }
            }

            if(positiveTickNumA > positiveTickNumB)
            {
                var moreInterNum = positiveTickNumA - positiveTickNumB;
                if(domainArrayB[0] < domainArrayB[domainArrayB.length-1])
                {
                    domainArrayB[domainArrayB.length-1] += (moreInterNum * Math.abs(intervalB));
                    _scaleB.tickNum += moreInterNum;
                }
                else if(domainArrayB[0] > domainArrayB[domainArrayB.length-1])
                {
                    domainArrayB[0] += (moreInterNum * Math.abs(intervalB));
                    _scaleB.tickNum += moreInterNum;
                }
            }
            else if(positiveTickNumA < positiveTickNumB)
            {
                var moreInterNum = positiveTickNumB - positiveTickNumA;
                if(domainArrayA[0] < domainArrayA[domainArrayA.length-1])
                {
                    domainArrayA[domainArrayA.length-1] += (moreInterNum * Math.abs(intervalA));
                    _scaleA.tickNum += moreInterNum;
                }
                else if(domainArrayA[0] > domainArrayA[domainArrayA.length-1])
                {
                    domainArrayA[0] += (moreInterNum * Math.abs(intervalA));
                    _scaleA.tickNum += moreInterNum;
                }
            }

            //negative values
            if(negativeTickNumA > negativeTickNumB)
            {
                var moreInterNum = negativeTickNumA - negativeTickNumB;
                if(domainArrayB[0] < domainArrayB[domainArrayB.length-1])
                {
                    domainArrayB[0] -= (moreInterNum * Math.abs(intervalB));
                    _scaleB.tickNum += moreInterNum;
                }
                else if(domainArrayB[0] > domainArrayB[domainArrayB.length-1])
                {
                    domainArrayB[domainArrayB.length-1] -= (moreInterNum * Math.abs(intervalB));
                    _scaleB.tickNum += moreInterNum;
                }
            }
            else if(negativeTickNumA < negativeTickNumB)
            {
                var moreInterNum = negativeTickNumB - negativeTickNumA;
                if(domainArrayA[0] < domainArrayA[domainArrayA.length-1])
                {
                    domainArrayA[0] -= (moreInterNum * Math.abs(intervalA));
                    _scaleA.tickNum += moreInterNum;
                }
                else if(domainArrayA[0] > domainArrayA[domainArrayA.length-1])
                {
                    domainArrayA[domainArrayA.length-1] -= (moreInterNum * Math.abs(intervalA));
                    _scaleA.tickNum += moreInterNum;
                }
            }

            //to nice the domainArray, avoid the domain contains 0.00060000001
            domainArrayA[0] = parseFloat(domainArrayA[0].toFixed(8));
            domainArrayA[1] = parseFloat(domainArrayA[1].toFixed(8));
            domainArrayB[0] = parseFloat(domainArrayB[0].toFixed(8));
            domainArrayB[1] = parseFloat(domainArrayB[1].toFixed(8));
            
            _scaleA.domain(domainArrayA);
            _scaleB.domain(domainArrayB);

            _scaleA.tickHint = _scaleA.tickNum -1;
            _scaleB.tickHint = _scaleB.tickNum -1;
        }
    };
    
    return Scaler;
});