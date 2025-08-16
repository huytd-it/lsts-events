<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EventRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        $rules = [
            'event_name' => 'required|string|min:5|max:255',
            'event_date' => 'required|date|after_or_equal:today',
            'event_time' => 'nullable|date_format:H:i',
            'location' => 'required|string|max:255',
            'description' => 'required|string|min:10|max:5000',
            'category_id' => 'required|integer|exists:categories,category_id',
            'is_big_event' => 'nullable|boolean',
            'media' => 'nullable|array',
            'media.*.file_path' => 'nullable|string',
            'media.*.file_name' => 'nullable|string',
            'media.*.is_show' => 'nullable|boolean',
            'media.*.order' => 'nullable|integer|min:0',
        ];

        // For update requests, modify unique validation
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $eventId = $this->route('event');
            // Custom unique validation will be handled in the controller
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'event_name.required' => 'Tên sự kiện là bắt buộc.',
            'event_name.min' => 'Tên sự kiện phải có ít nhất 5 ký tự.',
            'event_name.max' => 'Tên sự kiện không được vượt quá 255 ký tự.',
            'event_date.required' => 'Ngày sự kiện là bắt buộc.',
            'event_date.date' => 'Ngày sự kiện không hợp lệ.',
            'event_date.after_or_equal' => 'Ngày sự kiện không được là ngày trong quá khứ.',
            'event_time.date_format' => 'Thời gian sự kiện không hợp lệ (định dạng HH:mm).',
            'location.required' => 'Địa điểm là bắt buộc.',
            'location.max' => 'Địa điểm không được vượt quá 255 ký tự.',
            'description.required' => 'Mô tả sự kiện là bắt buộc.',
            'description.min' => 'Mô tả sự kiện phải có ít nhất 10 ký tự.',
            'description.max' => 'Mô tả sự kiện không được vượt quá 5000 ký tự.',
            'category_id.required' => 'Danh mục sự kiện là bắt buộc.',
            'category_id.exists' => 'Danh mục sự kiện không tồn tại.',
            'media.array' => 'Dữ liệu media không hợp lệ.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert is_big_event to boolean if it's a string
        if ($this->has('is_big_event')) {
            $this->merge([
                'is_big_event' => filter_var($this->is_big_event, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
            ]);
        }

        // Set default value for is_big_event if not provided
        if (!$this->has('is_big_event')) {
            $this->merge(['is_big_event' => false]);
        }

        // Decode media JSON if it's a string
        if ($this->has('media') && is_string($this->media)) {
            $this->merge([
                'media' => json_decode($this->media, true)
            ]);
        }

        // Set default event_time if not provided
        if (!$this->has('event_time') && $this->has('event_date')) {
            $this->merge(['event_time' => '09:00']);
        }
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Additional custom validations can be added here
            
            // Validate category exists and is not deleted
            if ($this->category_id) {
                $category = \App\Models\Category::whereNull('deleted_at')
                    ->find($this->category_id);
                
                if (!$category) {
                    $validator->errors()->add('category_id', 'Danh mục đã chọn không tồn tại hoặc đã bị xóa.');
                }
            }

            // Validate media files if provided
            if ($this->has('media') && is_array($this->media)) {
                foreach ($this->media as $index => $media) {
                    if (isset($media['file_path']) && !empty($media['file_path'])) {
                        // Check if file exists (for temporary uploaded files)
                        $filePath = storage_path('app/public' . str_replace('/storage/', '/', $media['file_path']));
                        if (!file_exists($filePath)) {
                            $validator->errors()->add("media.{$index}.file_path", "File không tồn tại: {$media['file_path']}");
                        }
                    }
                }
            }
        });
    }
}