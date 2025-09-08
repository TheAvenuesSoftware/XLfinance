const consoleLog = true;

console.log("LOADED:- XLfinance_CBA_Client.mjs is loaded",new Date().toLocaleString());
export function XLfinance_CBA_Client_isLoaded(){
    return true;
}

// ♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️
//  ONLY IMPORT CLIENT SIDE MODULES TO HERE
    import { parseDate } from './global_Client.mjs';
    import { getTypeOf} from './global_Client.mjs';
// ♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️



        function renderTransactions(data,sectionId) {
            const isMobile = window.innerWidth < 768;
            if (isMobile) {
                document.getElementById(`desktop-table-container-${sectionId}`).style.display = 'none';
                document.getElementById(`mobile-card-container-${sectionId}`).style.display = 'block';
                renderCards(data,sectionId);
            } else {
                document.getElementById(`mobile-card-container-${sectionId}`).style.display = 'none';
                document.getElementById(`desktop-table-container-${sectionId}`).style.display = 'block';
                renderTable(data,sectionId);
            }
        }


function parseTransactions_cbaPortfolio(csvText, accountEmail, portfolioId, portfolioName, portfolioGSTrate, portfolioFXrate) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    // Validate required headings
    const cbaPortfolioHeadings = ['Date','Reference','Details','Debit($)','Credit($)','Balance($)'];
    const missing = cbaPortfolioHeadings.filter(heading => !headers.includes(heading));
    if (missing.length > 0) {
        alert(`The uploaded file is missing expected headings:\n${missing.join(', ')}`);
        parsedData = null;
        document.getElementById('output').textContent = '';
        document.getElementById("csvFileInput").value="";
        return;
    }

    // Track index per date
    const indexByDate = {};

    return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row = Object.fromEntries(headers.map((h, i) => [h, values[i] || '']));

        const details = row.Details;

        let idDate = 'unknown';
        const rawDate = parseDate(row.Date, "d/m/y");
        const dateObj = new Date(rawDate);
        if (!isNaN(dateObj.getTime())) {
            const yyyy = dateObj.getFullYear();
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');  
            idDate = `${yyyy}${mm}${dd}`;
        }

        // Sanitize reference
        const reference = row.Reference || '';
        // const idReference = reference.replace(/\s+/g, '_').replace(/\|/g, '__').toLowerCase();
        const idReference = reference.replace(/\s+/g, '_').replace(/\|/g, '__');

        // Get and update index for this date
        if (!indexByDate[idDate]) {
            indexByDate[idDate] = 1;
        } else {
            indexByDate[idDate]++;
        }
        const paddedIndex = indexByDate[idDate].toString().padStart(4, '0');

        const id = `${idDate}|${paddedIndex}|${idReference}`;

        const result = {
            accountEmail,
            portfolioId,
            portfolioName,
            portfolioGSTrate,
            portfolioFXrate,
            original: line,
            id,
            Date: row.Date,
            Reference: row.Reference,
            Debit: row["Debit($)"],
            Credit: row["Credit($)"],
            Balance: row["Balance($)"]
        };

        // Transaction Type Detection
        if (/^[BS]\s+\d+/.test(details)) {
            const [trxType, trxQty, trxTicker, atSymbol, trxUnitAmount] = details.split(/\s+/);
            Object.assign(result, {
                trxType,
                trxQty,
                trxTicker,
                trx: atSymbol,
                trxUnitAmount,
                Brokerage_inclGST: Math.abs(( trxQty * trxUnitAmount - row["Credit($)"] - row["Debit($)"] )).toFixed(2),
                GST: Math.abs((( trxQty * trxUnitAmount - row["Credit($)"] - row["Debit($)"] )) / 11).toFixed(2)
            });
        } else if (/Drawer/i.test(details)) {
            const match = details.match(/Drawer\s+(.*)/i);
            result.Drawer = match ? match[1].trim() : '';
            result.trxType = 'R';
        } else if (/Payee/i.test(details)) {
            const match = details.match(/Payee\s+(.*)/i);
            result.Payee = match ? match[1].trim() : '';
            result.trxType = 'P';
        } else if (/^J/i.test(row.Reference)) {
            result.trxType = 'J';
            result.Details = details;
        } else {
            result.Details = details;
        }

        return result;
    });
}

