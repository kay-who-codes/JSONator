document.addEventListener('DOMContentLoaded', function() {
    const spreadsheetData = document.getElementById('spreadsheet-data');
    const jsonOutput = document.getElementById('json-output');
    const copyBtn = document.getElementById('copy-btn');

    spreadsheetData.addEventListener('input', convertToJson);
    copyBtn.addEventListener('click', copyToClipboard);

    function detectInputType(text) {
        // Check if input contains ",," (new block-style format)
        if (text.includes(',,')) {
            return 'block';
        }
        // Otherwise, assume tab-separated (original format)
        return 'tab';
    }

    function convertToJson() {
        const text = spreadsheetData.value.trim();
        if (!text) {
            jsonOutput.value = '';
            return;
        }

        try {
            const inputType = detectInputType(text);
            let result;

            if (inputType === 'block') {
                // Parse double-comma-separated blocks
                const blocks = text.split(',,').map(block => block.trim()).filter(block => block !== '');
                result = {};
                for (const block of blocks) {
                    const lines = block.split('\n').filter(line => line.trim() !== '');
                    if (lines.length === 0) continue;
                    const objectName = lines[0].trim();
                    result[objectName] = lines.slice(1).map(item => item.trim());
                }
            } else {
                // Parse tab-separated values (original behavior)
                const lines = text.split('\n').filter(line => line.trim() !== '');
                if (lines.length > 0) {
                    const headers = lines[0].split(/\t/).map(header => header.trim());
                    result = {};
                    headers.forEach(header => {
                        result[header] = [];
                    });
                    for (let i = 1; i < lines.length; i++) {
                        const row = lines[i].split(/\t/).map(cell => cell.trim());
                        for (let j = 0; j < headers.length; j++) {
                            if (j < row.length && row[j] !== '') {
                                result[headers[j]].push(row[j]);
                            }
                        }
                    }
                }
            }

            jsonOutput.value = JSON.stringify(result, null, 4);
        } catch (error) {
            jsonOutput.value = `Error: ${error.message}`;
        }
    }

    function copyToClipboard() {
        jsonOutput.select();
        document.execCommand('copy');
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = 'Copy JSON to Clipboard';
        }, 2000);
    }
});