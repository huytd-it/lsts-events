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
        Schema::create('events', function (Blueprint $table) {
            $table->id('event_id');
            $table->unsignedBigInteger('category_id');
            $table->string('path')->nullable();
            $table->string('event_name');
            $table->date('event_date');
            $table->text('description')->nullable();
            $table->string('update_by')->nullable();
            $table->string('create_by')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_big_event')->default(false);
            $table->softDeletes();
            $table->timestamps();
            
            $table->foreign('category_id')->references('category_id')->on('categories');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
