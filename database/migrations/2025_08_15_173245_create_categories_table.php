<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id('category_id');
            $table->string('category_name');
            $table->text('category_description')->nullable();
            $table->boolean('is_public')->default(false);
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('update_by')->nullable();
            $table->string('create_by')->nullable();
            $table->softDeletes();
            $table->timestamps();
            
            $table->foreign('parent_id')->references('category_id')->on('categories');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
