<?php
namespace Database\Seeders;

use App\Models\User;
use App\Models\Destination;
use App\Models\Post;
use App\Models\Quiz;
use App\Models\VisitHistory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── User ──────────────────────────────────────────────────────────────
        $user = User::firstOrCreate(
            ['email' => 'admin@nusaedu.com'],
            [
                'name'     => 'Aditya Nugraha',
                'password' => Hash::make('123456'),
                'points'   => 1250,
                'level'    => 'Penjelajah',
            ]
        );

        // ── Destinations ──────────────────────────────────────────────────────
        $destinations = [
            [
                'name'        => 'Patung KH Zainal Mustofa',
                'description' => 'Pahlawan Perjuangan Tasikmalaya.',
                'category'    => 'Sejarah',
                'latitude'    => -7.3274,
                'longitude'   => 108.1950,
                'imageUrl'    => 'https://images.unsplash.com/photo-1549447250-705a307ef1df?q=80&w=600&auto=format&fit=crop',
                'rating'      => 4.8
            ],
            [
                'name'        => 'Tugu Adipura',
                'description' => 'Monumen kebanggaan kota Tasikmalaya di pusat kota.',
                'category'    => 'Landmark',
                'latitude'    => -7.3323,
                'longitude'   => 108.2065,
                'imageUrl'    => 'https://images.unsplash.com/photo-1565019053331-155890df0eb7?q=80&w=600&auto=format&fit=crop',
                'rating'      => 4.5
            ],
            [
                'name'        => 'Situ Gede',
                'description' => 'Danau alami dengan pemandangan indah untuk bersantai.',
                'category'    => 'Alam',
                'latitude'    => -7.3190,
                'longitude'   => 108.1882,
                'imageUrl'    => 'https://images.unsplash.com/photo-1506466010722-395aa2bef877?q=80&w=600&auto=format&fit=crop',
                'rating'      => 4.7
            ],
            [
                'name'        => 'Alun-Alun Kota Tasikmalaya',
                'description' => 'Alun-Alun Kota Tasikmalaya adalah pusat kota yang menjadi ruang publik utama warga Tasikmalaya. Dilengkapi dengan taman, lampu hias, dan area pedestrian yang nyaman.',
                'category'    => 'Taman & Ruang Publik',
                'latitude'    => -7.3261,
                'longitude'   => 108.2186,
                'imageUrl'    => 'https://images.unsplash.com/photo-1590593162201-f67611a18b87?q=80&w=600&auto=format&fit=crop',
                'rating'      => 4.6
            ],
        ];

        foreach ($destinations as $dest) {
            Destination::firstOrCreate(['name' => $dest['name']], $dest);
        }

        // ── Posts ─────────────────────────────────────────────────────────────
        Post::firstOrCreate(
            ['userName' => 'Dewi Sartika', 'destinationName' => 'Situ Gede'],
            [
                'userAvatar'   => 'https://i.pravatar.cc/150?img=5',
                'caption'      => 'Suasana sore yang sangat menenangkan di Situ Gede! 🌅✨',
                'imageUrl'     => 'https://images.unsplash.com/photo-1506466010722-395aa2bef877?q=80&w=600&auto=format&fit=crop',
                'likeCount'    => 124,
                'commentCount' => 12,
            ]
        );

        // ── Quizzes ───────────────────────────────────────────────────────────
        $quizzes = [
            [
                'question' => 'Siapa tokoh pahlawan perlawanan rakyat Singaparna yang diabadikan dalam patung ikonik ini?',
                'options'  => ['A. Ki Hajar Dewantara', 'B. KH Zainal Mustofa', 'C. R. A. Kartini', 'D. Sultan Agung'],
                'answer'   => 1,
            ],
            [
                'question' => 'Pada tahun berapa KH Zainal Mustofa memimpin perlawanan melawan Jepang?',
                'options'  => ['A. 1920', 'B. 1930', 'C. 1944', 'D. 1950'],
                'answer'   => 2,
            ],
            [
                'question' => 'Alun-Alun Kota Tasikmalaya terletak di kecamatan apa?',
                'options'  => ['A. Cipedes', 'B. Cihideung', 'C. Tawang', 'D. Mangkubumi'],
                'answer'   => 2,
            ],
        ];

        foreach ($quizzes as $quiz) {
            Quiz::firstOrCreate(['question' => $quiz['question']], $quiz);
        }

        // ── Visit History ─────────────────────────────────────────────────────
        if (VisitHistory::where('user_id', $user->id)->count() === 0) {
            VisitHistory::create([
                'user_id'          => $user->id,
                'destination_name' => 'Patung KH Zainal Mustofa',
                'date'             => '24 Mar 2026',
                'points'           => 50,
                'image_type'       => 'history',
            ]);
            VisitHistory::create([
                'user_id'          => $user->id,
                'destination_name' => 'Tugu Adipura',
                'date'             => '22 Mar 2026',
                'points'           => 30,
                'image_type'       => 'location_city',
            ]);
            VisitHistory::create([
                'user_id'          => $user->id,
                'destination_name' => 'Situ Gede',
                'date'             => '15 Mar 2026',
                'points'           => 40,
                'image_type'       => 'landscape',
            ]);
        }
    }
}