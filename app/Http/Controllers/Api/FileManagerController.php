<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class FileManagerController extends Controller
{
    /**
     * Get directory structure as tree
     */
    public function getDirectoryTree(Request $request): JsonResponse
    {
        try {
            $basePath = $request->get('path', '/');
            $tree = $this->buildDirectoryTree($basePath);
            
            return response()->json([
                'success' => true,
                'data' => $tree
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting directory tree: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get files and folders in a directory
     */
    public function getDirectoryContents(Request $request): JsonResponse
    {
        try {
            $path = $request->get('path', '/');
            $contents = $this->getContents($path);
            
            return response()->json([
                'success' => true,
                'data' => $contents,
                'path' => $path
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting directory contents: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload files to directory
     */
    public function uploadFiles(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'files' => 'required|array',
                'files.*' => 'file|max:51200', // 50MB max
                'path' => 'string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            $uploadPath = $request->get('path', '/uploads');
            $uploadedFiles = [];

            foreach ($request->file('files') as $file) {
                $fileName = $this->generateUniqueFileName($file, $uploadPath);
                $filePath = $file->storeAs($uploadPath, $fileName, 'public');
                
                $uploadedFiles[] = [
                    'id' => uniqid(),
                    'name' => $fileName,
                    'original_name' => $file->getClientOriginalName(),
                    'path' => '/' . $filePath,
                    'url' => Storage::url($filePath),
                    'size' => $file->getSize(),
                    'type' => $file->getMimeType(),
                    'isDirectory' => false,
                    'modified' => now()->toISOString()
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $uploadedFiles,
                'message' => 'Files uploaded successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Upload failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new folder
     */
    public function createFolder(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'path' => 'string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            $basePath = $request->get('path', '/');
            $folderName = $this->sanitizeFolderName($request->name);
            $fullPath = rtrim($basePath, '/') . '/' . $folderName;

            if (Storage::disk('public')->exists($fullPath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Folder already exists'
                ], 400);
            }

            Storage::disk('public')->makeDirectory($fullPath);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => uniqid(),
                    'name' => $folderName,
                    'path' => $fullPath,
                    'isDirectory' => true,
                    'parentPath' => $basePath,
                    'modified' => now()->toISOString()
                ],
                'message' => 'Folder created successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating folder: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete file or folder
     */
    public function delete(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'path' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            $path = $request->path;
            
            if (!Storage::disk('public')->exists($path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File or folder not found'
                ], 404);
            }

            if (Storage::disk('public')->directoryExists($path)) {
                Storage::disk('public')->deleteDirectory($path);
            } else {
                Storage::disk('public')->delete($path);
            }

            return response()->json([
                'success' => true,
                'message' => 'Deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Rename file or folder
     */
    public function rename(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'oldPath' => 'required|string',
                'newName' => 'required|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            $oldPath = $request->oldPath;
            $newName = $this->sanitizeFolderName($request->newName);
            $parentPath = dirname($oldPath);
            $newPath = $parentPath . '/' . $newName;

            if (!Storage::disk('public')->exists($oldPath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File or folder not found'
                ], 404);
            }

            if (Storage::disk('public')->exists($newPath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Name already exists'
                ], 400);
            }

            Storage::disk('public')->move($oldPath, $newPath);

            return response()->json([
                'success' => true,
                'data' => [
                    'oldPath' => $oldPath,
                    'newPath' => $newPath,
                    'newName' => $newName
                ],
                'message' => 'Renamed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error renaming: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get file info
     */
    public function getFileInfo(Request $request): JsonResponse
    {
        try {
            $path = $request->get('path');
            
            if (!Storage::disk('public')->exists($path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File not found'
                ], 404);
            }

            $fullPath = Storage::disk('public')->path($path);
            $isDirectory = is_dir($fullPath);

            $info = [
                'id' => md5($path),
                'name' => basename($path),
                'path' => $path,
                'url' => $isDirectory ? null : Storage::url($path),
                'size' => $isDirectory ? 0 : Storage::disk('public')->size($path),
                'type' => $isDirectory ? 'directory' : mime_content_type($fullPath),
                'isDirectory' => $isDirectory,
                'modified' => date('c', Storage::disk('public')->lastModified($path)),
                'parentPath' => dirname($path)
            ];

            return response()->json([
                'success' => true,
                'data' => $info
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting file info: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Build directory tree recursively
     */
    private function buildDirectoryTree($path = '/', $maxDepth = 3, $currentDepth = 0): array
    {
        if ($currentDepth >= $maxDepth) {
            return [];
        }

        $tree = [];
        $directories = Storage::disk('public')->directories($path);

        foreach ($directories as $directory) {
            $name = basename($directory);
            $tree[] = [
                'key' => $directory,
                'title' => $name,
                'icon' => 'folder',
                'isLeaf' => false,
                'children' => $this->buildDirectoryTree($directory, $maxDepth, $currentDepth + 1)
            ];
        }

        return $tree;
    }

    /**
     * Get contents of a directory
     */
    private function getContents($path): array
    {
        $contents = [];
        
        // Get directories
        $directories = Storage::disk('public')->directories($path);
        foreach ($directories as $directory) {
            $name = basename($directory);
            $contents[] = [
                'id' => md5($directory),
                'name' => $name,
                'path' => $directory,
                'parentPath' => $path,
                'isDirectory' => true,
                'size' => 0,
                'type' => 'directory',
                'modified' => date('c', Storage::disk('public')->lastModified($directory))
            ];
        }

        // Get files
        $files = Storage::disk('public')->files($path);
        foreach ($files as $file) {
            $name = basename($file);
            $fullPath = Storage::disk('public')->path($file);
            
            $contents[] = [
                'id' => md5($file),
                'name' => $name,
                'path' => $file,
                'parentPath' => $path,
                'url' => Storage::url($file),
                'isDirectory' => false,
                'size' => Storage::disk('public')->size($file),
                'type' => mime_content_type($fullPath),
                'modified' => date('c', Storage::disk('public')->lastModified($file))
            ];
        }

        return $contents;
    }

    /**
     * Generate unique file name
     */
    private function generateUniqueFileName($file, $path): string
    {
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $nameWithoutExt = pathinfo($originalName, PATHINFO_FILENAME);
        
        $fileName = $originalName;
        $counter = 1;
        
        while (Storage::disk('public')->exists($path . '/' . $fileName)) {
            $fileName = $nameWithoutExt . '_' . $counter . '.' . $extension;
            $counter++;
        }
        
        return $fileName;
    }

    /**
     * Sanitize folder name
     */
    private function sanitizeFolderName($name): string
    {
        $invalidChars = ['\\', '/', ':', '*', '?', '"', '<', '>', '|'];
        $sanitized = str_replace($invalidChars, '_', $name);
        return preg_replace('/[^a-zA-Z0-9_\s.-]/', '', $sanitized);
    }
}