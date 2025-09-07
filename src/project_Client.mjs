const consoleLog = true;

console.log("LOADED:- project_Client.mjs is loaded",new Date().toLocaleString());
export function projectMJSisLoaded(){
    return true;
}

// ♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️
//  ONLY IMPORT CLIENT SIDE MODULES TO HERE
    import * as cba from "./XLfinance_CBA_Client.mjs";
    // import { clientConfigSettings } from "./projectConfig_Client.mjs";
    // import { showCustomMessage } from "./globalUIpopups_Client.mjs";
    // import { newDateAttributes } from "./global_Client.mjs";
    // import { initTinyMCE } from "./projectTinyMCE_Client.mjs";
    // import { selectImageToUpload } from "./globalUploadImage_Client.mjs";
    // import { uploadImageToCanvas } from "./globalUploadImage_Client.mjs";
    // import { isEmailValid } from "./global_Client.mjs";
// ♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️

// 🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️
    // functions mapping START
        export const actions = {
            // DON'T use DOM delegation via data-action for file selections START
            // selectFileForUpload: (event) => {
            //     console.log(event.target);
            //     cba.selectFileForUpload(event);
            // },
            // DON'T use DOM delegation via data-action for file selections END
            appendUploadedRecords: (event) => {
                console.log(event.target);
                cba.appendUploadedRecords(event);
            },
            // DON'T use DOM delegation via data-action for file selections START
            // openNDjsonFile: (event) => {
            //     console.log(event.target);
            //     cba.openNDjsonFile(event);
            // },
            // DON'T use DOM delegation via data-action for file selections END
            alertDateTime: () => alert(`Current date and time: ${new Date().toLocaleString()}`),
            showNotes: () => doThis('showNotes'),
            selectImageToUpload: () => selectImageToUpload(),
            uploadImageToCanvas: () => uploadImageToCanvas(),
            insertFormDataRecord: async () => await insertFormDataRecord(),
            // find search retrieve get START
                searchByAddress: () => {
                    document.getElementById("search-button").setAttribute("data-action", "filterByAddress")
                    document.getElementById("search-input").type = "text"; // Ensures numeric input for date
                },
                searchByNote: () => {
                    document.getElementById("search-button").setAttribute("data-action", "filterByNote")
                    document.getElementById("search-input").type = "text"; // Ensures numeric input for date
                },
                searchByDate: () => {
                    document.getElementById("search-button").setAttribute("data-action", "filterByDate");
                    document.getElementById("search-input").type = "date"; // Ensures numeric input for date
                },
                filterByAddress: () => filterBy("address"),
                filterByNote: () => filterBy("note"),
                filterByDate: () => filterBy("date"),
            // find search retrieve get END
            // edit update START
                // address
                    editRecordAddress: (event) => editRecordAddress(event),
                    saveEditedAddress: (event) => saveEditedAddress(event),
                // note
                    editRecordNote: (event) => editRecordNote(event),
                    saveEditedNote: (event) => saveEditedNote(event),
                // record
                    deleteRecord: async (event) => await deleteRecord(event)
            // edit update END
        };
    // functions mapping END
// 🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️
// 🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴
// ⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️
    // DOM element "data-action" functions START
        
    // DOM element "data-action" functions END
// ⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️
// 🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴🏳️🏴
// 🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️🗺️

//1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣ START

    document.addEventListener("DOMContentLoaded",async () => {

        if(consoleLog===true){console.log('DOMContentLoaded successsful ~ projectClient.',Date.now());}

        // 2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣ START

            window.addEventListener("load",async () => {

                if(consoleLog===true){console.log('Window load successsful ~ projectClient.',Date.now());}

                await new Promise(resolve => setTimeout(resolve, 500)); // Simulated async process
                await doAfterDOMandWindowLoad();

            });

            document.getElementById("csvFileInput").addEventListener("change", (event) => {
                const file = event.target.files[0];
                if (!file) {
                    console.warn("No file selected.");
                    return;
                }
                cba.selectFileForUpload(event);
            });

        // 2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣2️⃣ END

    });

// 1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣1️⃣ END

// 1️⃣🔹1️⃣ START 1️⃣🔹1️⃣  1️⃣🔹1️⃣  1️⃣🔹1️⃣  1️⃣🔹1️⃣  1️⃣🔹1️⃣  1️⃣🔹1️⃣  1️⃣🔹1️⃣  1️⃣🔹1️⃣  1️⃣🔹1️⃣  1️⃣🔹1️⃣

    function doAfterDOMandWindowLoad(){

        // 🔊🎤🦻🔊🎤🦻🔊🎤🦻🔊🎤🦻🔊🎤🦻🔊🎤🦻🔊🎤🦻🔊🎤🦻🔊🎤🦻🔊🎤🦻🔊🎤🦻🔊🎤🦻🔊🎤🦻🔊🎤🦻🔊🎤🦻🔊🎤🦻🔊🎤🦻
            // add PROJECT SPECIFIC event listeners START
                let logCount = 0;
                // document.addEventListener("change", (event) => { // written by ChatGPT START
                //     // Prevents the event from bubbling up to parent elements START
                //         event.stopPropagation();
                //     // Prevents the event from bubbling up to parent elements END
                //     logCount++;
                //     console.log(logCount, event.target);
                //     const action = event.target.dataset.action;
                //     const handler = actions[action];
                //     console.log(`Action: ${action}, Handler: ${handler}`);
                //     if (typeof handler === "function") {
                //         try {
                //             console.warn(`🟢 Handler found for action: ${action}`);
                //             console.warn(`🟢 Triggered by element: ${event.target.id}`);
                //             handler(event);
                //         } catch (error) {
                //             console.error(`🔴 Error executing handler for action: ${action}`, error);
                //         }
                //     } else {
                //         console.warn(`🔴 No handler found for action: ${action}`);
                //     }
                // }); // written by ChatGPT END
                document.addEventListener("click", (event) => {
                    // Prevents the event from bubbling up to parent elements START
                        event.stopPropagation(); // Prevents the event from bubbling up to parent elements
                    // Prevents the event from bubbling up to parent elements END
                    logCount++;
                    console.log(logCount,event.target); // will log twice if clicked on a radio button label.
                    const action = event.target.dataset.action;
                    const handler = actions[action];
                    console.log(`Action: ${action}, Handler: ${handler}`);
                    if (typeof handler === "function"){
                        try{
                            console.warn(`🟢 Handler found for action: ${event.target.dataset.action}`);
                            console.warn(`🟢 Handler found at element: ${event.target.id}`);
                            handler(event);
                        } catch (error) {
                            console.error(`🔴 Error executing handler for action: ${event.target.dataset.action}`, error);
                        }   
                    } else {
                        console.warn(`🔴 No handler found for action: ${event.target.dataset.action}`);
                    }
                });
            // add PROJECT SPECIFIC event listeners END
        // 🔊🎤🦻🔊🎤🦻🔊🎤🦻🔊🎤🦻🔊🎤🦻🔊🎤🦻🔊🎤🦻🔊🎤🦻🔊🎤🦻🔊🎤🦻🔊🎤🦻🔊🎤🦻🔊🎤🦻🔊🎤🦻🔊🎤🦻🔊🎤🦻🔊🎤🦻

    }

// 1️⃣🔹1️⃣  END  1️⃣🔹1️⃣  1️⃣🔹1️⃣  1️⃣🔹1️⃣  1️⃣🔹1️⃣  1️⃣🔹1️⃣  1️⃣🔹1️⃣  1️⃣🔹1️⃣  1️⃣🔹1️⃣  1️⃣🔹1️⃣  1️⃣🔹1️⃣