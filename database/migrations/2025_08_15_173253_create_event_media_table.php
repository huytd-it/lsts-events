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
        Schema::create('event_media', function (Blueprint $table) {
            $table->id('media_id');
            $table->integer('order')->default(0);
            $table->string('media_name');
            $table->string('file_path');
            $table->unsignedBigInteger('event_id');
            $table->boolean('is_show')->default(true);
            $table->string('update_by')->nullable();
            $table->string('create_by')->nullable();
            $table->softDeletes();
            $table->timestamps();
            
            $table->foreign('event_id')->references('event_id')->on('events');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_media');
    }
};
