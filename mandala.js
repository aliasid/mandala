// mandala.js, Rob Campbell, 2023, GPL 3

// 2D graphics canvas, context, and center point - for clock's hands
var canvas;
var ctx;
var ctrX;
var ctrY;

// Computed styles
var clockStyle = Object();
var outerRingHeight;
var innerRingsOffset;


// Calendar texts  
var day_abbrev;
var month_01_06;
var month_07_12;

function startUp() {
    // Function called on page load
    getTextsForLanguage();
    getComputedStyles();
    drawCalendar();
    getCanvasAndContext()
    drawClockNumerals();
    tick();  // Start clock running
}

function tick() {
    now = new Date();
    document.getElementById('zulu').innerHTML = now.toISOString();  // Show Zulu time for debugging  
    drawClockHands(now);  // Get updated date & time
    // TODO Update calendar if needed
    setTimeout(tick, 1000);  // Call this function again in 1000ms
}

function calcHeight(ring) {
    return (7 - ring) * innerRingsOffset * 2 + (outerRingHeight / 2) + 'px';
}

function drawClockHands(now) {

    function drawHand(style, angle) {

        // NOTE "height" is actuall radius
        let outX = (parseInt(style.height) * Math.sin(angle));
        let outY = (parseInt(style.height) * Math.cos(angle));

        // Circle and end of hand
        ctx.beginPath();
        ctx.arc(ctrX + outX, ctrY + outY, parseInt(style.width) / 2.3, 0, 2 * Math.PI);
        ctx.fillStyle = style.color;
        ctx.fill();

        // Hand itself
        ctx.strokeStyle = style.color;
        ctx.beginPath();
        ctx.moveTo(ctrX, ctrY);
        ctx.lineTo(ctrX + outX, ctrY + outY);
        ctx.lineWidth = parseInt(style.width);
        ctx.stroke();
    }

    // Adjust canvas if window resized
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctrX = (canvas.width / 2 | 0) + clockHorzAdj; 
    ctrY = (canvas.height / 2 | 0) + clockVertAdj; 

    // Clear existing hands
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Minute hand
    var mins = now.getMinutes();
    mins = mins > 30 ? mins - 30 : mins + 30;  // TODO Why? 
    drawHand(clockStyle.minHand, (mins / 60) * -2 * Math.PI);

    // Hours hand   
    var hrs = now.getHours();
    hrs = hrs > 12 ? hrs - 12 : hrs;
    hrs = hrs > 6 ? hrs - 6 : hrs + 6;  // TODO Why? 
    hrs += now.getMinutes() / 60.0;  // Advance slightly based on minute 
    drawHand(clockStyle.hrsHand, (hrs / 12) * -2 * Math.PI);

    // Second hand
    
    var secs = now.getSeconds();
    var prev = secs < 1 ? 59 : secs - 1;
    var prevTxt = prev % 5 === 0 ? prev.toString() : "'";
    document.getElementById('sixty'+prev).textContent = prevTxt;    
    document.getElementById('sixty'+secs).textContent = secs.toString();    
    
    if (boolDisplaySecondHand !== 0) {
        secs = secs > 30 ? secs - 30 : secs + 30;  // TODO Why? 
        drawHand(clockStyle.secHand, (secs / 60) * -2 * Math.PI);
    }
    
    // Center circle
    ctx.beginPath();
    ctx.arc(ctrX, ctrY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "lightgray";
    ctx.fill();

    // TODO Advance calendar at midnight

    // TODO Show phase of moon? Dawn? Dusk? - based on loc?
}

function drawClockNumerals() {

    function drawNumeral(ringId, className, degrees, value, height, elementId) {
        // Local function to draw numbers on clock face
        var elem = document.createElement('span');
        elem.classList.add('txt', className);
        elem.style.transform = 'rotate(' + degrees + 'deg)';
        elem.style.height = height; 
        elem.textContent = value.toString();
        elem.setAttribute('id', ringId.toString() + elementId);
        document.getElementById(ringId).appendChild(elem);
    }

    // Seconds and minutes - ring 8
    for (i = 0; i < 60; i++) {
        if (i % 5 === 0) {
            drawNumeral('sixty', 'txtSixtyDigit',  i * (360 / 60), i, calcHeight(8), i); 
        }
        else {
            drawNumeral('sixty', 'txtSixtyTick', i * (360 / 60), "'", calcHeight(8), i); 
        }
    }

    // Hours, 1-12 ring, 13-24 ring - rings 9 and 10
    for (i = 0; i < 12; i++) {
        drawNumeral('twentyfour', 'hour', i * (360 / 12), i == 0 ? 24 : i + 12, calcHeight(9), i + 12); 
        drawNumeral('hours', 'hour', i * (360 / 12), i == 0 ? 12 : i, calcHeight(10), i); 
    }

}

function drawCalendar() {
    drawYearAndMonthNames();

    // Between innner and outer rings: Start on Jan 1 of current year
    var date = new Date((new Date()).getFullYear(), 0, 1, 23, 59, 59, 000); // Use 11pm to absorb local timezone adjustment
    var start = date.getDay() - 1; // Numeric day of week (starting at zero)

    // Fill 7*(52+1) positions (7 days/week, 52 wks/yr, 1 additional "week" for labels and overlap)
    for (let week = 0; week < 53; week++) {

        for (var ring = 0; ring < 7; ring++) {

            // Creat a square to hold text, either day number or day of week)
            var day = document.createElement('span');
            day.classList.add('txt');

            if ((week == 0 && ring < start) || (date.getFullYear() > (new Date()).getFullYear())) {
                // Prior to Jan 1 or after end-of-year: day-of-the-week (name)

                day.textContent = day_abbrev[ring - 1];

                if (ring === new Date().getDay()) {
                    day.classList.add('currentDayOfWeek');
                }
                else {
                    day.classList.add('dayOfWeek');
                }
            }
            else {
                // Day-of-the-month (number)

                day.textContent = date.getDate();
                day.classList.add('mo' + date.getMonth(), 'dayNumber');  // mo = color; dayNumber = border width & style

                if (date.setHours(0, 0, 0, 0) == (new Date()).setHours(0, 0, 0, 0)) {
                    // Highlight today
                    day.classList.add('currentDayOfMonth');
                }
                else {
                    day.classList.add('dayOfMonth', 'day' + ring);  // day = background
                }

                // Advance date
                date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            }

            // Build container w/correct orientation, dist. from center
            var sector = document.createElement('span');
            sector.classList.add('txt');
            sector.style.transform = 'rotate(' + week * (360 / 53) + 'deg)';
            sector.style.height = calcHeight(ring);   
            sector.appendChild(day);

            // Insert container into correct ring
            document.getElementById('ring' + ring).appendChild(sector);
        }

        if (week < 52) {
            // Week number  
            let sec = document.createElement('span');
            sec.classList.add('txt', 'weekNumber');
            sec.style.transform = 'rotate(' + (week * (360 / 52)) + 'deg)';
            sec.style.height = (outerRingHeight / 2) + 'px';
            sec.textContent = (week + 1).toString();
            document.getElementById('week').appendChild(sec);
        }
    }
}

function drawYearAndMonthNames() {
    // Display year and month names in outside ring
    var now = new Date();
    var yearText = '' + now.getFullYear();
    var outerText = yearText[2] + yearText[3] + month_01_06 + month_07_12 + yearText[0] + yearText[1];

    moNum = 0;

    for (i = 0; i < outerText.length; i++) {
        let sector = document.createElement('span');
        sector.style.transform = 'rotate(' + i * (360 / outerText.length) + 'deg)';
        sector.style.height = outerRingHeight + 'px';
        sector.textContent = outerText[i];

        if (i < 2 || i > outerText.length - 3) {
            // Year digit
            sector.classList.add('txt', 'year');
        }
        else {
            sector.classList.add('txt', 'mo' + moNum + 'name');

            if (moNum === now.getMonth()) {
                sector.classList.add('txt', 'txtCurrentMonth');
            }

            if (outerText[i] == '|') {
                // advance to next month number
                moNum += 1;
                sector.textContent = ' ';
            }
        }

        document.getElementById('outerRing').appendChild(sector);
    }
}

function getTextsForLanguage() {
    if (navigator.language.startsWith("en")) {
        day_abbrev = ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su'];
        month_01_06 = '   January  |  February  |   March    |   April     |    May    |   June       |';  // NOTE spacing
        month_07_12 = '    July    |   August   |  September   |   October  |  November  |  December   ';  // NOTE spacing
    }
    else {
        // TODO String values for other languages
    }
}

function getComputedStyles() {
    // Set style values (globals)

    function computeStyle(className) {
        var dummy = document.createElement('div');
        dummy.classList.add(className);
        dummy.style.display = 'none';
        document.body.appendChild(dummy);
        var style = getComputedStyle(dummy);
        return style;
    }

    clockStyle.secHand = computeStyle('secHand');
    clockStyle.minHand = computeStyle('minHand');
    clockStyle.hrsHand = computeStyle('hrsHand');

    rootStyles = getComputedStyle(document.documentElement);
    outerRingHeight = parseFloat(rootStyles.getPropertyValue('--outerRingHeight'));
    innerRingsOffset = parseFloat(rootStyles.getPropertyValue('--innerRingsOffset'));
    clockHorzAdj = parseInt(rootStyles.getPropertyValue('--clockHorzAdj'));
    clockVertAdj = parseInt(rootStyles.getPropertyValue('--clockVertAdj'));
    boolDisplaySecondHand = parseInt(rootStyles.getPropertyValue('--boolDisplaySecondHand'));
}

function getCanvasAndContext() {
    // Set canvas and context (globals)
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
}