<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class DestinationController extends Controller
{
    /**
     * GET /api/destinations
     * Ambil semua data destinasi wisata dari database.
     */
    public function index()
    {
        $destinations = Destination::all();

        return response()->json([
            'status' => 'success',
            'data'   => $destinations
        ]);
    }

    /**
     * POST /api/scan
     * Proxy request scan gambar ke Python AI Flask server (port 5001).
     * Flutter kirim gambar → Laravel → Python AI → Laravel → Flutter
     *
     * Request: multipart/form-data  → field 'image' berisi file gambar
     */
    public function scanLocal(Request $request)
    {
        if (!$request->hasFile('image')) {
            return response()->json([
                'success' => false,
                'error'   => "Field 'image' tidak ditemukan dalam request"
            ], 400);
        }

        $file = $request->file('image');

        // Validasi ekstensi file
        $allowedExt = ['jpg', 'jpeg', 'png', 'webp'];
        $ext = strtolower($file->getClientOriginalExtension());
        if (!in_array($ext, $allowedExt)) {
            return response()->json([
                'success' => false,
                'error'   => "Format file tidak didukung: $ext"
            ], 400);
        }

        try {
            // Kirim ke Python Flask AI (lokal, port 5001)
            $pythonUrl = env('PYTHON_AI_URL', 'http://127.0.0.1:5001');

            $response = Http::timeout(30)
                ->attach('image', file_get_contents($file->getRealPath()), $file->getClientOriginalName())
                ->post("$pythonUrl/scan");

            if ($response->failed()) {
                return response()->json([
                    'success' => false,
                    'error'   => 'Python AI server tidak merespons (status: ' . $response->status() . ')'
                ], 502);
            }

            return response()->json($response->json());

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error'   => 'Gagal menghubungi Python AI: ' . $e->getMessage()
            ], 500);
        }
    }
}
