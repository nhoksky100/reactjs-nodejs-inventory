import { UpdateDateTime } from "./UpdateDateTime";

// coverDate=(dateString)=>{
//     // Tách ngày và giờ
//     let [datePart, timePart] = dateString.split(' - ');

//     // Chuyển đổi ngày giờ từ định dạng 'dd/mm/yyyy' và 'hh:mm AM/PM' thành đối tượng Date
//     let [day, month, year] = datePart.split('/').map(Number);
//     let [time, period] = timePart.split(' ');
//     let [hours, minutes] = time.split(':').map(Number);

//     // Điều chỉnh giờ theo AM/PM
//     if (period === 'PM' && hours !== 12) {
//         hours += 12;
//     } else if (period === 'AM' && hours === 12) {
//         hours = 0;
//     }

//     // Tạo đối tượng Date
//     let date = new Date(year, month - 1, day, hours, minutes);

//     // Định dạng ngày giờ theo yêu cầu
//     let options = {
//         weekday: 'short', year: 'numeric', month: 'short', day: '2-digit',
//         hour: '2-digit', minute: '2-digit', second: '2-digit',
//         timeZoneName: 'short'
//     };
//     let formattedDate = date.toLocaleString('en-US', options);

//     // Thêm múi giờ GMT+0700
//     let timeZone = 'GMT+0700 (Giờ Đông Dương)';
//   return  formattedDate = formattedDate.replace('GMT', timeZone);
// }


function formatDateTime(dateTimeStr) {
    // Tách ngày và giờ từ chuỗi
    if (!dateTimeStr) {
        // Nếu dateTimeStr là null hoặc undefined, trả về null
        return null;
    }
    let [datePart, timePart] = dateTimeStr.split(' - ');

    // Tách ngày, tháng, năm
    let [day, month, year] = datePart.split('/').map(Number);

    // Tách giờ, phút và AM/PM
    let [time, period] = timePart.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    // Điều chỉnh giờ theo AM/PM
    if (period === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }

    // Tạo đối tượng Date
    return new Date(year, month - 1, day, hours, minutes);
}
export const SearchDate = (data, dateTimeStart, dateTimeEnd) => {

   
    // dateTimeStart = new Date(dateTimeStart);
    // dateTimeEnd = new Date(dateTimeEnd);
    dateTimeStart = UpdateDateTime(dateTimeStart) //14/05/2024 - 12:58 PM
    dateTimeEnd = UpdateDateTime(dateTimeEnd)
    dateTimeStart = formatDateTime(dateTimeStart)
   
    dateTimeEnd = formatDateTime(dateTimeEnd)
    // console.log(dateTimeStart,'dateTimeStart');
    let pushItem = [];

    if (data) {
        data.map((value) => {

            // let dateTime =formatDateTime(value.warehouseDateUpdate)
            // console.log(dateTime, 'dateTime');
            let dateTime = null;
            let dateFields = [
                // warehouse date
                value.warehouseDateUpdate,
                value.warehouseDateCreated,
                value.intoWarehouseDate,
                value.exportWarehouseDate,
                // create warehouse date
                value.warehouseDateCreated,
                value.warehouseDateUpdate,
                // into warehouse date
                value.intoWarehouseDateUpdate,

                // account date
                value.accountDateCreated,
                value.accountDateUpdate,
                // document date
                value.documentDateCreated,
                // items date
                value.itemsDateCreated,
                value.itemsDateUpdate,

                // member date
                value.memberDateCreated,
                value.memberDateUpdate,
                // request into date
                value.dateCreated,
                value.dateUpdate,
                // request export date
                value.requestDateCreated,
                value.requestDateUpdate,
                value.requestDateVouchers,
                // supplier date
                value.supplierDateCreated,
                value.supplierDateUpdate,


            ];

            let i = 0;
            do {
                if (dateFields[i]) {
                    dateTime = formatDateTime(dateFields[i]) || null;
                }
                i++;
            } while (!dateTime && i < dateFields.length);


            if (dateTime >= dateTimeStart && dateTime <= dateTimeEnd) {

                pushItem.push(value);


            }
            return data
        })

    }
    return pushItem;
}


