<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Like;

class CommunityController extends Controller
{
    public function getPosts()
    {
        return response()->json(['data' => Post::orderBy('created_at', 'desc')->get()], 200);
    }

    public function createPost(Request $request)
    {
        $path = '';
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('posts', 'public');
        }

        $post = Post::create([
            'userName' => $request->userName ?? 'Anonim',
            'destinationName' => $request->destinationName,
            'caption' => $request->caption,
            'imageUrl' => $path ? asset('storage/'.$path) : ''
        ]);
        return response()->json($post, 201);
    }

    public function getComments($postId)
    {
        return response()->json(['data' => Comment::where('post_id', $postId)->get()], 200);
    }

    public function addComment(Request $request, $postId)
    {
        $comment = Comment::create([
            'post_id' => $postId,
            'userName' => $request->userName ?? 'Anonim',
            'text' => $request->text
        ]);
        Post::where('id', $postId)->increment('commentCount');
        return response()->json($comment, 201);
    }

    public function toggleLike(Request $request, $postId)
    {
        $userName = $request->userName ?? 'Anonim';
        $like = Like::where('post_id', $postId)->where('userName', $userName)->first();
        if ($like) {
            $like->delete();
            Post::where('id', $postId)->decrement('likeCount');
        } else {
            Like::create(['post_id' => $postId, 'userName' => $userName]);
            Post::where('id', $postId)->increment('likeCount');
        }
        return response()->json(['message' => 'Toggled'], 200);
    }
}
