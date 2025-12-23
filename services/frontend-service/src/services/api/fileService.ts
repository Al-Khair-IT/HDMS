/**
 * File Service API Client
 * Handles file uploads and downloads via file-service
 */
import axios from 'axios';
import { ENV } from '../../config/env';

export interface UploadResponse {
    id: string; // uuid
    url: string;
    filename: string;
    size: number;
    content_type: string;
    key: string; // S3/MinIO key
}

class FileService {
    private client = axios.create({
        baseURL: ENV.FILE_SERVICE_URL,
        timeout: 60000, // 60s for large files
    });

    private getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('token');
    }

    /**
     * Upload a file
     * @param file File object
     * @param purpose Optional purpose tag (e.g., 'ticket_attachment', 'avatar')
     * @param ticketId Optional ticket ID to associate with
     * @param onProgress Progress callback
     */
    async uploadFile(
        file: File,
        purpose: string = 'general',
        ticketId?: string,
        onProgress?: (percent: number) => void
    ): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('purpose', purpose);

        if (ticketId) {
            formData.append('ticket_id', ticketId);
        }

        const token = this.getToken();
        const headers: Record<string, string> = {
            'Content-Type': 'multipart/form-data',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await this.client.post<UploadResponse>('/api/files/upload/', formData, {
                headers,
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(percentCompleted);
                    }
                },
            });
            return response.data;
        } catch (error) {
            console.error('File upload failed:', error);
            throw error;
        }
    }

    /**
     * Get file URL (if private/signed URL needed)
     */
    getFileUrl(fileId: string): string {
        return `${ENV.FILE_SERVICE_URL}/api/files/${fileId}/download/`;
    }
}

export const fileService = new FileService();
export default fileService;
