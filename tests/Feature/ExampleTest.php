<?php

test('guests visiting home are redirected to login', function () {
    $response = $this->get(route('home'));

    $response->assertRedirect(route('login'));
});
