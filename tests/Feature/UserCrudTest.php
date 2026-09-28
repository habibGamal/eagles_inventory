<?php

use App\Models\User;

test('guests are redirected from users page', function () {
    $response = $this->get(route('users.index'));

    $response->assertRedirect(route('login'));
});

test('authenticated user can view users list', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('users.index'));

    $response->assertOk();
});

test('authenticated user can create a new user', function () {
    $admin = User::factory()->create();

    $response = $this->actingAs($admin)->post(route('users.store'), [
        'name' => 'موظف مستودع جديد',
        'email' => 'storekeeper@eagles.com',
        'password' => 'Secret12345!',
        'is_active' => true,
    ]);

    $response->assertRedirect(route('users.index'));
    $this->assertDatabaseHas('users', [
        'email' => 'storekeeper@eagles.com',
        'name' => 'موظف مستودع جديد',
    ]);
});

test('creating user requires valid data', function () {
    $admin = User::factory()->create();

    $response = $this->actingAs($admin)->post(route('users.store'), [
        'name' => '',
        'email' => 'invalid-email',
        'password' => 'short',
    ]);

    $response->assertSessionHasErrors(['name', 'email', 'password']);
});

test('authenticated user can update another user', function () {
    $admin = User::factory()->create();
    $targetUser = User::factory()->create([
        'name' => 'اسم قديم',
        'email' => 'old@eagles.com',
    ]);

    $response = $this->actingAs($admin)->put(route('users.update', $targetUser), [
        'name' => 'اسم معدل',
        'email' => 'updated@eagles.com',
        'is_active' => true,
    ]);

    $response->assertRedirect(route('users.index'));
    $targetUser->refresh();
    expect($targetUser->name)->toBe('اسم معدل');
    expect($targetUser->email)->toBe('updated@eagles.com');
});

test('authenticated user can delete another user', function () {
    $admin = User::factory()->create();
    $targetUser = User::factory()->create();

    $response = $this->actingAs($admin)->delete(route('users.destroy', $targetUser));

    $response->assertRedirect(route('users.index'));
    $this->assertModelMissing($targetUser);
});

test('authenticated user cannot delete themselves', function () {
    $admin = User::factory()->create();

    $response = $this->actingAs($admin)->delete(route('users.destroy', $admin));

    $this->assertModelExists($admin);
});
