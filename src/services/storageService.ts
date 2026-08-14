import { PageImageItem } from '../types';

export interface UploadProgressCallback {
  (progress: number, fileName: string): void;
}

export interface StorageAdapter {
  uploadFile(file: File, path: string, onProgress?: UploadProgressCallback): Promise<PageImageItem>;
  deleteFile(fileId: string): Promise<boolean>;
  getFileUrl(fileId: string): Promise<string>;
}

/**
 * Local IndexedDB / Memory Storage Service (Abstraction Layer)
 * Sẵn sàng để chuyển sang Firebase Storage / Cloud Storage mà không phải đổi logic UI.
 */
class DocumentStorageService implements StorageAdapter {
  private inMemoryCache: Map<string, string> = new Map();

  /**
   * Chuyển đổi File (JPG, JPEG, PNG, PDF) thành Object URL / DataURL
   * Trong thực tế khi kết nối Firebase Storage, phương thức này sẽ gọi:
   * uploadBytesResumable(storageRef, file) và getDownloadURL()
   */
  public async uploadFile(
    file: File,
    _path: string = 'essays',
    onProgress?: UploadProgressCallback
  ): Promise<PageImageItem> {
    return new Promise((resolve, reject) => {
      try {
        const id = `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        // Giả lập tiến trình upload mượt mà
        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += 25;
          if (onProgress) {
            onProgress(Math.min(currentProgress, 90), file.name);
          }
          if (currentProgress >= 100) {
            clearInterval(interval);
            
            // Xử lý đọc file cục bộ dạng data URL / Blob URL
            const reader = new FileReader();
            reader.onload = (e) => {
              const resultUrl = e.target?.result as string;
              this.inMemoryCache.set(id, resultUrl);
              
              if (onProgress) {
                onProgress(100, file.name);
              }

              const item: PageImageItem = {
                id,
                name: file.name,
                url: resultUrl,
                pageNumber: 1,
                rotation: 0,
                fileSize: file.size,
                mimeType: file.type,
                uploadedAt: new Date().toISOString(),
              };
              resolve(item);
            };
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
          }
        }, 60);
      } catch (err) {
        reject(err);
      }
    });
  }

  public async uploadMultipleFiles(
    files: File[],
    onOverallProgress?: (completed: number, total: number) => void
  ): Promise<PageImageItem[]> {
    const results: PageImageItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploaded = await this.uploadFile(file);
      uploaded.pageNumber = i + 1;
      results.push(uploaded);
      if (onOverallProgress) {
        onOverallProgress(i + 1, files.length);
      }
    }
    return results;
  }

  public async deleteFile(fileId: string): Promise<boolean> {
    this.inMemoryCache.delete(fileId);
    return true;
  }

  public async getFileUrl(fileId: string): Promise<string> {
    return this.inMemoryCache.get(fileId) || '';
  }
}

export const documentStorageService = new DocumentStorageService();
