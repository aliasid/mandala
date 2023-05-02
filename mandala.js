// mandala.js, Rob Campbell, 2023, GPL 3

// 2D graphics canvas, context, and center point - for clock's hands
var canvas;
var ctx;
var ctrX;
var ctrY;

// Computed styles
var clockStyle = Object();
var month_color = Array(12);
var day_color = Array(7);

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

function drawClockHands(now) {

    function drawHand(color, width, radius, angle) {
        let outX = (radius * Math.sin(angle));
        let outY = (radius * Math.cos(angle));

        // Circle and end of hand
        ctx.beginPath();
        ctx.arc(ctrX + outX, ctrY + outY, width / 2.3, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();

        // Hand itself
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(ctrX, ctrY);
        ctx.lineTo(ctrX + outX, ctrY + outY);
        ctx.lineWidth = width;
        ctx.stroke();
    }

    // Adjust canvas if window resized
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctrX = (canvas.width / 2 | 0) + 10;  // TODO Add 10 due to character width? 
    ctrY = canvas.height / 2 | 0;

    // Clear existing hands
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Minute hand
    var mins = now.getMinutes();
    mins = mins > 30 ? mins - 30 : mins + 30;  // TODO Why? 
    drawHand(clockStyle.minHand.color, 4, 158, (mins / 60) * -2 * Math.PI);

    // Hours hand   
    var hrs = now.getHours();
    hrs = hrs > 12 ? hrs - 12 : hrs;
    hrs = hrs > 6 ? hrs - 6 : hrs + 6;  // TODO Why? 
    hrs += now.getMinutes() / 60.0;  // Advance slightly based on minute 
    drawHand(clockStyle.hrsHand.color, 10, 103, (hrs / 12) * -2 * Math.PI);

    // Second hand
    var secs = now.getSeconds();
    secs = secs > 30 ? secs - 30 : secs + 30;  // TODO Why? 
    drawHand(clockStyle.secHand.color, 2, 170, (secs / 60) * -2 * Math.PI);

    // Center circle
    ctx.beginPath();
    ctx.arc(ctrX, ctrY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "lightgray";
    ctx.fill();

    // TODO Indicate current week number

    // TODO Advance calendar at midnight

    // TODO Show phase of moon?
}

function drawClockNumerals() {

    function drawNumeral(ringId, className, degrees, value, height) {
        // Local function to draw numbers on clock face

        // Container
        var sector = document.createElement('span');
        sector.classList.add('txt', className);
        sector.style.transform = 'rotate(' + degrees + 'deg)';
        sector.style.height = height.toString() + 'px';

        // Text
        var digit = document.createElement('strong');
        digit.className = className;
        digit.textContent = value.toString();
        sector.appendChild(digit);

        document.getElementById(ringId).appendChild(sector);
    }

    // Week number  TODO Move weeknumber code to calender drawing
    for (i = 0; i < 52; i++) {
        sector = drawNumeral('week', 'txtW', i * (360 / 52), i == 0 ? 1 : i + 1, 399);
    }

    // Seconds
    for (i = 0; i < 60; i++) {
        if (i % 5 === 0) {
            drawNumeral('sixty', 'txtSixtyDigit', i * (360 / 60), i, 350);
        }
        else {
            drawNumeral('sixty', 'txtSixtyTick', i * (360 / 60), "'", 350);
        }
    }

    // 24 hour
    for (i = 0; i < 12; i++) {
        drawNumeral('twentyfour', 'txtH', i * (360 / 12), i == 0 ? 24 : i + 12, 300);
    }

    // 12 hour
    for (i = 0; i < 12; i++) {
        drawNumeral('hours', 'txtH', i * (360 / 12), i == 0 ? 12 : i, 250)
    }
}

function drawCalendar() {
    // TODO Indicate seasons? Via monteh text colors?

    drawYearAndMonthNames();

    // Between innner and outer rings: Start on Jan 1 of current year
    var date = new Date((new Date()).getFullYear(), 0, 1, 23, 59, 59, 000); // Use 11pm to absorb local timezone adjustment
    var start = date.getDay() - 1; // Numeric day of week (starting at zero)

    // Fill 7*(52+1) positions (7 days/week, 52 wks/yr, 1 additional "week" for labels and overlap)
    for (let week = 0; week < 53; week++) {

        for (var ring = 0; ring < 7; ring++) {
            let borderColor;
            let foreColor = 'white';
            let backColor;
            let text = '';
            let bold = false;

            // Prior to Jan 1 or after end-of-year? Fill text with day-of-the-week (name)
            if ((week == 0 && ring < start) || (date.getFullYear() > (new Date()).getFullYear())) {
                text = day_abbrev[ring - 1];

                if (ring === new Date().getDay()) {
                    borderColor = 'red';
                    bold = true;
                }
                else {
                    borderColor = 'White';
                }

                backColor = 'White';
            }

            // Within current year? Fill text with day-of-the-month (number)
            else {
                text = date.getDate();
                borderColor = month_color[date.getMonth()];
                backColor = day_color[ring];

                // Highlight today
                if (date.setHours(0, 0, 0, 0) == (new Date()).setHours(0, 0, 0, 0)) {
                    bold = true;
                    backColor = 'black';
                    foreColor = 'red';
                }

                // Advance date
                date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            }

            // Calc where to place text
            var degrees = week * (360 / 53); // degress in circle / num weeks in a year
            var radius = (7 - ring) * 50 + 400;

            // Build a container with the correct orientation and distance from center
            var sector = document.createElement('span');
            sector.classList.add('txt', 'txtD');
            sector.style.transform = 'rotate(' + degrees + 'deg)';
            sector.style.height = radius + 'px';

            // Fill container with a square holding the day number

            var day = document.createElement('span');
            day.classList.add('txt', 'txtD');
            day.style.color = 'black';
            day.style.backgroundColor = backColor;
            day.style.border = '2px solid ' + borderColor;

            if (bold) {
                let boldText = document.createElement('strong');
                boldText.textContent = text;
                boldText.style.backgroundColor = backColor;
                boldText.style.color = foreColor;
                day.appendChild(boldText);
            }
            else {
                day.textContent = text;
            }

            sector.appendChild(day);

            // Insert new element(s) into correct div
            document.getElementById('ring' + ring).appendChild(sector);
        }
    }
}

function drawYearAndMonthNames() {
    // Display year and month names in outside ring
    var yearText = '' + (new Date()).getFullYear();
    var outerText = yearText[2] + yearText[3] + month_01_06 + month_07_12 + yearText[0] + yearText[1];
    var outerRing = document.getElementById('outerRing');
    
    for (i = 0; i < outerText.length; i++) {
        let sector = document.createElement('span');
        sector.classList.add('txt', 'txtY');
        sector.style.transform = 'rotate(' + i * (360 / outerText.length) + 'deg)';
        sector.style.height = outerRing.offsetHeight + 'px';

        if (i < 2 || i > outerText.length - 3) {
            // Bold year digits
            var yearDigit = document.createElement('strong');
            yearDigit.textContent = outerText[i];
            sector.appendChild(yearDigit);
        }
        else {
            // Month name letters
            sector.textContent = outerText[i];
        }

        outerRing.appendChild(sector);
    }
}

function getTextsForLanguage() {
    if (navigator.language.startsWith("en")) {
        day_abbrev = ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su'];
        month_01_06 = '   January    February     March        April         May          June    ';  // NOTE spacing
        month_07_12 = '    July       August      September     October     November   December   ';  // NOTE spacing
    }
    else {
        // TODO String values for other languages
    }
}

function getComputedStyles() {
    // Set style values (globals)

    function computeStyle(id) {
        var dummy = document.createElement('div');
        dummy.id = id;
        dummy.style.display = 'none';
        document.body.appendChild(dummy);
        var style = getComputedStyle(dummy);
        return style;
    }

    for (i = 0; i < 12; i++) {
        month_color[i] = computeStyle('mo' + i + 'border').color;
    }

    for (i = 0; i < 7; i++) {
        day_color[i] = computeStyle('day' + i + 'background').color;
    }

    clockStyle.secHand = computeStyle('secHand');
    clockStyle.minHand = computeStyle('minHand');
    clockStyle.hrsHand = computeStyle('hrsHand');
}

function getCanvasAndContext() {
    // Set canvas and context (globals)
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');    
}