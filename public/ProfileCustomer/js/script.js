function tooltipNotification() {
    const tipClick = document.querySelector('.tipClick');
    const tooltipT = document.querySelector('.tooltipT');
    const activeClassA = document.querySelector('.tipClick a')
    if (tipClick !== undefined && tooltipT !== undefined && tooltipT && tipClick) {


        tipClick.addEventListener('click', function() {
            tooltipT.style.display = 'block'; // Hiển thị tooltip khi click
            activeClassA.classList.add('active')
        });
        // Sự kiện click bất kỳ nơi nào trên trang web
        document.addEventListener('click', function(event) {
                const isClickInsideTooltip = tooltipT.contains(event.target);
                const isClickOnTipClick = tipClick.contains(event.target);
                // Kiểm tra xem click có xảy ra bên trong hoặc trên .tooltipT hay không
                if (!isClickInsideTooltip && !isClickOnTipClick) {
                    tooltipT.style.display = 'none'; // Ẩn tooltip nếu click bên ngoài .tooltipT và .tipClick
                    activeClassA.classList.remove('active')
                }
            })
            // tooltipT.querySelector('a').addEventListener('click', function(event) {
            //     event.stopPropagation(); // Ngăn chặn sự kiện click lan sang phần cha
            //     // Các hành động khác bạn muốn thực hiện khi click vào thẻ <a> trong tooltip
            // });
    }

}

function sideBarDarkLight() {
    const searchButton = document.querySelector('#content nav form .form-input button');
    const searchButtonIcon = document.querySelector('#content nav form .form-input button .bx');
    const searchForm = document.querySelector('#content nav form');

    const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');

    // const switchMode = document.getElementById('switch-mode');
    // TOGGLE SIDEBAR
    // let menuBar = document.querySelector('#content .bx.bx-menu');
    const sidebar = document.getElementById('sidebar');

    if (allSideMenu !== undefined && allSideMenu && allSideMenu.length !== 0) {
        allSideMenu.forEach(item => {
            const li = item.parentElement;

            item.addEventListener('click', function() {
                if (allSideMenu) {

                    allSideMenu.forEach(i => {
                        if (i.parentElement) { // Kiểm tra xem i.parentElement có tồn tại không
                            i.parentElement.classList.remove('active');
                        }
                    })
                    if (li) { // Kiểm tra xem biến li có tồn tại không
                        li.classList.add('active');
                    }
                }
            })
        });

    }

    // menuBar.addEventListener('click', function() {

    //     sidebar.classList.toggle('hide');
    // })


    if (sidebar && sidebar !== undefined &&
        searchForm && searchForm !== undefined &&
        searchButtonIcon && searchButtonIcon !== undefined &&
        searchButton && searchButton !== undefined
    ) {
        searchButton.addEventListener('click', function(e) {
            if (window.innerWidth < 576) {
                e.preventDefault();
                searchForm.classList.toggle('show');
                if (searchForm.classList.contains('show')) {
                    searchButtonIcon.classList.replace('bx-search', 'bx-x');
                } else {
                    searchButtonIcon.classList.replace('bx-x', 'bx-search');
                }
            }
        })




        if (window.innerWidth < 768) {
            sidebar.classList.add('s-hide');

        } else if (window.innerWidth > 576) {
            searchButtonIcon.classList.replace('bx-x', 'bx-search');
            searchForm.classList.remove('show');
        }

        window.addEventListener('resize', function() {
            if (this.innerWidth > 576) {
                searchButtonIcon.classList.replace('bx-x', 'bx-search');
                searchForm.classList.remove('show');
            }
        })
        window.addEventListener('resize', function() {
            if (this.innerWidth < 992) {
                sidebar.classList.add('s-hide');

            } else {
                sidebar.classList.remove('s-hide')

            }
        })
    }

}

