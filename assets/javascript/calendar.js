import { look } from "./look.js";
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js'
import { getDatabase, set, push, ref, get} from "https://www.gstatic.com/firebasejs/9.9.0/firebase-database.js"

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBADzc7z8CWQtVClO68p2zXZUs6Bc-D_Ss",
    authDomain: "closet-e1cb1.firebaseapp.com",
    databaseURL: "https://closet-e1cb1-default-rtdb.firebaseio.com",
    projectId: "closet-e1cb1",
    storageBucket: "closet-e1cb1.appspot.com",
    messagingSenderId: "111891866061",
    appId: "1:111891866061:web:bd466fe92200669a886484"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

$(document).ready(function() {
    const dateToday = new Date();
    const months = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November",
                        "December"];
                        

    let generatesCalendar = function() {

        const currentMonth = dateToday.getMonth();
        const currentYear = dateToday.getFullYear();

        const firstMonthDate = new Date(dateToday.getFullYear(), dateToday.getMonth(), 1);
        const lastMonthDate = new Date(dateToday.getFullYear(),dateToday.getMonth() + 1, 0).getDate();
        const firstDayIndex = firstMonthDate.getDay();
        const lastDayIndex = new Date(dateToday.getFullYear(),dateToday.getMonth() + 1, 0).getDay();
        
        const prevLastMonthDate = new Date(dateToday.getFullYear(),dateToday.getMonth(), 0).getDate();

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
                days += '<div class="today this-month" data=' 
                + i + '><div class="dates">' + i + '</div></div>';
            } else {
                days += '<div class="this-month" data=' + i + 
                '><div class="dates">' + i + '</div></div>';
            }
        }


        for (let k = 1; k <= (7 - lastDayIndex - 1); k++) {
            days += '<div class="next-date">' + k + '</div>';
            $(".days").html(days);
        }

        let createdLookBulk = null;
        get(ref(db, "createdLooks/")).then(function(snap) {
            createdLookBulk = snap.val();
        });


        get(ref(db, "scheduledLooks/")).then(function(snapshot) {
            let lookDate = null;
            for (let time in snapshot.val()) {
                let lookIDFromDb = snapshot.val()[time].dBLookID;
                lookDate = new Date(parseInt(time));
                let lookView = look(lookIDFromDb, createdLookBulk[lookIDFromDb].lookToSave);
    
                let currentMonthName = $("#currentMonth").text();
                let currentYearValue = $("#currentYear").text();
        
                if (months.indexOf(currentMonthName) === lookDate.getMonth()
                    && currentYearValue == lookDate.getFullYear()) {
                        // console.log($(".this-month[data='" + lookDate.getDate() + "']"));
                        $(".this-month[data='" + lookDate.getDate() + "']").append(lookView);
                    };
            }
            // console.log($(".days"));
        });
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

    // let queryURL = "https://api.openweathermap.org/data/2.5/forecast?lat=43.6534817&lon=-79.3839347&cnt=14&appid=df92d03ba96fd8cc4d1a8c530ce79c67";
    //     $.ajax({
    //         url: queryURL,
    //         method: "GET"
    //     }).then(function (response) {
    //         console.log(response);
    //     });

    // Get scheduled looks from the db

   
});


