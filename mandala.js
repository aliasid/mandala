jQuery(document).ready(function ($) {
    digitalClock();
    calendar();
    analogClock();
});

function digitalClock() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var ampm = 'AM';
    h <= 12 ? ampm = 'PM' : h -= 12;
    m < 10 ? m = '0' + m : m;
    document.getElementById('clock').innerHTML = h + ":" + m + ' ' + ampm;
    var t = setTimeout(function () { digitalClock() }, 30000);
}

function digit(degrees, value, height, id) {
    // Container
    var sector = document.createElement('span');
    sector.className = 'cal';
    sector.style.transform = 'rotate(' + degrees + 'deg)';
    sector.style.height = height.toString() + 'px';

    // Text
    var digit = document.createElement('strong');
    digit.textContent = value.toString();
    sector.appendChild(digit);

    document.getElementById(id).appendChild(sector);
}

function analogClock() {
    // Display clock in inner ring

    // Week number
    for (i = 0; i < 52; i++) {
        digit(i * (360 / 52), i == 0 ? 1 : i + 1, 399, 'week')
    }

    // Seconds
    for (i = 0; i < 60; i++) {
        digit(i * (360 / 60), i, 350, 'sixty')
    }

    // 12 hour
    for (i = 0; i < 12; i++) {
        digit(i * (360 / 12), i == 0 ? 12 : i, 300, 'hours')
    }

    // 24 hour
    for (i = 0; i < 12; i++) {
        digit(i * (360 / 12), i == 0 ? 24 : i + 12, 250, 'twentyfour')
    }
}

function calendar() {

    // Display year and month names in outside ring
    var yearText = '' + (new Date()).getFullYear();
    var outerText = yearText[2] + yearText[3];
    outerText += '   January    February     March        April         May          June    ';
    outerText += '    July       August      September     October     November   December   ';
    outerText += yearText[0] + yearText[1]
    for (i = 0; i < outerText.length; i++) {
        var degrees = i * (360 / outerText.length);

        var sector = document.createElement('span');
        sector.className = 'cal';
        sector.style.transform = 'rotate(' + degrees + 'deg)';
        sector.style.height = '800px';

        if (i < 2 || i > outerText.length - 3) {
            var yearDigit = document.createElement('strong');
            yearDigit.textContent = outerText[i];
            sector.appendChild(yearDigit);
        }
        else {
            sector.textContent = outerText[i];
        }
        document.getElementById('outer').appendChild(sector);
    }

    analogClock();

    // Between innner and outer rings: Start on Jan 1 of current year
    var date = new Date((new Date()).getFullYear(), 0, 1, 23, 59, 59, 000); // Use 11pm to absorb local timezone adjustment
    var start = date.getDay() - 1; // Numeric day of week (starting at zero)

    // Fill 7*(52+1) positions (7 days/week, 52 wks/yr, 1 additional "week" for labels and overlap)
    for (var week = 0; week < 53; week++) {
        for (var ring = 0; ring < 7; ring++) {

            var borderColor;
            var backColor;
            var text = '';
            var bold = false;

            // Prior to Jan 1 or after end-of-year? Fill text with day-of-the-week (name)
            if ((week == 0 && ring < start) || (date.getFullYear() > (new Date()).getFullYear())) {
                var DAY_ABBREV = ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su'];
                text = DAY_ABBREV[ring];
                bold = true;
                borderColor = 'White';
                backColor = 'White';
            }

            // Within current year? Fill text with day-of-the-month (number)
            else {
                var MONTH_COLOR = ['Teal', 'Green', 'LightGreen', 'SpringGreen', 'GreenYellow', 'Yellow', 'Orange', 'SandyBrown', 'Brown', 'SaddleBrown', 'Purple', 'Navy'];
                var DAY_COLOR = ['LightGray', 'DarkGray', 'Gray', 'DarkGray', 'LightGray', 'DarkGray', 'Gray'];
                text = date.getDate();
                borderColor = MONTH_COLOR[date.getMonth()];
                backColor = DAY_COLOR[ring];

                // Highlight today
                if (date.setHours(0, 0, 0, 0) == (new Date()).setHours(0, 0, 0, 0)) {
                    backColor = borderColor;
                }

                // Advance date
                date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            }

            // Calc where to place text
            var degrees = week * (360 / 53); // degress in circle / num weeks in a year
            var radius = (7 - ring) * 50 + 400;

            // Build a container with the correct orientation and distance from center
            var sector = document.createElement('span');
            sector.className = 'cal';
            sector.style.transform = 'rotate(' + degrees + 'deg)';
            sector.style.height = radius + 'px';

            // Fill container with a square holding the day number
            var day = document.createElement('span');
            day.className = 'cal';
            day.style.color = 'black';
            day.style.backgroundColor = backColor;
            day.style.border = '2px solid ' + borderColor;
            if (bold) {
                var boldText = document.createElement('strong');
                boldText.textContent = text;
                day.appendChild(boldText);
            }
            else {
                day.textContent = text;
            }
            sector.appendChild(day);

            // Insert new element(s) into correct div
            document.getElementById('div' + ring).appendChild(sector);
        }
    }
}

