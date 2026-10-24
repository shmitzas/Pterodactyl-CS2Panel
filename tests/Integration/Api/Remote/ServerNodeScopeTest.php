<?php

namespace Pterodactyl\Tests\Integration\Api\Remote;

use Pterodactyl\Models\Node;
use Pterodactyl\Models\Backup;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\Location;
use Pterodactyl\Models\Allocation;
use Pterodactyl\Models\ServerTransfer;
use Pterodactyl\Tests\Integration\IntegrationTestCase;

/**
 * A node's daemon token may only fetch or report on the servers that node hosts. Upstream
 * shipped this scoping (7c9c56bf) without tests.
 */
class ServerNodeScopeTest extends IntegrationTestCase
{
    private Server $server;

    public function setUp(): void
    {
        parent::setUp();

        $this->server = $this->createServerModel();
    }

    public function testNodeCanFetchDetailsForItsOwnServer(): void
    {
        $this->actingAsNode($this->server->node)
            ->getJson("/api/remote/servers/{$this->server->uuid}")
            ->assertOk();
    }

    public function testOtherNodeCannotFetchOrUpdateTheServer(): void
    {
        $node = Node::factory()->for(Location::factory())->create();

        $this->actingAsNode($node)
            ->getJson("/api/remote/servers/{$this->server->uuid}")
            ->assertForbidden();

        $this->actingAsNode($node)
            ->getJson("/api/remote/servers/{$this->server->uuid}/install")
            ->assertForbidden();

        $this->actingAsNode($node)
            ->postJson("/api/remote/servers/{$this->server->uuid}/install", ['successful' => false])
            ->assertForbidden();

        $this->assertNull($this->server->refresh()->status);
    }

    public function testTransferTargetNodeCanFetchServerDetails(): void
    {
        $new = Node::factory()->for(Location::factory())->has(Allocation::factory())->create();

        ServerTransfer::factory()->for($this->server)->create([
            'old_allocation' => $this->server->allocation_id,
            'new_allocation' => $new->allocations->first()->id,
            'new_node' => $new->id,
            'old_node' => $this->server->node_id,
        ]);

        $this->actingAsNode($new)
            ->getJson("/api/remote/servers/{$this->server->uuid}")
            ->assertOk();
    }

    public function testOnlyTheHostingNodeCanReportBackupRestoreStatus(): void
    {
        $this->server->update(['status' => Server::STATUS_RESTORING_BACKUP]);
        $backup = Backup::factory()->create(['server_id' => $this->server->id]);
        $node = Node::factory()->for(Location::factory())->create();

        $this->actingAsNode($node)
            ->postJson("/api/remote/backups/{$backup->uuid}/restore", ['successful' => true])
            ->assertForbidden();

        $this->assertSame(Server::STATUS_RESTORING_BACKUP, $this->server->refresh()->status);

        $this->actingAsNode($this->server->node)
            ->postJson("/api/remote/backups/{$backup->uuid}/restore", ['successful' => true])
            ->assertNoContent();

        $this->assertNull($this->server->refresh()->status);
    }

    private function actingAsNode(Node $node): static
    {
        return $this->withHeader('Authorization', "Bearer {$node->daemon_token_id}." . $node->getDecryptedKey());
    }
}
