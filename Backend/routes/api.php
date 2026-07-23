<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DestinationController;
use App\Http\Controllers\Api\CommunityController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::get('/destinations', [DestinationController::class, 'index']);

Route::get('/posts', [CommunityController::class, 'getPosts']);
Route::post('/posts', [CommunityController::class, 'createPost']);
Route::get('/posts/{id}/comments', [CommunityController::class, 'getComments']);
Route::post('/posts/{id}/comments', [CommunityController::class, 'addComment']);
Route::post('/posts/{id}/likes', [CommunityController::class, 'toggleLike']);

use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\VisitHistoryController;

Route::get('/quizzes', [QuizController::class, 'index']);
Route::post('/quizzes/submit', [QuizController::class, 'submitScore']);
Route::get('/history', [VisitHistoryController::class, 'index']);
Route::post('/history/add', [VisitHistoryController::class, 'addVisit']);
Route::post('/scan/save', [VisitHistoryController::class, 'saveScanResult']);  // simpan hasil scan ke DB
Route::post('/scan', [DestinationController::class, 'scanLocal']);

