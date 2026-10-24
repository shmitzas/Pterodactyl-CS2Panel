<?php

namespace Pterodactyl\Http\Requests\Api\Client\Account;

use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;

class UpdateDashboardPreferencesRequest extends ClientApiRequest
{
    /**
     * Each key is optional so a client can save one list without resending the others.
     */
    public function rules(): array
    {
        $list = ['sometimes', 'array', 'max:500'];
        $uuid = ['string', 'uuid'];

        return [
            'order' => $list,
            'order.*' => $uuid,
            'power' => $list,
            'power.*' => $uuid,
            'prerelease' => $list,
            'prerelease.*' => $uuid,
        ];
    }
}
