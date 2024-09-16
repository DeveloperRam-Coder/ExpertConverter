import axios from 'axios';
import { saveAs } from 'file-saver';

// Base URL for your API
const API_URL = 'http://localhost:5000/api/upload';

// Function to handle file upload and conversion
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    });

    // Determine file extension and name
    const fileExtension = file.name.split('.').pop();
    const fileName = `converted.${fileExtension}`;

    // Save the converted file
    saveAs(response.data, fileName);
    
    return { success: true, message: 'File converted successfully!' };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { success: false, message: 'Error converting file!' };
  }
};