function parseTransactions_cbaBank(csvText, accountEmail, portfolioId, portfolioName, portfolioGSTrate, portfolioFXrate, cbaBankAccountNumber) {
    const lines = csvText.trim().split('\n');
    const cbaBankDataTypes = ['date', 'number', 'text', 'number'];
    const headers = ['Date', 'Amount', 'Details', 'Balance']; // Raw CSV column order

    if (lines.length === 0) {
        alert('❌ No data found in the uploaded file.');
        return;
    }

    const sampleLine = lines[0].split(',').map(v => v.trim());

    if (sampleLine.length !== cbaBankDataTypes.length) {
        alert('❌ Incorrect number of columns in the uploaded file.\n🟢 Please upload a valid CBA Bank CSV export.');
        return;
    }

    // Helper: get data type
    function getTypeOf(val) {
        if (!val || val.trim() === '') return 'null';
        const cleaned = val.replace(/"/g, '').replace(/,/g, '').trim();
        if (/^[+-]?\d+(\.\d+)?$/.test(cleaned)) return 'number';
        const date = new Date(cleaned);
        if (!isNaN(date.getTime())) return 'date';
        return 'text';
    }

    // Validate types of first line
    let dataTypesOk = true;
    for (let i = 0; i < cbaBankDataTypes.length; i++) {
        const actualType = getTypeOf(sampleLine[i]);
        const expectedType = cbaBankDataTypes[i];
        if (actualType !== expectedType) {
            dataTypesOk = false;
            console.warn(`❌ Column ${i} value "${sampleLine[i]}" is type '${actualType}', expected '${expectedType}'`);
        }
    }

    if (!dataTypesOk) {
        alert(`❌ Data types of the import file are incorrect.\nExpected types are: ${cbaBankDataTypes.join(', ')}`);
        return;
    }

    // Main transformer
    const indexByDate = {};  // Tracks index per date
    function transformRow(rawLine, index) {
        const [rawDate, rawAmount, rawDetails, rawBalance] = rawLine.split(',').map(v => v.replace(/"/g, '').trim());

        const amount = Number(rawAmount.replace(/,/g, ''));
        const isCredit = amount >= 0;

        // const dateObj = new Date(rawDate);
        // const yyyy = dateObj.getFullYear();
        // const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        // const dd = String(dateObj.getDate()).padStart(2, '0');
        // const idDate = !isNaN(dateObj.getTime()) ? `${yyyy}${mm}${dd}` : 'unknown';
            let idDate =`unknown`;
            // const rawDate = row.Date || '';
            const rawDateParsed = parseDate(rawDate,"d/m/y");
            const dateObj = new Date(rawDateParsed );
            if (!isNaN(dateObj.getTime())) {
                const yyyy = dateObj.getFullYear();
                const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
                const dd = String(dateObj.getDate()).padStart(2, '0');  
                idDate = `${yyyy}${mm}${dd}`;
            }

        const cbaBankNumber = cbaBankAccountNumber.trim().replace(/\s+/g, '-');
        const idReference = rawDetails.replace(/\s+/g, '_').replace(/\|/g, '__').toLowerCase();
        const idAmount = Math.abs(amount).toFixed(2).replace('.', 'p').replace(/-/g, 'm');
        // const id = `${idDate}_${idReference}_${rawAmount}`;
        // const paddedIndex = index.toString().padStart(4, '0');
        // Update and reset index per date
            if (!indexByDate[idDate]) {
                indexByDate[idDate] = 1;
            } else {
                indexByDate[idDate]++;
            }
            const paddedIndex = indexByDate[idDate].toString().padStart(4, '0');
        const id = `${idDate}|${paddedIndex}|CBA-${cbaBankNumber}|${idReference}|${rawAmount}`;

        const result = {
            id,
            accountEmail,
            portfolioId,
            portfolioName,
            portfolioGSTrate,
            portfolioFXrate,
            cbaBankNumber,
            original: rawLine,
            Date: rawDate,
            Reference: rawDetails,
            Type: isCredit ? 'credit' : 'debit',
            Qty: '',
            Ticker: '',
            'unit amount': '',
            Debit: isCredit ? '' : Math.abs(amount),
            Credit: isCredit ? amount : '',
            Balance: rawBalance
        };

        // Detect transaction type (B/S)
        if (/^[BS]\s+\d+/.test(rawDetails)) {
            const [trxType, trxQty, trxTicker, atSymbol, trxUnitAmount] = rawDetails.split(/\s+/);
            const numericQty = Number(trxQty);
            const numericUnitAmount = Number(trxUnitAmount);

            const trxValue = numericQty * numericUnitAmount;
            const trxTotal = trxValue - amount;

            Object.assign(result, {
                trxType,
                trxQty,
                trxTicker,
                trx: atSymbol,
                trxUnitAmount,
                Brokerage_inclGST: trxTotal.toFixed(2),
                GST: (trxTotal / 11).toFixed(2)
            });
        }
        // Drawer
        else if (/Drawer/i.test(rawDetails)) {
            const match = rawDetails.match(/Drawer\s+(.*)/i);
            result.Drawer = match ? match[1].trim() : '';
            result.trxType = 'R';
        }
        // Payee
        else if (/Payee/i.test(rawDetails)) {
            const match = rawDetails.match(/Payee\s+(.*)/i);
            result.Payee = match ? match[1].trim() : '';
            result.trxType = 'P';
        }
        // Reference starts with J
        else if (/^J/i.test(rawDetails)) {
            result.trxType = 'J';
            result.Details = rawDetails;
        }
        // Fallback
        else {
            result.Details = rawDetails;
        }

        return result;
    }

    // Final result: skip header row if needed (if no headers, keep all lines)
    const results = lines.map(transformRow);
    console.log('✅ Transformed transactions:', results);
    return results;
}


    function parseTransactions_cbaBank_OLD(csvText, accountEmail, portfolioId, portfolioName, portfolioGSTrate, portfolioFXrate) {
        const lines = csvText.trim().split('\n');
        // use portfolio headers and transform the import later START
            const headers = ['Date','Reference','Details','Debit($)','Credit($)','Balance($)'];
            console.log(headers);
        // use portfolio headers and transform the import later END
        // // convert to Set for comparison
        // const headersSet = new Set(headers);
        // console.log(headersSet);
        // // Validate required headings
        // // const cbaBankHeadings = ['Date','DRorCR','Details','Balance($)'];
        const cbaBankDataTypes = ['date','number','text','number'];
        const cbaBankLines = lines[0].split(',').map(h => h.trim());
        if (cbaBankLine.length !== cbaBankDataTypes.length) {
            alert('❌ Incorrect number of columns in the uploaded file.\n🟢 Please upload a valid CBA Bank CSV export.');
            return
        }
        let dataTypesOk = true;
        for (let i = 0; i < cbaBankDataTypes.length; i++) {
            const actualType = getTypeOf(headers[i]);
            const expectedType = cbaBankDataTypes[i];
            if (actualType !== expectedType) {
                dataTypesOk = false;
                console.log(`❌ Item ${i} is of type '${actualType}', expected '${expectedType}'`);
            } else {
                console.log(`✅ Item ${i} is valid (${actualType}', expected '${expectedType}')`);
            }
        }
        if (!dataTypesOk) {
                alert(`❌ Data types of the import file are incorrect.\nExpected types are: '${cbaBankDataTypes}.`);
                return;
        }

        function transformRow(rawLine, id) {
            const values = rawLine.split(',').map(v => v.replace(/"/g, '').trim());

            const date = values[0];
            const amountRaw = values[1];
            const details = values[2];
            const balance = values[3];

            const amount = Number(amountRaw.replace(/,/g, ''));
            const isCredit = amount >= 0;

            return {
                id,
                Date,
                Reference: details,
                Type: isCredit ? 'credit' : 'debit',
                Qty: '',              // unknown
                Ticker: '',           // unknown
                'unit amount': '',    // unknown
                Debit: isCredit ? '' : Math.abs(amount),
                Credit: isCredit ? amount : '',
                Balance: balance
            };
        }
        // const lines = csvText.trim().split('\n');
        const linesTransformed = lines.map((line, index) => transformRow(line, index + 1));
        console.log('linesTransformed:-\n',linesTransformed);

        return linesTransformed.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const row = Object.fromEntries(headers.map((h, i) => [h, values[i] || '']));

            const details = row.Details;

            let idDate =`unknown`;
            // const rawDate = row.Date || '';
            console.log(row);
            const rawDate = parseDate(row[0],"d/m/y");
            const dateObj = new Date(rawDate);
            if (!isNaN(dateObj.getTime())) {
                const yyyy = dateObj.getFullYear();
                const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
                const dd = String(dateObj.getDate()).padStart(2, '0');
                idDate = `${yyyy}${mm}${dd}`;
            }
            // console.log(row.Date);
            // console.log(idDate);
            let idReference = 'unknown';
            const reference = row || '';
            // // Sanitize reference string START
            //     idReference = reference.replace(/\s+/g, '_');
            // // Sanitize reference string END
            // console.log(idReference);
            const id = idDate + '_' + idReference;
            console.log(id);

            // Start with accountEmail/portfolioId/portfolioName at beginning
            const result = {
                accountEmail: accountEmail,
                portfolioId: portfolioId,
                portfolioName: portfolioName,
                portfolioGSTrate: portfolioGSTrate,
                portfolioFXrate: portfolioFXrate,
                original: line,
                id: id,
                Date: row.Date,
                Reference: row.Reference,
                Debit: row[1],
                Credit: row[1],
                Balance: row[4]
            };

            // 1. B or S transaction
            if (/^[BS]\s+\d+/.test(details)) {
                const [trxType, trxQty, trxTicker, atSymbol, trxUnitAmount] = details.split(/\s+/);
                Object.assign(result, {
                    trxType,
                    trxQty,
                    trxTicker,
                    trx: atSymbol,
                    trxUnitAmount,
                    Brokerage_inclGST: Math.abs(( trxQty * trxUnitAmount - row["Credit($)"] - row["Debit($)"] )).toFixed(2),
                    GST: Math.abs((( trxQty * trxUnitAmount - row["Credit($)"] - row["Debit($)"] )) / 11).toFixed(2)
                });
            }
            // 2. Drawer
            else if (/Drawer/i.test(details)) {
                const match = details.match(/Drawer\s+(.*)/i);
                result.Drawer = match ? match[1].trim() : '';
                result.trxType = 'R';
            }
            // 3. Payee
            else if (/Payee/i.test(details)) {
                const match = details.match(/Payee\s+(.*)/i);
                result.Payee = match ? match[1].trim() : '';
                result.trxType = 'P';
            }
            // 4. Reference starts with J
            else if (/^J/i.test(row.Reference)) {
                result.trxType = 'J';
                result.Details = details;
            }
            // 5. Fallback
            else {
                result.Details = details;
            }

            return result;
        });
    }


	// upload new records START
		// 📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤
            let parsedData;
			export function selectFileForUpload(event){
				console.log(event.target.id);
				console.log(event.target.files);
                const accountEmail = document.getElementById('accountEmail').value.trim();
                const portfolioId = document.getElementById('portfolioId').value.trim();
                const portfolioName = document.getElementById('portfolioName').value.trim();
                const portfolioGSTrate = document.getElementById("portfolioGSTrate").value.trim();
                const portfolioFXrate = document.getElementById("portfolioFXrate").value.trim();
                if (!accountEmail || !portfolioId || !portfolioName || !portfolioGSTrate || !portfolioFXrate) {
                    alert("Please enter:\n     Account Email Address;\n     Portfolio ID;\n     Account Name;\n     GST rate;\n     FX rate;\n...before uploading.");
                    document.getElementById("csvFileInput").value="";
                    return;
                }
				const file = event.target.files[0];
				const reader = new FileReader();
				reader.onload = function (e) {
                    const csvText = e.target.result;
                    if (!file) return;
                    // switch parse method based on fileType START
                        const fileType = document.getElementById("fileType").value;
                        switch (fileType) {
                            case 'cbaPortfolio':
                                parsedData = parseTransactions_cbaPortfolio(csvText, accountEmail, portfolioId, portfolioName, portfolioGSTrate, portfolioFXrate);
                                renderTransactions(parsedData,"section1",fileType);
                                break;
                            case 'cbaBank':
                                const cbaBankAccountNumber = document.getElementById("bankAccountNumber").value;
                                parsedData = parseTransactions_cbaBank(csvText, accountEmail, portfolioId, portfolioName, portfolioGSTrate, portfolioFXrate, cbaBankAccountNumber);
                                renderTransactions(parsedData,"section1",fileType);
                                break;
                            default:
                                console.error(`Unsupported file type: ${fileType}`);
                        }
                    // switch parse method based on fileType START
                    // original parse code START
                        // parsedData = parseTransactions(csvText, accountEmail, portfolioId, portfolioName, portfolioGSTrate, portfolioFXrate);
                    // original parse code END
                    document.getElementById('output').textContent = JSON.stringify(parsedData, null, 2); // renders raw json of imported csv file
                    console.log("Parsed JSON:", parsedData);
				};
				reader.readAsText(file);
			}
		// 📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤
	// upload new records END

    // desktop display START
        // 💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻
            function renderTable(data,sectionId) {
                const container = document.getElementById(`desktop-table-container-${sectionId}`);
                container.innerHTML = '';

                const table = document.createElement('table');
                table.id = 'transactionsTable';
                table.style.cssText = `
                    width: 100%;
                    border-collapse: collapse;
                `;

                const thead = document.createElement('thead');
                const tbody = document.createElement('tbody');
                tbody.id = 'transactionsBody';

                const headers = [
                    "id", "Date", "Reference", "Type", "Qty", "Ticker", "Unit Amount",
                    "Debit", "Credit", "Balance", "Brokerage_inclGST", "GST", "Payee", "Drawer"
                ];

                // Create header row
                const headerRow = document.createElement('tr');
                headers.forEach((h, idx) => {
                    const th = document.createElement('th');
                    th.textContent = h;
                    th.style.cssText = `
                        position: sticky;
                        top: 0;
                        background: #f2f2f2;
                        padding: 8px;
                        border-bottom: 2px solid #999;
                        cursor: pointer;
                    `;
                    th.dataset.index = idx;
                    th.addEventListener('click', () => sortTableByColumn(idx));
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);
                table.appendChild(thead);
                table.appendChild(tbody);
                container.appendChild(table);

                populateTable(data);

                // Filter listener
                const filterInput = document.getElementById('tableFilter');
                filterInput.addEventListener('input', () => {
                    const filterValue = filterInput.value.toLowerCase();
                    const filtered = data.filter(txn =>
                    Object.values(txn).some(val => String(val).toLowerCase().includes(filterValue))
                    );
                    populateTable(filtered);
                });

                function populateTable(rows) {
                    tbody.innerHTML = '';
                    rows.forEach(txn => {
                        const tr = document.createElement('tr');
                        tr.dataset.id = txn.id;
                        tr.innerHTML = `
                            <td>${txn.id || ''}</td>
                            <td>${txn.Date || ''}</td>
                            <td>${txn.Reference || ''}</td>
                            <td contenteditable="true">${txn.trxType || ''}</td>
                            <td contenteditable="true">${txn.trxQty || ''}</td>
                            <td contenteditable="true">${txn.trxTicker || ''}</td>
                            <td contenteditable="true">${txn.trxUnitAmount || ''}</td>
                            <td contenteditable="true">${txn.Debit || ''}</td>
                            <td contenteditable="true">${txn.Credit || ''}</td>
                            <td contenteditable="true">${txn.Balance || ''}</td>
                            <td contenteditable="true">${txn.Brokerage_inclGST || ''}</td>
                            <td contenteditable="true">${txn.GST || ''}</td>
                            <td contenteditable="true">${txn.Payee || ''}</td>
                            <td contenteditable="true">${txn.Drawer || ''}</td>
                        `;
                        tbody.appendChild(tr);
                    });
                }

                // Attach to the tbody so it covers all cells
                tbody.addEventListener('blur', function (event) {
                    const cell = event.target;

                    // Only act on contenteditable cells inside a <td>
                    if (cell.tagName !== 'TD' || !cell.isContentEditable) return;

                    const tr = cell.closest('tr');
                    const rowId = tr?.dataset.id;
                    if (!rowId) return;

                    // Find the corresponding object in your data array
                    const txn = data.find(t => t.id === rowId);
                    if (!txn) return;

                    // Determine which column this is
                    const columnIndex = Array.from(cell.parentNode.children).indexOf(cell);

                    // Match to your field names
                    const fieldMap = [
                        "id", "Date", "Reference", "trxType", "trxQty", "trxTicker", "trxUnitAmount",
                        "Debit", "Credit", "Balance", "Brokerage_inclGST", "GST", "Payee", "Drawer"
                    ];

                    const field = fieldMap[columnIndex];

                    // Avoid modifying id, Date, Reference
                    if (["id", "Date", "Reference"].includes(field)) return;

                    // Update the value in your data array
                    txn[field] = cell.textContent.trim();

                    console.log(`Updated [${field}] of txn ${rowId}:`, txn);
                }, true);  // useCapture: true so it catches blur events bubbling up


                // Basic sort handler
                function sortTableByColumn(columnIndex) {
                    let ascending = table.dataset.sortDir !== 'asc';
                    table.dataset.sortDir = ascending ? 'asc' : 'desc';

                    const sorted = [...data].sort((a, b) => {
                    const valA = Object.values(a)[columnIndex] || '';
                    const valB = Object.values(b)[columnIndex] || '';

                    const numA = parseFloat(valA);
                    const numB = parseFloat(valB);

                    if (!isNaN(numA) && !isNaN(numB)) {
                        return ascending ? numA - numB : numB - numA;
                    }

                    return ascending
                        ? String(valA).localeCompare(String(valB))
                        : String(valB).localeCompare(String(valA));
                    });

                    populateTable(sorted);
                }
            }
        // 💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻
    // desktop display END

    // mobile display START
        // 📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱
            function renderCards(data,sectionId) {
            const container = document.getElementById(`mobile-card-container-${sectionId}`);
            container.innerHTML = '';

            data.forEach(txn => {
                const card = document.createElement('div');
                card.style.cssText = `
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    margin: 10px 0;
                    padding: 10px;
                    background-color: #f9f9f9;
                `;

                card.innerHTML = `
                    <strong>Date:</strong> ${txn.Date || ''}<br>
                    <strong>Reference:</strong> ${txn.Reference || ''}<br>
                    <strong>Type:</strong> ${txn.trxType || ''}<br>
                    ${txn.trxQty ? `<strong>Qty:</strong> ${txn.trxQty}<br>` : ''}
                    ${txn.trxTicker ? `<strong>Ticker:</strong> ${txn.trxTicker}<br>` : ''}
                    ${txn.trxUnitAmount ? `<strong>Unit Amount:</strong> ${txn.trxUnitAmount}<br>` : ''}
                    ${txn.Payee ? `<strong>Payee:</strong> ${txn.Payee}<br>` : ''}
                    ${txn.Drawer ? `<strong>Drawer:</strong> ${txn.Drawer}<br>` : ''}
                    <strong>Debit:</strong> ${txn.Debit || ''}<br>
                    <strong>Credit:</strong> ${txn.Credit || ''}<br>
                    <strong>Balance:</strong> ${txn.Balance || ''}<br>
                `;
                container.appendChild(card);
            });
            }
        // 📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱
    // mobile display END

	// save uploaded records START
	    // 💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤
			let fileHandle; // persist file handle for saving
			let savedEmail = ''; // to create consistent file name
			// Save to NDJSON file
			export async function appendUploadedRecords(){
				// document.getElementById('saveButton').addEventListener('click', async () => {
				try {
					if (!window.showSaveFilePicker) {
						alert('This feature requires a supported browser (e.g., Chrome).');
						return;
					}
					// const jsonString = window.localStorage.getItem("XLfinance_parsedData");
					// const parsedData = JSON.parse(jsonString);
					if (!parsedData || parsedData.length === 0) {
						alert('No parsed data to save.');
    					return;
					}
					const accountEmail = parsedData[0]?.accountEmail || 'unknown';
					savedEmail = accountEmail;
					const fileName = `XLfinance_${accountEmail}.ndjson`;
					if (!fileHandle) {
						fileHandle = await window.showSaveFilePicker({
							suggestedName: fileName,
							types: [{
							description: 'NDJSON File',
							accept: { 'application/x-ndjson': ['.ndjson'] }
							}]
						});
					}
					const writable = await fileHandle.createWritable({ keepExistingData: true });
					for (const record of parsedData) {
						await writable.write(JSON.stringify(record) + '\n');
					}
					await writable.close();
					alert('File saved successfully.');
				} catch (err) {
					console.error('Save error:', err);
					alert('Could not save file.');
				}
			}
		// 💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤
	// save uploaded records END

	// Open existing NDJSON file START
		// 📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂
			export async function openNDjsonFile(){
				// document.getElementById('openButton').addEventListener('click', async () => {
				try {
					if (!window.showOpenFilePicker) {
						alert('This feature requires a supported browser (e.g., Chrome).');
						return;
					}
					const [handle] = await window.showOpenFilePicker({
						types: [{
							description: 'NDJSON File',
							accept: { 'application/x-ndjson': ['.ndjson'] }
						}]
					});
					const file = await handle.getFile();
					const text = await file.text();
					// Optional: parse into objects
						const ndjsonLines = text.trim().split('\n');
						const parsedObjects = ndjsonLines.map(line => JSON.parse(line));
					// document.getElementById('loadedFileContent').style.display="block";
					// document.getElementById('loadedFileContent').textContent = JSON.stringify(parsedObjects, null, 2);
					document.getElementById("accountEmail_atOpenFile").value = parsedObjects[0].accountEmail;
					document.getElementById("portfolioId_atOpenFile").value = parsedObjects[0].portfolioId;
					document.getElementById("portfolioName_atOpenFile").value = parsedObjects[0].portfolioName;
					renderTransactions(parsedObjects,"section2");
					console.log('Loaded records:', parsedObjects);
				} catch (err) {
					console.error('Open error:', err);
					alert('Could not open file.');
				}
			}
		// 📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂
	// Open existing NDJSON file END