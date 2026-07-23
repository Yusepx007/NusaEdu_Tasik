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
        Schema::create('visit_histories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('destination_name');
            $table->string('wisata_key')->nullable();
            $table->string('date');
            $table->integer('points')->default(10);
            $table->string('image_type')->default('location_on');
            $table->decimal('confidence', 5, 2)->default(0);
            $table->string('lokasi')->nullable();
            $table->string('kategori')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visit_histories');
    }
};

