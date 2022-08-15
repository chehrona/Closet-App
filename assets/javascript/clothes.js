import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js'
import { getDatabase, push, ref, onValue} from "https://www.gstatic.com/firebasejs/9.9.0/firebase-database.js"
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject} from "https://www.gstatic.com/firebasejs/9.9.0/firebase-storage.js";

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
let categoryRef = "";


let imageURLDb = null;
let imageNameFromDb = null;
let imageName = "";
let imageSource = null;
let reader = null;
let imageFile = null;
let categoryName = "";
let pickedColorList = [];
let itemsChosenForLooks = [];
let customIcon = null;
let customCategoryName = null;

$(document).ready(function() {
    onValue(ref(db), function() {
        $(".imageList").empty();
        let queryURL = "https://closet-e1cb1-default-rtdb.firebaseio.com/.json";
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            for (let category in response) {
                for (let key in response[category]) {
                    imageURLDb = response[category][key].imageURL;
                    imageNameFromDb = response[category][key].name;
                    $(".imageList").append('<div class="clothesImageBox" name=">' + imageNameFromDb + '" >' + 
                                    '<img src="' + imageURLDb + '" class="clothesItem removeWhenSelected">' + 
                                    '<i class="fa-solid fa-pen-to-square penEdit"></i>' + 
                                    '<i class="fa-solid fa-trash-can deleteImage"></i>' + 
                                    '<div class="deleteImagePopup disabledPopup">Delete</div></div>'); 
                    }
                }
            });
    });
    
    // When add item is clicked, a popup with either import from web or computer comes up
    $(".pageFooter").on("click", function() {
        $(".pickActionPopup").removeClass("disabledPopup");
    });

    $(".uploadPhoto").on("click", function() {
        $(".pickActionPopup").addClass("disabledPopup");
        $(".uploadPicPopup").removeClass("disabledPopup");
    });

    // When 'choose file' input content changes, a new popup comes up before saving
    $("#inputField").on("change", function(e) {
        $(".showPickedImage").empty();
        let imageFiles = e.target.files;
        reader = new FileReader();
        reader.onload = function() {
            imageSource = reader.result;
            $(".uploadPicPopup").addClass("disabledPopup");
            $(".addPicPopup").removeClass("disabledPopup");
            $(".showPickedImage").append("<img class='pickedImage' src='" + imageSource + "'/>");
        }
        imageFile = imageFiles[0];
        reader.readAsDataURL(imageFile);
        imageName = (Math.floor(Math.random() * 100)).toString() + imageFile.name;
        $(this).val("");
    });

    $("#nextButton").on("click", function() {
        $(".addPicPopup").addClass("disabledPopup");
        $(".saveToPopup").removeClass("disabledPopup");
        $(".pickIcon").addClass("disabledPopup");
    });

    $("#cancelButton").on("click", function() {
        $(".addPicPopup").addClass("disabledPopup");
    });

    $(".pickCategory").on("click", function() {
        categoryName = $(this).attr("id");
        
        if (categoryName) {
            $(this).removeClass("categoryPicked");
        } else {
            $(this).addClass("categoryPicked");
        }

        // $(this).removeClass("disabledButton");
        

        categoryRef = storageRef(storage, categoryName + "/" + imageName);
    });

    $(".downIcon").on("click", function() {
        $(".iconDropMenu").removeClass("disabledPopup");
    });


    $("#customCategoryName").keypress(function(e) {
        if (e.keyCode != "13") {
            return;
        }

        customCategoryName = $(this).val();
        $(".downIcon").removeClass("disabledButton");
        $("#customCategoryName").val("");
        $("#customCategoryName").attr("disabled", true);        
    
    });

    $(".iconPic").on("click", function() {
        customIcon = $(this).attr("src");
        setTimeout(function() {
            $(".iconDropMenu").addClass("disabledPopup");
        }, 200);

        $(".downIcon").addClass("disabledButton");

        $(".customCategory").after('<div id="' + customCategoryName +
                            '" class="pickCategory"><img src="' + customIcon +'" class="popupIcon">'
                            + customCategoryName + '</div>');
        
        $()
    });

    $(".colorCircle").on("click", function() {
        $(this).addClass("colorPicked");
        let color = $(this).attr("id");
        pickedColorList.push(color);
        if (pickedColorList.length === 3) {
            $(".colorCircle").addClass("disabledButton");
        }
        $("#doneButton").removeClass("disabledButton");
    });

 
    $("#doneButton").on("click", function() {
        $(".saveToPopup").addClass("disabledPopup");
        if (!customCategoryName) {
            uploadBytes(categoryRef, imageFile).then(function(snapshot) {
            getDownloadURL(categoryRef).then(function(url) {
                push(ref(db, categoryName + "/"), {
                    imageURL: url,
                    name: imageName,
                    colors: pickedColorList
                });
                } else {
                    push(ref(db, customCategoryName + "/"), {
                        imageURL: url,
                        name: imageName,
                        colors: pickedColorList
                    });
                }
                
            }); 
        });
    });

    $("#cancelCatButton").on("click", function() {
        $(".saveToPopup").addClass("disabledPopup");
        $(".pickCategory").removeClass("disabledButton");
        $(".pickCategory").removeClass("categoryPicked");
        $(".colorCircle").removeClass("colorPicked");
        $("#doneButton").addClass("disabledButton");
    });
    
    $(document).on("click", ".deleteImage", function() {
        let parentDiv = $(this).parent();
        parentDiv.addClass("imageSelected");
        let deletePopup = $(".imageSelected").find(".deleteImagePopup");
        deletePopup.removeClass("disabledPopup");
    });
    

    $(document).on("click", ".deleteImagePopup", function() {
        console.log(imageName)
    });

    $(document).on("click", ".clothesItem", function() {
        let sourceOfImage = $(this).attr("src");
        if (itemsChosenForLooks.indexOf(sourceOfImage) !== -1) {
            $(this).removeClass("itemsSelected");
            $(this).addClass("removeWhenSelected");
            itemsChosenForLooks.splice(itemsChosenForLooks.indexOf(sourceOfImage), 1);
        } else {
            $(this).addClass("itemsSelected");
            $(this).removeClass("removeWhenSelected");
            itemsChosenForLooks.push(sourceOfImage);
        }
        
        if (itemsChosenForLooks.length !== 0 && itemsChosenForLooks.length <= 10) {
            $("#addToLookButton").removeClass("disabledButton");
            $(".removeWhenSelected").removeClass("outOfFocus");
        } else if (itemsChosenForLooks.length > 10) {
            $("#addToLookButton").addClass("disabledButton");
            $(".removeWhenSelected").addClass("outOfFocus");
        }
    })
        
    $("#addToLookButton").on("click", function() {
        $(".createLooksPopup").removeClass("disabledPopup");
        for (let i = 0; i < itemsChosenForLooks.length; i++) {
            let lookItemElement = $('<img class="lookItem" id="' + i + 
            '" src="' + itemsChosenForLooks[i] + '">');
            lookItemElement.draggable();
            $("#lookMakerBoard").append(lookItemElement);
        }   
    });


    

      
    
    

        
    $(".importWeb").on("click", function() {
        $(".pickActionPopup").addClass("disabledPopup");
        // $(".importPopup").removeClass("disabledPopup");
    //     $(".mainBody").addClass("outOfFocus");
        
    });


    // $("#urlInputField").on("click", function(e) {
    //     e.preventDefault();
    //     $(".fa-circle-xmark").removeClass("disabledPopup");
    //     $(".fa-circle-xmark").on("click", function() {
    //         $("#urlInputField").val("");
    //     });
    // });

    // $("#urlInputField").keypress(function(e) {
    //     if (e.keyCode != "13") {
    //         return;
    //     }

    //     let enteredURL = $(this).val();
    //     console.log(enteredURL);
    //     $(".clipperInstructions").addClass("disabledPopup");
    //     $(".externalPage").removeClass("disabledPopup");
    //     $(".externalPage").load(enteredURL);
    // })

    

});

