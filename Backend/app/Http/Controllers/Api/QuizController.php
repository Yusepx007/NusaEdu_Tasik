<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Quiz;
use App\Models\User;
use App\Models\VisitHistory;

class QuizController extends Controller
{
    public function index()
    {
        return response()->json(Quiz::all());
    }

    public function submitScore(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'score'   => 'required|integer',
        ]);

        $user = User::findOrFail($request->user_id);
        $user->points += $request->score;
        
        // Update level logic
        if ($user->points >= 1000) {
            $user->level = 'Petualang Epik';
        } elseif ($user->points >= 500) {
            $user->level = 'Pendaki Hebat';
        } elseif ($user->points >= 100) {
            $user->level = 'Penjelajah Aktif';
        }

        $user->save();

        if ($request->score > 0) {
            VisitHistory::create([
                'user_id' => $user->id,
                'destination_name' => 'Menyelesaikan Kuis Interaktif',
                'date' => date('d M Y'),
                'points' => $request->score,
                'image_type' => 'history',
            ]);
        }

        return response()->json([
            'message' => 'Score saved',
            'user' => $user
        ]);
    }
}