function tabNotification() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');

            // Ẩn tất cả các tab-content
            tabContents.forEach(content => {
                content.classList.remove('active');
            });

            // Hiển thị tab-content tương ứng với tab được click
            document.getElementById(tabId).classList.add('active');
        });
    });
}
window.onload = function() {
    sideBarDarkLight()
    tooltipNotification()

    // tabNotification()

    // form confirm sms password retrieval

    // let in1 = document.getElementById('otc-1'),
    //     ins = document.querySelectorAll('input[type="number"]')
    // if (ins && ins !== undefined && in1 && in1 !== undefined) {
    //     splitNumber = function(e) {
    //             let data = e.data || e.target.value; // Chrome doesn't get the e.data, it's always empty, fallback to value then.
    //             if (!data) return; // Shouldn't happen, just in case.
    //             if (data.length === 1) return; // Here is a normal behavior, not a paste action.

    //             popuNext(e.target, data);
    //             //for (i = 0; i < data.length; i++ ) { ins[i].value = data[i]; }
    //         },
    //         popuNext = function(el, data) {
    //             el.value = data[0]; // Apply first item to first input
    //             data = data.substring(1); // remove the first char.
    //             if (el.nextElementSibling && data.length) {
    //                 // Do the same with the next element and next data
    //                 popuNext(el.nextElementSibling, data);
    //             }
    //         };

    //     ins.forEach(function(input) {
    //         /**
    //          * Control on keyup to catch what the user intent to do.
    //          * I could have check for numeric key only here, but I didn't.
    //          */
    //         input.addEventListener('keyup', function(e) {
    //             // Break if Shift, Tab, CMD, Option, Control.
    //             if (e.keyCode === 16 || e.keyCode == 9 || e.keyCode == 224 || e.keyCode == 18 || e.keyCode == 17) {
    //                 return;
    //             }

    //             // On Backspace or left arrow, go to the previous field.
    //             if ((e.keyCode === 8 || e.keyCode === 37) && this.previousElementSibling && this.previousElementSibling.tagName === "INPUT") {
    //                 this.previousElementSibling.select();
    //             } else if (e.keyCode !== 8 && this.nextElementSibling) {
    //                 this.nextElementSibling.select();
    //             }

    //             // If the target is populated to quickly, value length can be > 1
    //             if (e.target.value.length > 1) {
    //                 splitNumber(e);
    //             }
    //         });

    //         /**
    //          * Better control on Focus
    //          * - don't allow focus on other field if the first one is empty
    //          * - don't allow focus on field if the previous one if empty (debatable)
    //          * - get the focus on the first empty field
    //          */
    //         input.addEventListener('focus', function(e) {
    //             // If the focus element is the first one, do nothing
    //             if (this === in1) return;

    //             // If value of input 1 is empty, focus it.
    //             if (in1.value == '') {
    //                 in1.focus();
    //             }

    //             // If value of a previous input is empty, focus it.
    //             // To remove if you don't wanna force user respecting the fields order.
    //             if (this.previousElementSibling.value == '') {
    //                 this.previousElementSibling.focus();
    //             }
    //         });
    //     });

    //     /**
    //      * Handle copy/paste of a big number.
    //      * It catches the value pasted on the first field and spread it into the inputs.
    //      */
    //     in1.addEventListener('input', splitNumber);
    // }
    // var file = document.getElementById("thefile");

    // var audio = document.getElementById("audio");

    // file.onchange = function() {

    //     var files = this.files;

    //     audio.src = URL.createObjectURL(files[0]);

    //     audio.load();

    //     audio.play();

    //     var context = new AudioContext();

    //     var src = context.createMediaElementSource(audio);

    //     var analyser = context.createAnalyser();



    //     var canvas = document.getElementById("canvas");

    //     canvas.width = window.innerWidth;

    //     canvas.height = window.innerHeight;

    //     var ctx = canvas.getContext("2d");



    //     src.connect(analyser);

    //     analyser.connect(context.destination);



    //     analyser.fftSize = 256;



    //     var bufferLength = analyser.frequencyBinCount;

    //     console.log(bufferLength);



    //     var dataArray = new Uint8Array(bufferLength);



    //     var WIDTH = canvas.width;

    //     var HEIGHT = canvas.height;



    //     var barWidth = (WIDTH / bufferLength) * 2.5;

    //     var barHeight;

    //     var x = 0;



    //     function renderFrame() {

    //         requestAnimationFrame(renderFrame);



    //         x = 0;



    //         analyser.getByteFrequencyData(dataArray);



    //         ctx.fillStyle = "#000";

    //         ctx.fillRect(0, 0, WIDTH, HEIGHT);



    //         for (var i = 0; i < bufferLength; i++) {

    //             barHeight = dataArray[i];



    //             var r = barHeight + (25 * (i / bufferLength));

    //             var g = 250 * (i / bufferLength);

    //             var b = 50;



    //             ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";

    //             ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);



    //             x += barWidth + 1;

    //         }

    //     }



    //     audio.play();

    //     renderFrame();

    // };


    // switchMode.addEventListener('change', function() {
    //     if (this.checked) {
    //         document.body.classList.add('dark');
    //     } else {
    //         document.body.classList.remove('dark');
    //     }
    // })


};