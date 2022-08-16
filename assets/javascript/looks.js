import { look } from "./look.js";
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js'
import { getDatabase, set, push, ref, onValue} from "https://www.gstatic.com/firebasejs/9.9.0/firebase-database.js"
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
    onValue(ref(db, "createdLooks/"), function(snapshot) {
        for (let key in snapshot.val()) {
            let savedLook = snapshot.val()[key];
            for (let item in savedLook) {
                let lookComponents = savedLook[item];
                $("#looksDivHolder").append(look(key, lookComponents));
            }
        }
    });

    $(document).on("click", "#scheduleLook",  function() {
        $(".lookBox").append('<div class="datepicker"></div>');
        $(".datepicker").datepicker({
            onSelect: function(datePicked) {
                set(ref(db, "scheduledLooks/" + new Date(datePicked).getTime() + "/"), {
                    dBLookID: $(this).parent().attr("id")
                });
            }
        });
    });
});