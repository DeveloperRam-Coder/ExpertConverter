const { PDFDocument } = require('pdf-lib');
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Helper function to delete the uploaded file after processing
const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) console.error(`Error deleting file: ${filePath}`);
  });
};

exports.processFile = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../uploads', req.file.filename);
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    // Process PDF files
    if (fileExtension === '.pdf') {
      const existingPdfBytes = fs.readFileSync(filePath);
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pdfBytes = await pdfDoc.save();

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="converted.pdf"',
      });
      res.send(pdfBytes);
    }
    // Process DOCX files
    else if (fileExtension === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      res.json({ text: result.value });
    }
    // Process XLSX files
    else if (fileExtension === '.xlsx') {
      const workbook = XLSX.readFile(filePath);
      const sheetNames = workbook.SheetNames;
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
      res.json(data);
    }
    else {
      res.status(400).json({ message: 'Unsupported file format' });
    }

    // Delete the file after processing
    deleteFile(filePath);
  } catch (err) {
    res.status(500).json({ message: 'Error processing file', error: err.message });
  }
};
