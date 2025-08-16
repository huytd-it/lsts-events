<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CategoryRequest extends FormRequest
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
            'category_name' => 'required|string|min:2|max:255',
            'category_description' => 'nullable|string|max:1000',
            'is_public' => 'nullable|boolean',
            'parent_id' => 'nullable|integer|exists:categories,category_id',
        ];

        // For update requests, we might want to exclude the current category from uniqueness check
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $categoryId = $this->route('category');
            $rules['category_name'] .= '|unique:categories,category_name,' . $categoryId . ',category_id,deleted_at,NULL';
        } else {
            $rules['category_name'] .= '|unique:categories,category_name,NULL,category_id,deleted_at,NULL';
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'category_name.required' => 'Tên danh mục là bắt buộc.',
            'category_name.min' => 'Tên danh mục phải có ít nhất 2 ký tự.',
            'category_name.max' => 'Tên danh mục không được vượt quá 255 ký tự.',
            'category_name.unique' => 'Tên danh mục đã tồn tại.',
            'category_description.max' => 'Mô tả không được vượt quá 1000 ký tự.',
            'parent_id.exists' => 'Danh mục cha không tồn tại.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert is_public to boolean if it's a string
        if ($this->has('is_public')) {
            $this->merge([
                'is_public' => filter_var($this->is_public, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
            ]);
        }

        // Set default value for is_public if not provided
        if (!$this->has('is_public')) {
            $this->merge(['is_public' => false]);
        }
    }
}