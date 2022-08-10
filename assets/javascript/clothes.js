import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js'
import { getDatabase, push, ref, onValue} from "https://www.gstatic.com/firebasejs/9.9.0/firebase-database.js"
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL} from "https://www.gstatic.com/firebasejs/9.9.0/firebase-storage.js";

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
const storage = getStorage(app);
const categoryRef = storageRef(storage, 'tops/');
const linksRef = ref(db, "links/");


let imageFromDatabase = null;

$(document).ready(function() {
    onValue(linksRef, function(snapshot) {
        imageFromDatabase = snapshot.val().imageURL;
        
    });

    $(".pageFooter").on("click", function() {
        $(".pickActionPopup").removeClass("disabledPopup");
    });

    $(".uploadPhoto").on("click", function() {
        $(".pickActionPopup").addClass("disabledPopup");
        $(".uploadPicPopup").removeClass("disabledPopup");
    });

    let imageSource = null;
    let reader = null;

    $("#inputField").on("change", function(e) {
        let imageFiles = e.target.files;
        reader = new FileReader();
        reader.onload = function() {
            imageSource = reader.result;
        }
        reader.readAsDataURL(imageFiles[0]);
        uploadBytes(categoryRef, imageFiles[0]).then(function(snapshot) {
            $(".uploadPicPopup").addClass("disabledPopup");
            getDownloadURL(categoryRef).then(function(url) {
                push(ref(db, "links/"), {
                    imageURL: url
                });
            });
            $(".imageList").append('<div class="clothesImageBox"><img src="' + imageFromDatabase + '" class="clothesItem"></div>');
        });
    });
    

    
        
        
    $(".importWeb").on("click", function() {
        $(".pickActionPopup").addClass("disabledPopup");
        
    });


});

