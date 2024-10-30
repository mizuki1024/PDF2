import { google } from '@googleapis/drive';

export class DriveService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async listPDFs() {
    try {
      const response = await fetch(
        'https://www.googleapis.com/drive/v3/files?' + new URLSearchParams({
          q: "mimeType='application/pdf'",
          fields: 'files(id,name,webViewLink,shared)',
          spaces: 'drive'
        }), {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch PDF files from Drive');
      }

      const data = await response.json();
      return data.files;
    } catch (error) {
      console.error('Error listing PDFs:', error);
      throw error;
    }
  }

  async shareFile(fileId: string) {
    try {
      const permission = {
        type: 'anyone',
        role: 'reader'
      };

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(permission)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to share file');
      }

      return response.json();
    } catch (error) {
      console.error('Error sharing file:', error);
      throw error;
    }
  }

  async uploadPDF(file: File) {
    try {
      const metadata = {
        name: file.name,
        mimeType: 'application/pdf',
      };

      const form = new FormData();
      form.append(
        'metadata',
        new Blob([JSON.stringify(metadata)], { type: 'application/json' })
      );
      form.append('file', file);

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
          body: form,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload file to Drive');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    }
  }

  async downloadPDF(fileId: string) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download file from Drive');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw error;
    }
  }
}