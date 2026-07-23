<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\VisitHistory;

class VisitHistoryController extends Controller
{
    /**
     * GET /api/history?user_id=xxx
     * Ambil riwayat kunjungan user (terbaru duluan)
     */
    public function index(Request $request)
    {
        $query = VisitHistory::query();
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    /**
     * POST /api/history/add
     * Tambah riwayat kunjungan manual
     */
    public function addVisit(Request $request)
    {
        $request->validate([
            'user_id'          => 'required|exists:users,id',
            'destination_name' => 'required|string',
            'points'           => 'required|integer',
            'image_type'       => 'required|string',
        ]);

        $visitHistory = VisitHistory::create([
            'user_id'          => $request->user_id,
            'destination_name' => $request->destination_name,
            'wisata_key'       => $request->wisata_key ?? null,
            'date'             => now()->format('d M Y'),
            'points'           => $request->points,
            'image_type'       => $request->image_type,
            'confidence'       => $request->confidence ?? 0,
            'lokasi'           => $request->lokasi ?? null,
            'kategori'         => $request->kategori ?? null,
        ]);

        // Tambah poin ke user
        $user = \App\Models\User::findOrFail($request->user_id);
        $user->points = ($user->points ?? 0) + $request->points;
        $user->save();

        return response()->json([
            'success' => true,
            'history' => $visitHistory,
            'total_points' => $user->points,
        ], 201);
    }

    /**
     * POST /api/scan/save
     * Dipanggil Flutter setelah scan berhasil — simpan hasil scan ke DB
     * Body JSON:
     * {
     *   "user_id": 1,            (opsional, guest jika null)
     *   "wisata_key": "alun_alun",
     *   "destination_name": "Alun-Alun Kota Tasikmalaya",
     *   "confidence": 91.5,
     *   "lokasi": "Jl. Masjid Agung...",
     *   "kategori": "Taman & Ruang Publik"
     * }
     */
    public function saveScanResult(Request $request)
    {
        $request->validate([
            'destination_name' => 'required|string',
            'wisata_key'       => 'nullable|string',
            'confidence'       => 'nullable|numeric',
            'user_id'          => 'nullable|integer',
            'lokasi'           => 'nullable|string',
            'kategori'         => 'nullable|string',
        ]);

        // Tentukan poin berdasarkan confidence
        $confidence = (float) ($request->confidence ?? 0);
        $points     = match(true) {
            $confidence >= 90 => 20,
            $confidence >= 70 => 15,
            $confidence >= 50 => 10,
            default           => 5,
        };

        // Tentukan image_type dari kategori
        $kategori  = strtolower($request->kategori ?? '');
        $imageType = match(true) {
            str_contains($kategori, 'taman')   => 'landscape',
            str_contains($kategori, 'museum')  => 'museum',
            str_contains($kategori, 'danau')   => 'water',
            str_contains($kategori, 'kota')    => 'location_city',
            str_contains($kategori, 'sejarah') => 'history',
            default                            => 'location_on',
        };

        $visitHistory = VisitHistory::create([
            'user_id'          => $request->user_id,
            'destination_name' => $request->destination_name,
            'wisata_key'       => $request->wisata_key,
            'date'             => now()->format('d M Y'),
            'points'           => $points,
            'image_type'       => $imageType,
            'confidence'       => $confidence,
            'lokasi'           => $request->lokasi,
            'kategori'         => $request->kategori,
        ]);

        // Update poin user jika login
        $totalPoints = 0;
        if ($request->user_id) {
            $user = \App\Models\User::find($request->user_id);
            if ($user) {
                $user->points = ($user->points ?? 0) + $points;
                $user->save();
                $totalPoints = $user->points;
            }
        }

        return response()->json([
            'success'      => true,
            'message'      => "Kunjungan ke {$request->destination_name} disimpan!",
            'points_earned' => $points,
            'total_points' => $totalPoints,
            'history'      => $visitHistory,
        ], 201);
    }
}
