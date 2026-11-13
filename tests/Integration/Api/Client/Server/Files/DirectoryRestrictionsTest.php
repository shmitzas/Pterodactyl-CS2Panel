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
