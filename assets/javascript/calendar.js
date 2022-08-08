$(document).ready(function() {
    const dateToday = new Date();
    const currentMonth = dateToday.getMonth();
    const currentYear = dateToday.getFullYear();

    const lastMonthDay = new Date(dateToday.getFullYear(),dateToday.getMonth() + 1, 0).getDate();
    
    const months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November",
                    "December"];

    $("#currentMonth").html(months[currentMonth]);
    $("#currentYear").html(currentYear);

    let days = "";

    for (let i = 1; i <= lastMonthDay; i++) {
        days += '<div>' + i + '</div>';
        $(".days").html(days);
    }
})


