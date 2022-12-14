let look = function(key, data) {
    let dataURL = null;
    let dataTop = null;
    let dataLeft = null;
    

    let lookBox = $("<div class='lookBox' id='" + key + "'><i class='fa-solid fa-calendar-day lookButtons scheduleLook'></i>" +
                    "<i class='fa-solid fa-pen-to-square editLook lookButtons'></i>" + 
                    "<i class='fa-solid fa-trash-can deleteLook lookButtons'></i></div>");

    for (let i = 0; i < data.length; i++) {
        dataURL = data[i][0];
        dataTop = data[i][1];
        dataLeft = data[i][2];
        let image = $('<img src="' + dataURL + '" data-top=' + dataTop + ' data-left=' + dataLeft + '>');
        image.css({"top": dataTop + "%", "left": dataLeft + "%"})
        lookBox.append(image);
    }

    lookBox.append('<div class="datePicker disabledCal"></div>');
    return (
        lookBox
    );
};

export { look };