<?php

namespace Pterodactyl\Tests\Integration\Api\Client\Server\Files;

use Mockery\MockInterface;
use Pterodactyl\Models\Subuser;
use Pterodactyl\Models\Permission;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;
use Pterodactyl\Tests\Integration\Api\Client\ClientApiIntegrationTestCase;

class DirectoryRestrictionsTest extends ClientApiIntegrationTestCase
{
    /**
     * Test that a file request naming a path outside the subuser's directory restrictions is
     * refused before it reaches Wings.
     */
    #[\PHPUnit\Framework\Attributes\DataProvider('outsideRequestProvider')]
    public function testRequestOutsideRestrictionsIsRefused(string $endpoint, array $body): void
    {
        [$user, $server] = $this->generateRestrictedAccount();

        $this->mock(DaemonFileRepository::class, fn (MockInterface $mock) => $mock->shouldNotReceive('setServer'));

        $this->actingAs($user)->postJson($this->link($server, $endpoint), $body)->assertForbidden();
    }

    /**
     * Test that a request inside the directory restrictions still reaches Wings.
     */
    public function testRequestInsideRestrictionsReachesWings(): void
    {
        [$user, $server] = $this->generateRestrictedAccount();

        $this->mock(DaemonFileRepository::class, function (MockInterface $mock) {
            $mock->expects('setServer->compressFiles')->with('/plugins', ['Ranks'])->andReturn([
                'name' => 'archive.tar.gz',
                'mime' => 'application/gzip',
            ]);
        });

        $this->actingAs($user)
            ->postJson($this->link($server, '/files/compress'), ['root' => '/plugins', 'files' => ['Ranks']])
            ->assertOk();
    }

    /**
     * Test that a download link is refused for an encoded path that decodes to one outside the
     * directory restrictions, and still issued for a path inside them.
     */
    public function testDownloadChecksTheDecodedPath(): void
    {
        [$user, $server] = $this->generateRestrictedAccount();
        $endpoint = $this->link($server, '/files/download') . '?file=';

        $this->actingAs($user)
            ->getJson($endpoint . rawurlencode('/plugins/%2e%2e/cfg/server.cfg'))
            ->assertForbidden();

        $this->actingAs($user)
            ->getJson($endpoint . rawurlencode('/plugins/Ranks/config.jsonc'))
            ->assertOk()
            ->assertJsonPath('object', 'signed_url');
    }

    /**
     * Test that the server endpoint tells a restricted subuser its own restrictions, and the owner none.
     */
    public function testServerMetaListsTheCallersRestrictions(): void
    {
        [$user, $server] = $this->generateRestrictedAccount();

        $this->actingAs($user)
            ->getJson('/api/client/servers/' . $server->uuid)
            ->assertOk()
            ->assertJsonPath('meta.file_rules', ['/plugins']);

        $this->actingAs($server->user)
            ->getJson('/api/client/servers/' . $server->uuid)
            ->assertOk()
            ->assertJsonPath('meta.file_rules', []);
    }

    public static function outsideRequestProvider(): array
    {
        return [
            'compress' => ['/files/compress', ['root' => '/plugins', 'files' => ['../cfg']]],
            'chmod' => ['/files/chmod', ['root' => '/plugins', 'files' => [['file' => '../cfg/server.cfg', 'mode' => 644]]]],
            'decompress' => ['/files/decompress', ['root' => '/plugins', 'file' => '../backups/full.tar.gz']],
            'pull' => ['/files/pull', ['url' => 'https://example.com/plugin.zip', 'directory' => '/plugins', 'filename' => '../cfg/plugin.zip']],
        ];
    }

    /**
     * @return array{\Pterodactyl\Models\User, \Pterodactyl\Models\Server}
     */
    private function generateRestrictedAccount(): array
    {
        [$user, $server] = $this->generateTestAccount([
            Permission::ACTION_FILE_READ_CONTENT,
            Permission::ACTION_FILE_CREATE,
            Permission::ACTION_FILE_UPDATE,
            Permission::ACTION_FILE_ARCHIVE,
        ]);

        Subuser::query()
            ->where('user_id', $user->id)
            ->where('server_id', $server->id)
            ->firstOrFail()
            ->update(['file_rules' => ['/plugins']]);

        return [$user, $server];
    }
}
