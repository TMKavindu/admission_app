const formSection = document.getElementById('inputForm');
const previewSection = document.getElementById('previewSection');
const previewBtn = document.getElementById('previewBtn');
const backBtn = document.getElementById('backBtn');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
const downloadDocBtn = document.getElementById('downloadDocBtn');

function addStudent() {
    const container = document.getElementById('studentsContainer');
    const newRow = document.createElement('div');
    newRow.className = 'student-row border p-3 mb-3 rounded bg-light position-relative';
    newRow.innerHTML = `
        <button type="button" class="btn-close position-absolute top-0 end-0 m-2" onclick="this.parentElement.remove()" aria-label="Close"></button>
        <div class="row">
            <div class="col-6 mb-2"><label class="form-label">වර්ෂය</label><input type="text" class="form-control year" required></div>
            <div class="col-6 mb-2"><label class="form-label">ගෘහ අංකය</label><input type="text" class="form-control houseNo" required></div>
            <div class="col-12 mb-2"><label class="form-label">ලියාපදිංචි අංකය</label><input type="text" class="form-control regNo" required></div>
            <div class="col-12 mb-2"><label class="form-label">ඡන්ද හිමියාගේ නම</label><input type="text" class="form-control voterName" required></div>
        </div>
    `;
    container.appendChild(newRow);
}

function clearForm() {
    if (confirm("ඔබට සියලුම දත්ත ඉවත් කිරීමට අවශ්‍යද?")) {
        document.getElementById('dataForm').reset();
        const container = document.getElementById('studentsContainer');
        const rows = container.querySelectorAll('.student-row');
        rows.forEach((row, index) => {
            if (index > 0) row.remove();
        });
        const firstRow = rows[0];
        if (firstRow) firstRow.querySelectorAll('input').forEach(input => input.value = '');
    }
}

previewBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    if (!document.getElementById('dataForm').checkValidity()) {
        document.getElementById('dataForm').reportValidity();
        return;
    }

    document.getElementById('pdfElectoralArea').innerText = document.getElementById('electoralArea').value;
    document.getElementById('pdfGnDivision').innerText = document.getElementById('gnDivision').value;
    document.getElementById('pdfPollingBooth').innerText = document.getElementById('pollingBooth').value;
    document.getElementById('pdfVillage').innerText = document.getElementById('village').value;

    const studentRows = document.querySelectorAll('.student-row');
    const tableBody = document.getElementById('pdfStudentTable');
    tableBody.innerHTML = ''; 

    studentRows.forEach(row => {
        const year = row.querySelector('.year').value;
        const houseNo = row.querySelector('.houseNo').value;
        const regNo = row.querySelector('.regNo').value;
        const voterName = row.querySelector('.voterName').value;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="border: 1px solid #000; padding: 4px 2px; text-align: center;">${year}</td>
            <td style="border: 1px solid #000; padding: 4px 2px; text-align: center;">${houseNo}</td>
            <td style="border: 1px solid #000; padding: 4px 2px; text-align: center;">${regNo}</td>
            <td style="border: 1px solid #000; padding: 4px 2px; text-align: left; padding-left: 6px;">${voterName}</td>
        `;
        tableBody.appendChild(tr);
    });

    formSection.style.display = 'none';
    previewSection.style.display = 'block';
    window.scrollTo(0, 0);
});

backBtn.addEventListener('click', function() {
    previewSection.style.display = 'none';
    formSection.style.display = 'block';
    window.scrollTo(0, 0);
});

// ==========================================
// 1. DOWNLOAD PDF
// ==========================================
downloadPdfBtn.addEventListener('click', function() {
    const element = document.getElementById('pdfTemplate');
    
    const firstVoterName = document.querySelector('.student-row .voterName').value || 'Form';
    const cleanName = firstVoterName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\u0D80-\u0DFF]/g, '');
    const today = new Date().toISOString().split('T')[0];
    const filename = `Admission_2027_${cleanName}_${today}.pdf`;

    const originalText = downloadPdfBtn.innerHTML;
    downloadPdfBtn.innerHTML = '⏳ බාගත වෙමින්...';
    downloadPdfBtn.disabled = true;

    const opt = {
        margin:       [10, 10, 10, 10],
        filename:     filename,
        image:        { type: 'jpeg', quality: 0.95 },
        html2canvas:  { 
            scale: 2, 
            useCORS: true, 
            letterRendering: true,
            logging: false,
            backgroundColor: '#ffffff',
            scrollX: 0,
            scrollY: 0
        },
        jsPDF:        { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            compress: true
        },
        pagebreak:    { 
            mode: ['css', 'legacy'],
            avoid: '.footer-table'
        }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        downloadPdfBtn.innerHTML = originalText;
        downloadPdfBtn.disabled = false;
        setTimeout(() => alert('✅ PDF සාර්ථකව බාගත විය!'), 500);
    }).catch((err) => {
        console.error("PDF Error:", err);
        downloadPdfBtn.innerHTML = originalText;
        downloadPdfBtn.disabled = false;
        alert('❌ දෝෂයක් සිදුවිය. කරුණාකර නැවත උත්සාහ කරන්න.');
    });
});

// ==========================================
// 2. DOWNLOAD DOC (Word Document) - ALL DOTTED LINES WITH INLINE STYLES
// ==========================================
downloadDocBtn.addEventListener('click', function() {
    const originalText = downloadDocBtn.innerHTML;
    downloadDocBtn.innerHTML = '⏳ DOC සකස් වෙමින්...';
    downloadDocBtn.disabled = true;

    try {
        const electoralArea = document.getElementById('electoralArea').value;
        const gnDivision = document.getElementById('gnDivision').value;
        const pollingBooth = document.getElementById('pollingBooth').value;
        const village = document.getElementById('village').value;

        const studentRows = document.querySelectorAll('.student-row');
        let tableRows = '';
        studentRows.forEach(row => {
            tableRows += `
                <tr>
                    <td style="border: 1px solid #000; padding: 4px 2px; text-align: center;">${row.querySelector('.year').value}</td>
                    <td style="border: 1px solid #000; padding: 4px 2px; text-align: center;">${row.querySelector('.houseNo').value}</td>
                    <td style="border: 1px solid #000; padding: 4px 2px; text-align: center;">${row.querySelector('.regNo').value}</td>
                    <td style="border: 1px solid #000; padding: 4px 2px; text-align: left; padding-left: 6px;">${row.querySelector('.voterName').value}</td>
                </tr>
            `;
        });

        // ALL DOTTED LINES USE INLINE STYLES WITH mso-border-bottom-alt
        const htmlContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' 
                  xmlns:w='urn:schemas-microsoft-com:office:word' 
                  xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>2027 පළමු ශ්‍රේණියට සිසුන් ඇතුළත් කිරීම</title>
            </head>
            <body style="font-family: 'Iskoola Pota', 'Noto Sans Sinhala', sans-serif; font-size: 10pt; color: #000;">
                <h2 style="text-align: center; font-size: 14pt; font-weight: bold; margin: 0 0 8px 0;">2027 පළමු ශ්‍රේණියට සිසුන් ඇතුළත් කිරීම</h2>
                
                <!-- Header Info Table - ALL INLINE STYLES -->
                <table style="width: 98%; border: none; margin-bottom: 6px; border-collapse: collapse;">
                    <tr>
                        <td style="width: 38%; border: none; padding: 2px 0;">ඡන්ද ප්‍රදේශය</td>
                        <td style="width: 4%; border: none; padding: 2px 0;">-</td>
                        <td style="width: 58%; border: none; padding: 2px 0;"><span style="display: inline-block; width: 100%; border-bottom: 1px dotted #000; mso-border-bottom-alt: solid black .5pt dotted;">&nbsp;${electoralArea}&nbsp;</span></td>
                    </tr>
                    <tr>
                        <td style="width: 38%; border: none; padding: 2px 0;">ග්‍රාම නිළධාරි වසම හා අංකය</td>
                        <td style="width: 4%; border: none; padding: 2px 0;">-</td>
                        <td style="width: 58%; border: none; padding: 2px 0;"><span style="display: inline-block; width: 100%; border-bottom: 1px dotted #000; mso-border-bottom-alt: solid black .5pt dotted;">&nbsp;${gnDivision}&nbsp;</span></td>
                    </tr>
                    <tr>
                        <td style="width: 38%; border: none; padding: 2px 0;">ඡන්ද කොට්ඨාසය</td>
                        <td style="width: 4%; border: none; padding: 2px 0;">-</td>
                        <td style="width: 58%; border: none; padding: 2px 0;"><span style="display: inline-block; width: 100%; border-bottom: 1px dotted #000; mso-border-bottom-alt: solid black .5pt dotted;">&nbsp;${pollingBooth}&nbsp;</span></td>
                    </tr>
                    <tr>
                        <td style="width: 38%; border: none; padding: 2px 0;">ගම/ වීදිය/ වත්ත</td>
                        <td style="width: 4%; border: none; padding: 2px 0;">-</td>
                        <td style="width: 58%; border: none; padding: 2px 0;"><span style="display: inline-block; width: 100%; border-bottom: 1px dotted #000; mso-border-bottom-alt: solid black .5pt dotted;">&nbsp;${village}&nbsp;</span></td>
                    </tr>
                </table>

                <!-- Main Data Table -->
                <table style="width: 98%; border-collapse: collapse; margin: 4px 0;">
                    <thead>
                        <tr>
                            <th style="width: 11%; border: 1px solid #000; padding: 4px 2px; text-align: center; background-color: #f8f9fa;">වර්ෂය</th>
                            <th style="width: 15%; border: 1px solid #000; padding: 4px 2px; text-align: center; background-color: #f8f9fa;">ගෘහ අංකය</th>
                            <th style="width: 15%; border: 1px solid #000; padding: 4px 2px; text-align: center; background-color: #f8f9fa;">ලියාපදිංචි අංකය</th>
                            <th style="width: 59%; border: 1px solid #000; padding: 4px 2px; text-align: center; background-color: #f8f9fa;">ඡන්ද හිමියාගේ සම්පූර්ණ නම (දෙමාපිය/භාරකරු)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>

                <!-- Footer Table - ALL INLINE STYLES -->
                <table style="width: 98%; border: none; margin-top: 8px; border-collapse: collapse;">
                    <tr>
                        <td colspan="4" style="border: none; padding: 3px 0;">
                            ඉහත දත්ත තොරතුරු ඡන්ද හිමි නාම ලේඛන පරීක්ෂා කොට මවිසින් නිවැරදිව සටහන් කරගත් බව ප්‍රකාශ කරමි.
                        </td>
                    </tr>
                    <tr>
                        <td style="width: 25%; border: none;"></td>
                        <td style="width: 25%; border: none;"></td>
                        <td style="width: 25%; border: none; padding: 20px 0 3px 0;">සකස් කළේ</td>
                        <td style="width: 25%; border: none; padding: 2px 0;">-<span style="display: inline-block; width: 100%; border-bottom: 1px dotted #000; mso-border-bottom-alt: solid black .5pt dotted;">&nbsp;</span></td>
                    </tr>
                    <tr>
                        <td style="width: 25%; border: none;"></td>
                        <td style="width: 25%; border: none;"></td>
                        <td style="width: 25%; border: none; padding: 20px 0 3px 0;">පරීක්ෂා කළේ</td>
                        <td style="width: 25%; border: none; padding: 2px 0;">-<span style="display: inline-block; width: 100%; border-bottom: 1px dotted #000; mso-border-bottom-alt: solid black .5pt dotted;">&nbsp;</span></td>
                    </tr>
                    <tr>
                        <td colspan="2" style="border: none; padding: 18px 0 3px 0; text-align: center;">
                            <span style="display: inline-block; width: 60%; border-bottom: 1px dotted #000; mso-border-bottom-alt: solid black .5pt dotted; margin-bottom: 2px;">&nbsp;</span><br>
                            ඉල්ලුම්කරුගේ අත්සන
                        </td>
                        <td style="width: 25%; border: none;"></td>
                        <td style="width: 25%; border: none;"></td>
                    </tr>
                    <tr>
                        <td colspan="2" style="border: none; padding: 25px 0 4px 0; text-align: center;">
                            ඉහත දත්ත තොරතුරු නිවැරදි බව සහතික කරමි.
                        </td>
                        <td style="width: 25%; border: none;"></td>
                        <td style="width: 25%; border: none;"></td>
                    </tr>
                    <tr>
                        <td colspan="2" style="border: none; padding: 35px 0 4px 0; text-align: center;">
                            <span style="display: inline-block; width: 80%; border-bottom: 1px dotted #000; mso-border-bottom-alt: solid black .5pt dotted;">&nbsp;</span><br>
                            කොට්ඨාස අධ්‍යාපන අධ්‍යක්ෂ - පඬුවස්නුවර
                        </td>
                        <td style="width: 25%; border: none;"></td>
                        <td style="width: 25%; border: none;"></td>
                    </tr>
                </table>
            </body>
            </html>
        `;

        const blob = new Blob(['\ufeff', htmlContent], {
            type: 'application/msword'
        });

        const firstVoterName = document.querySelector('.student-row .voterName').value || 'Form';
        const cleanName = firstVoterName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\u0D80-\u0DFF]/g, '');
        const today = new Date().toISOString().split('T')[0];
        const filename = `Admission_2027_${cleanName}_${today}.doc`;

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        downloadDocBtn.innerHTML = originalText;
        downloadDocBtn.disabled = false;
        setTimeout(() => alert('✅ DOC සාර්ථකව බාගත විය!'), 500);

    } catch (err) {
        console.error("DOC Error:", err);
        downloadDocBtn.innerHTML = originalText;
        downloadDocBtn.disabled = false;
        alert('❌ DOC සකස් කිරීමේදී දෝෂයක් සිදුවිය.');
    }
});