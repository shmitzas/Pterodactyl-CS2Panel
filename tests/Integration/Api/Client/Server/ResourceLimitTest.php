<?php

namespace Pterodactyl\Tests\Integration\Api\Client\Server;

use Pterodactyl\Tests\Integration\Api\Client\ClientApiIntegrationTestCase;

class ResourceLimitTest extends ClientApiIntegrationTestCase
{
    /**
     * The per-server resource throttles key on the bound server, so they only work
     * when the Kernel's middleware priority runs the client bindings first.
     */
    public function testWebsocketTokenRequestsAreThrottledPerServer(): void
    {
        [$user, $server] = $this->generateTestAccount();
        $other = $this->createServerModel(['owner_id' => $user->id]);

        for ($i = 0; $i < 5; ++$i) {
            $this->actingAs($user)->getJson($this->link($server, '/websocket'))->assertOk();
        }

        $this->actingAs($user)->getJson($this->link($server, '/websocket'))->assertTooManyRequests();
        $this->actingAs($user)->getJson($this->link($other, '/websocket'))->assertOk();
    }
}
