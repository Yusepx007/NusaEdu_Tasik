<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VisitHistory extends Model
{
    protected $fillable = [
        'user_id', 'destination_name', 'wisata_key',
        'date', 'points', 'image_type',
        'confidence', 'lokasi', 'kategori',
    ];
    //
}

