import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js'
import { getDatabase, set, push, ref, onValue} from "https://www.gstatic.com/firebasejs/9.9.0/firebase-database.js"
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


let imageName = "";
let imageSource = null;
let reader = null;
let imageFile = null;
let categoryName = "";
let pickedColorList = [];
let itemsChosenForLooks = [];
let lookToSave = {};
let lookBoardWidth = $("#lookMakerBoard").width();
let lookBoardHeight = $("#lookMakerBoard").height();
let categoryIcon = null;
let customIcon = null;
let customCategoryName = null;

$(document).ready(function() {

    // Updates category list everytime a new category is added to the list
    onValue(ref(db, "addedCategories"), function(snapshot) {
        $(".categoryList").empty();
        $(".defaultCategories").contents(':not(".customCategory")').remove();
        for (let item in snapshot.val()) {
            let categoryIconFromDb = snapshot.val()[item].icon;
            let categoryNameFromDb = item;        
            $(".categoryList").append('<div class="categoryName">' + '<img src="' + 
                            categoryIconFromDb + '" class="iconImage">' + categoryNameFromDb + '</div>');

            $(".defaultCategories").append('<div id="' + categoryNameFromDb +
                        '" class="pickCategory"><img src="' + categoryIconFromDb +'" class="popupIcon">'
                        + categoryNameFromDb + '</div>');
        }
    });

    // Updates image board list everytime a new item is added to the list
    onValue(ref(db, "clothesItems"), function(snapshot) {
        $(".imageList").empty();
        let categories = snapshot.val(); 
        for (let category in categories) {
            let images = categories[category];
            for (let image in images) {
                let imageURLDb = images[image].imageURL;
                let imageNameFromDb = images[image].name;
                $(".imageList").append('<div class="clothesImageBox" name=">' + imageNameFromDb + '" >' + 
                                    '<img src="' + imageURLDb + '" class="clothesItem removeSelected">' + 
                                    '<i class="fa-solid fa-pen-to-square penEdit"></i>' + 
                                    '<i class="fa-solid fa-trash-can deleteImage"></i>' + 
                                    '<div class="deleteImagePopup disabledPopup">Delete</div></div>'); 
                }
            }
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
        let imageFiles = e.target.files;
        reader = new FileReader();
        reader.onload = function() {
            imageSource = reader.result;
            $(".uploadPicPopup").addClass("disabledPopup");
            $(".addPicPopup").removeClass("disabledPopup");
            $(".showPickedImage").append("<img class='pickedImage' src='" + imageSource + "'/>");
            $(".mainBody").addClass("outOfFocus");
        }
        imageFile = imageFiles[0];
        reader.readAsDataURL(imageFile);
        imageName = (Math.floor(Math.random() * 100)).toString() + imageFile.name;
        $(this).val("");
    });

    $("#nextButton").on("click", function() {
        $(".saveToPopup").removeClass("disabledPopup");
        resetsImportImagePopup();
        $(".mainBody").addClass("outOfFocus");
    });

    $("#cancelButton").on("click", function() {
        resetsImportImagePopup();
    });

    // *************** CATEGORY AND COLORS POPUP *********************
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
    });

    $(".iconPic").on("click", function() {
        customIcon = $(this).attr("src");
        setTimeout(function() {
            $(".iconDropMenu").addClass("disabledPopup");
        }, 200);

        let newCategoryDiv = $('<div id="' + customCategoryName +
        '" class="pickCategory"><img src="' + customIcon +'" class="popupIcon">'
        + customCategoryName + '</div>');

        $(".customCategory").after(newCategoryDiv); 
    });

    $(document).on("click", ".pickCategory", function() {
        categoryName = $(this).attr("id");
        categoryIcon = $(this).find("img").attr("src");
        
        if ($(".pickCategory").hasClass("categoryPicked")) {
            $(".pickCategory").removeClass("categoryPicked");
        }
        
        $(this).addClass("categoryPicked");
        
        categoryRef = storageRef(storage, categoryName + "/" + imageName);

    });

    $(".colorCircle").on("click", function() {
        $(this).removeClass("removeWhenSelected");
        let color = $(this).attr("id");
        if ($(this).hasClass("colorPicked")) {
            $(this).removeClass("colorPicked");
            $(this).addClass("removeWhenSelected");
            pickedColorList.splice(pickedColorList.indexOf(color), 1);
            if (pickedColorList.length < 3) {
                $(".removeWhenSelected").removeClass("disabledButton");
            }
        } else {
            $(this).addClass("colorPicked");
            pickedColorList.push(color);
        }

        if (pickedColorList.length === 3) {
            $(".removeWhenSelected").addClass("disabledButton");
        }

        $("#doneButton").removeClass("disabledButton");
    });

    $("#doneButton").on("click", function() {
        uploadBytes(categoryRef, imageFile).then(function(snapshot) {
        getDownloadURL(categoryRef).then(function(url) {
            push(ref(db, "clothesItems/" + categoryName + "/"), {
                imageURL: url,
                name: imageName,
                colors: pickedColorList
                });
            }); 
        });

        set(ref(db, "addedCategories/" + categoryName), {
            icon: categoryIcon
            });

        resetsSaveToPopup();
    });

    $("#cancelCatButton").on("click", function() {
        resetsSaveToPopup();    
    });

    // Selecting items for creating looks
    $(document).on("click", ".clothesItem", function() {
        let sourceOfImage = $(this).attr("src");
        if (itemsChosenForLooks.indexOf(sourceOfImage) !== -1) {
            $(this).removeClass("itemsSelected");
            $(this).addClass("removeSelected");
            itemsChosenForLooks.splice(itemsChosenForLooks.indexOf(sourceOfImage), 1);
        } else {
            $(this).addClass("itemsSelected");
            $(this).removeClass("removeSelected");
            itemsChosenForLooks.push(sourceOfImage);
        }
        
        if (itemsChosenForLooks.length !== 0 && itemsChosenForLooks.length <= 10) {
            $("#addToLookButton").removeClass("disabledButton");
            $(".removeSelected").removeClass("outOfFocus");
        } else if (itemsChosenForLooks.length > 10) {
            $("#addToLookButton").addClass("disabledButton");
            $(".removeSelected").addClass("outOfFocus");
        }
    })
    
    // Gets the images and saves them to be passed to 'create looks' board
    $("#addToLookButton").on("click", function() {
        $(".clothesItem").removeClass("itemsSelected");
        $(".createLooksPopup").removeClass("disabledPopup");
        for (let i = 0; i < itemsChosenForLooks.length; i++) {
            let lookItemElement = $('<img class="lookItem" draggable="true"' +
                                'id="' + i + '" src="' + itemsChosenForLooks[i] + '">');
            // Adds selected items to the side bar
            $("#selectedItemsPreview").append(lookItemElement);
        }   
    });

    // **************** CREATE LOOK POPUP ***************************
    // Triggered when the item is being dragged away from the side bar
    let toDragItemURL = null;
    let toDragItemID = null;
    $(document).on("dragstart", ".lookItem", function(ev) {
        toDragItemURL = $(this).attr("src");
        toDragItemID = $(this).attr("id");
        ev.originalEvent.dataTransfer.setData("dragItemImageURL", toDragItemURL);
        ev.originalEvent.dataTransfer.setData("dragItemID", toDragItemID);
    });

    // Prevents auto drop at the board
    $("#lookMakerBoard").on("dragover", function(ev) {
        ev.preventDefault();
    });

    // When the item is dropped, it is appended to the board and that item is hidden
    // from the side bar
    $("#lookMakerBoard").on("drop", function(ev) {
        ev.preventDefault();
        let draggedImageSource = ev.originalEvent.dataTransfer.getData("dragItemImageURL");
        let draggedItemID = ev.originalEvent.dataTransfer.getData("dragItemID");
        let draggedItemElem = $('<img class="draggedItem" src="' + draggedImageSource + '">');
        
        // Keeps the newly dropped item still draggable and saves its position as % relative 
        // to its parent div (#lookMakerBoard)
        draggedItemElem.draggable({
            stop:function(e, ui) {
                lookToSave[draggedItemID] = [draggedImageSource, 
                                            (ui.position.top/lookBoardHeight)*100, 
                                            (ui.position.left/lookBoardWidth)*100];
            }
        });
        $(this).append(draggedItemElem);

        // Hides the dragged element from the side bar
        $("img[id='" + draggedItemID + "']").addClass("hideAfterDrag");
    });

    $("#saveLookButton").on("click", function(e) {
        e.preventDefault();
        console.log(lookToSave);
        push(ref(db, "createdLooks/"), {
            lookToSave
        });
        
        resetsCreateLookPopup();
    });

    $("#cancelLookButton").on("click", function() {
        resetsCreateLookPopup();
    });

    // ***************** DELETE AND EDIT BUTTONS ON IMAGES *****************
    $(document).on("click", ".deleteImage", function() {
        let parentDiv = $(this).parent();
        parentDiv.addClass("imageSelected");
        let deletePopup = $(".imageSelected").find(".deleteImagePopup");
        deletePopup.removeClass("disabledPopup");
    });
    
    $(document).on("click", ".deleteImagePopup", function() {
        console.log(imageName)
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

    // Resets preview image page
    let resetsImportImagePopup = function() {
        $(".mainBody").removeClass("outOfFocus");
        $(".addPicPopup").addClass("disabledPopup");
        $(".pickIcon").addClass("disabledPopup");
        $(".showPickedImage").empty();
    }

    let resetsSaveToPopup = function () {
        $(".mainBody").removeClass("outOfFocus");
        $("#customCategoryName").attr("disabled", false); 
        $(".saveToPopup").addClass("disabledPopup");
        $(".pickCategory").removeClass("disabledButton");
        $(".pickCategory").removeClass("categoryPicked");
        $(".iconDropMenu").addClass("disabledPopup");
        $(".downIcon").addClass("disabledButton");
        $("#customCategoryName").val("");
        $(".colorCircle").removeClass("colorPicked");
        $(".colorCircle").addClass("removeWhenSelected");
        $("#doneButton").addClass("disabledButton");
        pickedColorList = [];   
    }

    let resetsCreateLookPopup = function() {
        $(".createLooksPopup").addClass("disabledPopup");
        $("#selectedItemsPreview").empty();
        $("#lookMakerBoard").empty();
        itemsChosenForLooks = [];
        lookToSave = {};
    }
});

