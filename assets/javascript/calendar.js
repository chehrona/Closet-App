import { look } from "./look.js";

$(document).ready(function() {
    const dateToday = new Date();

    let generatesCalendar = function() {

    const currentMonth = dateToday.getMonth();
    const currentYear = dateToday.getFullYear();

    const firstMonthDate = new Date(dateToday.getFullYear(), dateToday.getMonth(), 1);
    const lastMonthDate = new Date(dateToday.getFullYear(),dateToday.getMonth() + 1, 0).getDate();
    const firstDayIndex = firstMonthDate.getDay();
    const lastDayIndex = new Date(dateToday.getFullYear(),dateToday.getMonth() + 1, 0).getDay();
    
    const prevLastMonthDate = new Date(dateToday.getFullYear(),dateToday.getMonth(), 0).getDate();

    const months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November",
                    "December"];

    $("#currentMonth").html(months[currentMonth]);
    $("#currentYear").html(currentYear);

    let days = "";

    for (let j = firstDayIndex; j > 0; j--) {
        days += '<div class="prev-date">' + (prevLastMonthDate - j + 1) + '</div>';
    }

    for (let i = 1; i <= lastMonthDate; i++) {
        if (i === new Date().getDate() && 
        dateToday.getMonth() === new Date().getMonth() && 
        dateToday.getFullYear() === new Date().getFullYear() ) {
            days += '<div class="today">' + i + '</div>';
        } else {
            days += '<div>' + i + '</div>';
        }
       
    }

    for (let k = 1; k <= (7 - lastDayIndex - 1); k++) {
        days += '<div class="next-date">' + k + '</div>';
        $(".days").html(days);
    }
}

    $(".prev").on("click", function() {
        dateToday.setMonth(dateToday.getMonth() - 1);
        generatesCalendar();
    });

    $(".next").on("click", function() {
        dateToday.setMonth(dateToday.getMonth() + 1);
        generatesCalendar();
    });
    
    generatesCalendar();

    let queryURL = "https://api.openweathermap.org/data/2.5/forecast?lat=43.6534817&lon=-79.3839347&cnt=14&appid=df92d03ba96fd8cc4d1a8c530ce79c67";
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            console.log(response);
        });

        // Get calendar looks from db

        // foreach calendar look
        // $(".calendarBox").html(look(data));
});


