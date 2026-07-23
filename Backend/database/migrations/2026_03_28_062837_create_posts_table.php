<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('userName');
            $table->string('userAvatar')->nullable();
            $table->string('destinationName');
            $table->text('caption')->nullable();
            $table->string('imageUrl');
            $table->integer('likeCount')->default(0);
            $table->integer('commentCount')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};