// mandala.js, Rob Campbell, 2023, GPL 3

// 2D graphics canvas, context, and center point - for clock's hands
var canvas;
var ctx;
var ctrX;
var ctrY;

// Computed styles
var clockStyle = Object();
var month_color = Array(12);

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
    ctrX = (canvas.width / 2 | 0) + 10;  // TODO Add 10 due to character width? 
    ctrY = canvas.height / 2 | 0;

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
    secs = secs > 30 ? secs - 30 : secs + 30;  // TODO Why? 
    drawHand(clockStyle.secHand, (secs / 60) * -2 * Math.PI);

    // Center circle
    ctx.beginPath();
    ctx.arc(ctrX, ctrY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "lightgray";
    ctx.fill();

    // TODO Advance calendar at midnight

    // TODO Show phase of moon? Dawn? Dusk? - based on loc?
}

function drawClockNumerals() {

    function drawNumeral(ringId, className, degrees, value, height) {
        // Local function to draw numbers on clock face
        var sector = document.createElement('span');
        sector.classList.add('txt', className);
        sector.style.transform = 'rotate(' + degrees + 'deg)';
        sector.style.height = height + 'px';
        sector.textContent = value.toString();
        document.getElementById(ringId).appendChild(sector);
    }

    // TODO Get inner ring heights from css

    // Seconds and minutes
    for (i = 0; i < 60; i++) {
        if (i % 5 === 0) {
            drawNumeral('sixty', 'txtSixtyDigit', i * (360 / 60), i, 350);
        }
        else {
            drawNumeral('sixty', 'txtSixtyTick', i * (360 / 60), "'", 350);
        }
    }

    // Hours, 1-12 ring, 13-24 ring
    for (i = 0; i < 12; i++) {
        drawNumeral('twentyfour', 'txtH', i * (360 / 12), i == 0 ? 24 : i + 12, 300);
        drawNumeral('hours', 'txtH', i * (360 / 12), i == 0 ? 12 : i, 250);
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
                day.style.border = '2px solid ' + month_color[date.getMonth()];  // TODO Use class or id    

                if (date.setHours(0, 0, 0, 0) == (new Date()).setHours(0, 0, 0, 0)) {
                    // Highlight today
                    day.classList.add('currentDayOfMonth');
                }
                else {
                    day.classList.add('dayOfMonth', 'day' + ring);
                }

                // Advance date
                date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            }

            // Build container w/correct orientation, dist. from center
            var sector = document.createElement('span');
            sector.classList.add('txt');
            sector.style.transform = 'rotate(' + week * (360 / 53) + 'deg)';
            sector.style.height = (7 - ring) * 50 + 400 + 'px';  // TODO css
            sector.appendChild(day);

            // Insert container into correct ring
            document.getElementById('ring' + ring).appendChild(sector);
        }

        if (week < 52) {
            // Week number  
            let sec = document.createElement('span');
            sec.classList.add('txt', 'weekNumber');
            sec.style.transform = 'rotate(' + (week * (360 / 52)) + 'deg)';
            sec.style.height = 400 + 'px';  // TODO css
            sec.textContent = (week + 1).toString();
            document.getElementById('week').appendChild(sec);
        }
    }
}

function drawYearAndMonthNames() {
    // Display year and month names in outside ring
    var yearText = '' + (new Date()).getFullYear();
    var outerText = yearText[2] + yearText[3] + month_01_06 + month_07_12 + yearText[0] + yearText[1];
    var outerRing = document.getElementById('outerRing');

    moNum = 0;

    for (i = 0; i < outerText.length; i++) {
        let sector = document.createElement('span');
        sector.style.transform = 'rotate(' + i * (360 / outerText.length) + 'deg)';
        sector.style.height = outerRing.offsetHeight + 'px';
        sector.textContent = outerText[i];

        if (i < 2 || i > outerText.length - 3) {
            // Year digit
            sector.classList.add('txt', 'txtY');
        }
        else {
            sector.classList.add('txt', 'mo' + moNum);
            // TODO style current month using ".txtCurrentMonth"

            if (outerText[i] == '!') {
                // ! = advance to next month number
                moNum += 1;
                sector.textContent = ' ';
            }
        }

        outerRing.appendChild(sector);
    }
}

function getTextsForLanguage() {
    if (navigator.language.startsWith("en")) {
        day_abbrev = ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su'];
        month_01_06 = '   January!    February!     March!        April!         May!          June!    ';  // NOTE spacing
        month_07_12 = '    July!       August!      September!     October!     November!   December!   ';  // NOTE spacing
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

    for (i = 0; i < 12; i++) {
        month_color[i] = computeStyle('mo' + i).color;
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