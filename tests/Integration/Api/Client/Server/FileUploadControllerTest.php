<?php

namespace Pterodactyl\Tests\Integration\Api\Client\Server;

use Pterodactyl\Models\Permission;
use Pterodactyl\Tests\Integration\Api\Client\ClientApiIntegrationTestCase;

class FileUploadControllerTest extends ClientApiIntegrationTestCase
{
    public function testUploadUrlIsReturned(): void
    {
        [$user, $server] = $this->generateTestAccount([Permission::ACTION_FILE_CREATE]);

        $this->actingAs($user)->getJson($this->link($server, '/files/upload'))
            ->assertOk()
            ->assertJsonPath('object', 'signed_url');
    }

    public function testUploadUrlIsDeniedForSubuserWithDirectoryRestrictions(): void
    {
        [$user, $server] = $this->generateTestAccount([Permission::ACTION_FILE_CREATE]);

        $server->subusers()->firstOrFail()->update(['file_rules' => ['/plugins']]);

        $this->actingAs($user)->getJson($this->link($server, '/files/upload'))
            ->assertForbidden()
            ->assertJsonPath('errors.0.detail', 'File uploads are not available to users with directory restrictions.');
    }
}
