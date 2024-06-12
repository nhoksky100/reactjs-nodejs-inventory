import dateFormat from 'dateformat';
export const UpdateDateTime = (setDateTime) => {
    var datetime = null;

    if (!setDateTime) {
        datetime = new Date();
    } else {
        datetime = new Date(setDateTime);
    }
    // set time
    var hours = datetime.getHours();
    // var minutes = datetime.getMinutes();
    var ampm = hours >= 12 ? ' PM' : ' AM';
    var UpdateDateTime = dateFormat(datetime, "dd/mm/yyyy - h:MM") + ampm;
    return UpdateDateTime
}
