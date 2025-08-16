<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EventRequest;
use App\Models\Event;
use App\Models\EventMedia;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    /**
     * Display a listing of events
     */
    public function index(Request $request): JsonResponse
    {
        $query = Event::query()
            ->whereNull('deleted_at')
            ->with('category:category_id,category_name');

        // Search filter
        if ($request->has('search') && $request->search) {
            $query->where('event_name', 'like', '%' . $request->search . '%');
        }

        // Date filters
        if ($request->has('start_date')) {
            $query->whereDate('event_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('event_date', '<=', $request->end_date);
        }

        // Category filter
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Big event filter
        if ($request->has('is_big_event')) {
            $query->where('is_big_event', $request->is_big_event);
        }

        // Creator filter
        if ($request->has('create_by')) {
            $query->where('create_by', 'like', '%' . $request->create_by . '%');
        }

        // Permission check for non-admin users
        if ($request->has('is_admin') && !Auth::user()->hasPermission('Event_Admin')) {
            $query->where('create_by', 'like', '%' . Auth::id() . '%');
        }

        $events = $query->orderBy('event_date', 'desc')
            ->paginate($request->get('per_page', 15));

        // Add media for each event
        foreach ($events->items() as $event) {
            $event->media = EventMedia::where('event_id', $event->event_id)
                ->where('is_show', 1)
                ->whereNull('deleted_at')
                ->orderBy('order')
                ->get();
        }

        return response()->json([
            'success' => true,
            'data' => $events->items(),
            'total' => $events->total(),
            'per_page' => $events->perPage(),
            'current_page' => $events->currentPage(),
            'last_page' => $events->lastPage()
        ]);
    }

    /**
     * Store a newly created event
     */
    public function store(EventRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            // Check if event name and date combination already exists
            $existing = Event::whereNull('deleted_at')
                ->where('event_name', 'like', $request->event_name)
                ->whereDate('event_date', $request->event_date)
                ->first();

            if ($existing) {
                return response()->json([
                    'success' => false,
                    'msg' => 'Event with same name and date already exists',
                    'errors' => ['unique' => 'Event name and date combination must be unique']
                ], 400);
            }

            // Create event folder path
            $eventDate = \Carbon\Carbon::parse($request->event_date);
            $sanitizedName = $this->sanitizeFolderName($request->event_name);
            $folderPath = '/events/' . $eventDate->format('Y') . '/' . 
                         $eventDate->format('Y-m-d') . ' ' . $sanitizedName;

            $event = Event::create([
                'event_name' => $sanitizedName,
                'event_date' => $request->event_date,
                'event_time' => $request->event_time,
                'location' => $request->location,
                'description' => $request->description,
                'category_id' => $request->category_id,
                'is_big_event' => $request->is_big_event ? 1 : 0,
                'path' => $folderPath,
                'create_by' => Auth::id() . ' - ' . (Auth::user()->name ?? 'System')
            ]);

            // Create event folder
            $this->createEventFolder($folderPath);

            // Write description file
            $this->writeDescriptionFile($folderPath, $request->description);

            // Process media files if provided
            if ($request->has('media') && is_array($request->media)) {
                $this->processEventMedia($event->event_id, $request->media, $folderPath);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $event->load('category'),
                'msg' => 'Event created successfully'
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'msg' => 'Error creating event: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified event
     */
    public function show($id, Request $request): JsonResponse
    {
        $event = Event::whereNull('deleted_at')
            ->with('category:category_id,category_name')
            ->find($id);

        if (!$event) {
            return response()->json([
                'success' => false,
                'msg' => 'Event not found'
            ], 404);
        }

        // Get event media
        $mediaQuery = EventMedia::where('event_id', $event->event_id)
            ->whereNull('deleted_at')
            ->orderBy('order');

        if ($request->has('is_show')) {
            $mediaQuery->where('is_show', $request->is_show);
        }

        $event->media = $mediaQuery->get();

        return response()->json([
            'success' => true,
            'data' => $event
        ]);
    }

    /**
     * Update the specified event
     */
    public function update(EventRequest $request, $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $event = Event::whereNull('deleted_at')->find($id);

            if (!$event) {
                return response()->json([
                    'success' => false,
                    'msg' => 'Event not found'
                ], 404);
            }

            // Check if event name and date combination already exists (excluding current event)
            $existing = Event::whereNull('deleted_at')
                ->where('event_id', '!=', $id)
                ->where('event_name', 'like', $request->event_name)
                ->whereDate('event_date', $request->event_date)
                ->first();

            if ($existing) {
                return response()->json([
                    'success' => false,
                    'msg' => 'Event with same name and date already exists',
                    'errors' => ['unique' => 'Event name and date combination must be unique']
                ], 400);
            }

            $oldPath = $event->path;
            $sanitizedName = $this->sanitizeFolderName($request->event_name);

            // Create new event folder path
            $eventDate = \Carbon\Carbon::parse($request->event_date);
            $newFolderPath = '/events/' . $eventDate->format('Y') . '/' . 
                            $eventDate->format('Y-m-d') . ' ' . $sanitizedName;

            // Update event
            $event->update([
                'event_name' => $sanitizedName,
                'event_date' => $request->event_date,
                'event_time' => $request->event_time,
                'location' => $request->location,
                'description' => $request->description,
                'category_id' => $request->category_id,
                'is_big_event' => $request->is_big_event ? 1 : 0,
                'path' => $newFolderPath,
                'update_by' => Auth::id() . ' - ' . (Auth::user()->name ?? 'System')
            ]);

            // Create new folder and move files if path changed
            if ($oldPath !== $newFolderPath) {
                $this->createEventFolder($newFolderPath);
                $this->moveEventFiles($oldPath, $newFolderPath);
            }

            // Update description file
            $this->writeDescriptionFile($newFolderPath, $request->description);

            // Process media files if provided
            if ($request->has('media') && is_array($request->media)) {
                // Clear existing media first for update
                EventMedia::where('event_id', $event->event_id)->delete();
                $this->processEventMedia($event->event_id, $request->media, $newFolderPath);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $event->fresh()->load('category'),
                'msg' => 'Event updated successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'msg' => 'Error updating event: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified event
     */
    public function destroy($id): JsonResponse
    {
        try {
            $event = Event::whereNull('deleted_at')->find($id);

            if (!$event) {
                return response()->json([
                    'success' => false,
                    'msg' => 'Event not found'
                ], 404);
            }

            // Permission check for non-admin users
            if (!Auth::user()->hasPermission('Event_Admin')) {
                $createBy = $event->create_by;
                if (strpos($createBy, (string)Auth::id()) !== 0) {
                    return response()->json([
                        'success' => false,
                        'msg' => 'Unauthorized to delete this event'
                    ], 403);
                }
            }

            // Soft delete event
            $event->update(['deleted_at' => now()]);

            // Optionally delete event folder and files
            // $this->deleteEventFolder($event->path);

            return response()->json([
                'success' => true,
                'msg' => 'Event deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'msg' => 'Error deleting event: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload files for events
     */
    public function upload(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'file_data' => 'required|array',
                'file_data.*' => 'file|mimes:jpg,jpeg,png,gif,mp4,avi,mov,wmv|max:524288' // 512MB max
            ]);

            $uploadedFiles = [];
            $targetDir = '/uploads/temp';

            foreach ($request->file('file_data') as $file) {
                $extension = $file->getClientOriginalExtension();
                $filename = bin2hex(random_bytes(10)) . '.' . $extension;
                $path = $file->storeAs($targetDir, $filename, 'public');

                $uploadedFiles[] = [
                    'file_path' => '/storage/' . $path,
                    'file_name' => $filename,
                    'original_name' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType()
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $uploadedFiles
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Upload failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available years
     */
    public function getYears(): JsonResponse
    {
        $years = Event::whereNull('deleted_at')
            ->selectRaw('YEAR(event_date) as year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year');

        return response()->json([
            'success' => true,
            'data' => $years
        ]);
    }

    /**
     * Get event statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $totalEvents = Event::whereNull('deleted_at')->count();
            $upcomingEvents = Event::whereNull('deleted_at')
                ->where('event_date', '>=', now()->toDateString())
                ->count();
            $bigEvents = Event::whereNull('deleted_at')
                ->where('is_big_event', 1)
                ->count();
            $categoriesWithEvents = Event::whereNull('deleted_at')
                ->distinct('category_id')
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_events' => $totalEvents,
                    'upcoming_events' => $upcomingEvents,
                    'big_events' => $bigEvents,
                    'categories_with_events' => $categoriesWithEvents
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'msg' => 'Error getting statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sanitize folder name
     */
    private function sanitizeFolderName($folderName): string
    {
        $invalidChars = ['\\', '/', ':', '*', '?', '"', '<', '>', '|'];
        $sanitized = str_replace($invalidChars, '_', $folderName);
        return preg_replace('/[^a-zA-Z0-9_\s.-]/', '', $sanitized);
    }

    /**
     * Create event folder
     */
    private function createEventFolder($folderPath): void
    {
        $fullPath = storage_path('app/public' . $folderPath);
        if (!file_exists($fullPath)) {
            mkdir($fullPath, 0777, true);
        }
    }

    /**
     * Write description file
     */
    private function writeDescriptionFile($folderPath, $content): void
    {
        $filePath = storage_path('app/public' . $folderPath . '/description.txt');
        file_put_contents($filePath, $content);
    }

    /**
     * Process event media
     */
    private function processEventMedia($eventId, $mediaData, $folderPath): void
    {
        // Validate event ID
        if (!$eventId) {
            \Log::error('processEventMedia: Event ID is null or empty', [
                'eventId' => $eventId,
                'mediaData' => $mediaData
            ]);
            throw new \Exception('Event ID is required for media processing');
        }

        \Log::info('processEventMedia: Processing media', [
            'eventId' => $eventId,
            'mediaCount' => count($mediaData),
            'folderPath' => $folderPath
        ]);

        foreach ($mediaData as $index => $media) {
            // Skip if media doesn't have file_path
            if (!isset($media['file_path']) || empty($media['file_path'])) {
                \Log::warning('processEventMedia: Skipping media without file_path', [
                    'index' => $index,
                    'media' => $media
                ]);
                continue;
            }

            // Check if this is existing media (has media_id) or new media
            if (isset($media['media_id']) && $media['media_id']) {
                // Update existing media
                $existingMedia = EventMedia::find($media['media_id']);
                if ($existingMedia) {
                    $existingMedia->update([
                        'media_name' => $media['media_name'] ?? $existingMedia->media_name,
                        'is_show' => $media['is_show'] ?? $existingMedia->is_show,
                        'order' => $media['order'] ?? $existingMedia->order
                    ]);
                    \Log::info('processEventMedia: Updated existing media', ['media_id' => $media['media_id']]);
                }
                continue;
            }

            $newFilePath = $this->moveFileToEventFolder($media['file_path'], $folderPath);
            
            $mediaRecord = [
                'event_id' => $eventId,
                'file_path' => $newFilePath,
                'file_name' => $media['file_name'] ?? basename($newFilePath),
                'media_name' => $media['media_name'] ?? $media['file_name'] ?? basename($newFilePath),
                'is_show' => $media['is_show'] ?? 1,
                'order' => $media['order'] ?? 0
            ];

            \Log::info('processEventMedia: Creating new media record', $mediaRecord);
            
            EventMedia::create($mediaRecord);
        }
    }

    /**
     * Move file to event folder
     */
    private function moveFileToEventFolder($oldPath, $newFolder): string
    {
        $fileName = basename($oldPath);
        $oldFullPath = storage_path('app/public' . str_replace('/storage/', '/', $oldPath));
        $newFullPath = storage_path('app/public' . $newFolder . '/' . $fileName);

        if (file_exists($oldFullPath)) {
            $this->createEventFolder($newFolder);
            if (rename($oldFullPath, $newFullPath)) {
                return '/storage' . $newFolder . '/' . $fileName;
            }
        }

        return $oldPath;
    }

    /**
     * Move event files to new folder
     */
    private function moveEventFiles($oldPath, $newPath): void
    {
        $oldFullPath = storage_path('app/public' . $oldPath);
        $newFullPath = storage_path('app/public' . $newPath);

        if (file_exists($oldFullPath) && $oldPath !== $newPath) {
            $this->createEventFolder($newPath);
            $this->recursiveCopy($oldFullPath, $newFullPath);
            $this->deleteDirectory($oldFullPath);
        }
    }

    /**
     * Recursively copy directory
     */
    private function recursiveCopy($src, $dst): void
    {
        $dir = opendir($src);
        @mkdir($dst);
        
        while (($file = readdir($dir)) !== false) {
            if ($file != '.' && $file != '..') {
                if (is_dir($src . '/' . $file)) {
                    $this->recursiveCopy($src . '/' . $file, $dst . '/' . $file);
                } else {
                    copy($src . '/' . $file, $dst . '/' . $file);
                }
            }
        }
        
        closedir($dir);
    }

    /**
     * Delete directory recursively
     */
    private function deleteDirectory($dir): void
    {
        if (!file_exists($dir)) return;

        $files = array_diff(scandir($dir), ['.', '..']);
        
        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            is_dir($path) ? $this->deleteDirectory($path) : unlink($path);
        }
        
        rmdir($dir);
    }
}